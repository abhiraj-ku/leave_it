const leaveService = require("../services/leaveService");
const logger = require("../utils/logger");

// Apply for leave
const applyLeave = async (req, res) => {
  try {
    const leave = await leaveService.applyLeave(req.body);
    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  } catch (error) {
    logger.error("Error in apply leave controller:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Process leave (approve/reject)
const processLeave = async (req, res) => {
  try {
    const { action, hrId, comments } = req.body;
    const leave = await leaveService.processLeave(
      req.params.id,
      action,
      hrId,
      comments
    );

    res.json({
      success: true,
      message: `Leave request ${action}ed successfully`,
      data: leave,
    });
  } catch (error) {
    logger.error("Error in process leave controller:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get leave balance
const getLeaveBalance = async (req, res) => {
  try {
    const balance = await leaveService.getLeaveBalance(req.params.employeeId);
    res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    logger.error("Error in get leave balance controller:", error.message);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Get employee leaves
const getEmployeeLeaves = async (req, res) => {
  try {
    const leaves = await leaveService.getEmployeeLeaves(req.params.employeeId);
    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    logger.error("Error in get employee leaves controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  applyLeave,
  processLeave,
  getLeaveBalance,
  getEmployeeLeaves,
};
