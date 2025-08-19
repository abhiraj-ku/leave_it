const Leave = require("../models/Leave");
const LeaveBalance = require("../models/LeaveBalance");
const employeeService = require("./employeeService");
const logger = require("../utils/logger");
const cache = require("../utils/cache");
const moment = require("moment");
const { LEAVE_TYPES, LEAVE_STATUS } = require("../utils/constants");

// Helper functions
/**
 * Calculate working days between two dates (excluding weekends).
 */
const calculateWorkingDays = async (startDate, endDate) => {
  let workingDays = 0;
  const current = moment(startDate);

  while (current.isSameOrBefore(endDate, "day")) {
    if (current.day() !== 0 && current.day() !== 6) {
      workingDays++;
    }
    current.add(1, "day");
  }

  return workingDays;
};

/**
 * Check if employee has overlapping leaves.
 */
const checkOverlappingLeaves = async (employeeId, startDate, endDate) => {
  const overlapping = await Leave.findOne({
    employeeId,
    status: { $in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
    ],
  });

  return !!overlapping;
};

/**
 * Update leave balance after approval.
 */
const updateLeaveBalance = async (leave) => {
  const currentYear = new Date().getFullYear();
  const leaveBalance = await LeaveBalance.findOne({
    employeeId: leave.employeeId,
    year: currentYear,
  });

  if (leave.type === LEAVE_TYPES.SICK) {
    leaveBalance.sickLeaveBalance -= leave.totalDays;
    leaveBalance.sickLeaveUsed += leave.totalDays;
  } else {
    leaveBalance.casualLeaveBalance -= leave.totalDays;
    leaveBalance.casualLeaveUsed += leave.totalDays;
  }

  await leaveBalance.save();
};

/** ACTUAL SERVICES STARTS HERE
 * Apply leave.
 */
const applyLeave = async (leaveData) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = leaveData;

    // Validate employee exists
    const employee = await employeeService.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Validate dates
    const start = moment(startDate);
    const end = moment(endDate);
    const joining = moment(employee.joiningDate);

    if (start.isAfter(end)) {
      throw new Error("Start date cannot be after end date");
    }

    if (start.isBefore(joining, "day")) {
      throw new Error("Cannot apply for leave before joining date");
    }

    // Calculate total days (excluding weekends)
    const totalDays = await calculateWorkingDays(start, end);
    if (totalDays <= 0) {
      throw new Error("Invalid leave duration");
    }

    // Check overlapping
    const hasOverlap = await checkOverlappingLeaves(
      employeeId,
      start.toDate(),
      end.toDate()
    );
    if (hasOverlap) {
      throw new Error("Leave request overlaps with existing leave");
    }

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      employeeId,
      year: currentYear,
    });
    if (!leaveBalance) {
      throw new Error("Leave balance not found");
    }

    const availableBalance =
      type === LEAVE_TYPES.SICK
        ? leaveBalance.sickLeaveBalance
        : leaveBalance.casualLeaveBalance;

    if (totalDays > availableBalance) {
      throw new Error(
        `Insufficient ${type} leave balance. Available: ${availableBalance} days`
      );
    }

    // Create leave request
    const leave = new Leave({
      employeeId,
      type,
      startDate: start.toDate(),
      endDate: end.toDate(),
      totalDays,
      reason,
    });

    await leave.save();

    // Clear cache
    await cache.del(`leaves:employee:${employeeId}`);
    await cache.del(`leave_balance:${employeeId}:${currentYear}`);

    logger.info(`Leave applied: ${leave._id} for employee ${employeeId}`);
    return leave;
  } catch (error) {
    logger.error("Error applying leave:", error.message);
    throw error;
  }
};

/**
 * Process leave request (approve/reject).
 */
const processLeave = async (leaveId, action, hrId, comments) => {
  try {
    const leave = await Leave.findById(leaveId).populate("employeeId");
    if (!leave) throw new Error("Leave request not found");
    if (leave.status !== LEAVE_STATUS.PENDING) {
      throw new Error("Leave request already processed");
    }

    const newStatus =
      action === "approve" ? LEAVE_STATUS.APPROVED : LEAVE_STATUS.REJECTED;

    leave.status = newStatus;
    leave.approvedBy = hrId;
    leave.approvedAt = new Date();
    leave.comments = comments || "";

    await leave.save();

    if (newStatus === LEAVE_STATUS.APPROVED) {
      await updateLeaveBalance(leave);
    }

    // Clear cache
    await cache.del(`leaves:employee:${leave.employeeId._id}`);
    await cache.del(
      `leave_balance:${leave.employeeId._id}:${new Date().getFullYear()}`
    );

    logger.info(`Leave ${action}ed: ${leaveId} by HR ${hrId}`);
    return leave;
  } catch (error) {
    logger.error("Error processing leave:", error.message);
    throw error;
  }
};

/**
 * Get leave balance of employee.
 */
const getLeaveBalance = async (employeeId) => {
  try {
    const currentYear = new Date().getFullYear();
    const cacheKey = `leave_balance:${employeeId}:${currentYear}`;

    let balance = await cache.get(cacheKey);
    if (!balance) {
      balance = await LeaveBalance.findOne({ employeeId, year: currentYear });
      if (!balance) throw new Error("Leave balance not found");
      await cache.set(cacheKey, balance, 1800);
    }

    return {
      casualLeave: {
        total: balance.casualLeaveBalance + balance.casualLeaveUsed,
        used: balance.casualLeaveUsed,
        remaining: balance.casualLeaveBalance,
      },
      sickLeave: {
        total: balance.sickLeaveBalance + balance.sickLeaveUsed,
        used: balance.sickLeaveUsed,
        remaining: balance.sickLeaveBalance,
      },
    };
  } catch (error) {
    logger.error("Error fetching leave balance:", error.message);
    throw error;
  }
};

/**
 * Get all leaves for an employee.
 */
const getEmployeeLeaves = async (employeeId) => {
  try {
    const cacheKey = `leaves:employee:${employeeId}`;
    let leaves = await cache.get(cacheKey);

    if (!leaves) {
      leaves = await Leave.find({ employeeId })
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 });

      await cache.set(cacheKey, leaves, 600);
    }

    return leaves;
  } catch (error) {
    logger.error("Error fetching employee leaves:", error.message);
    throw error;
  }
};

// Export all as functions
module.exports = {
  applyLeave,
  processLeave,
  getLeaveBalance,
  getEmployeeLeaves,
};
