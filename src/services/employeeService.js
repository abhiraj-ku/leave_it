const Employee = require("../models/Employee");
const LeaveBalance = require("../models/LeaveBalance");
const logger = require("../utils/logger");
const cache = require("../utils/cache");
const { ANNUAL_LEAVE_QUOTA } = require("../utils/constants");

/**
 * Create a new employee and initialize their leave balance.
 */
const createEmployee = async (employeeData, createdByRole) => {
  try {
    const employee = new Employee({
      ...employeeData,
      createdByRole,
    });

    await employee.save();

    // Create initial leave balance for current year
    const currentYear = new Date().getFullYear();
    const leaveBalance = new LeaveBalance({
      employeeId: employee._id,
      year: currentYear,
      casualLeaveBalance: ANNUAL_LEAVE_QUOTA.CASUAL,
      sickLeaveBalance: ANNUAL_LEAVE_QUOTA.SICK,
    });
    await leaveBalance.save();

    logger.info(`Employee created: ${employee.email}`);
    return employee;
  } catch (error) {
    logger.error("Error creating employee:", error.message);
    throw error;
  }
};

/**
 * Fetch employee by ID (with caching).
 */
const getEmployeeById = async (id) => {
  try {
    const cacheKey = `employee:${id}`;
    let employee = await cache.get(cacheKey);

    if (!employee) {
      employee = await Employee.findById(id);
      if (employee) {
        await cache.set(cacheKey, employee, 1800); // Cache for 30 mins
      }
    }

    return employee;
  } catch (error) {
    logger.error("Error fetching employee:", error.message);
    throw error;
  }
};

/**
 * Fetch employee by email (only active).
 */
const getEmployeeByEmail = async (email) => {
  try {
    return await Employee.findOne({ email, isActive: true });
  } catch (error) {
    logger.error("Error fetching employee by email:", error.message);
    throw error;
  }
};

/**
 * Fetch all active employees (with caching).
 */
const getAllEmployees = async () => {
  try {
    const cacheKey = "employees:all";
    let employees = await cache.get(cacheKey);

    if (!employees) {
      employees = await Employee.find({ isActive: true })
        .select("-__v")
        .sort({ createdAt: -1 });

      await cache.set(cacheKey, employees, 600); // Cache for 10 mins
    }

    return employees;
  } catch (error) {
    logger.error("Error fetching employees:", error.message);
    throw error;
  }
};

module.exports = {
  createEmployee,
  getEmployeeById,
  getEmployeeByEmail,
  getAllEmployees,
};
