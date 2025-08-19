const employeeService = require("../services/employeeService");
const logger = require("../utils/logger");

// Create employee
const createEmployee = async (req, res) => {
  try {
    // Only HR can create employees → already enforced in checkRole
    const employee = await employeeService.createEmployee(req.body, req.userId);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    logger.error("Error in create employee controller:", error.message);

    if (error.code === 11000) {
      // Duplicate key error from MongoDB (email already exists)
      return res.status(409).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.json({
      success: true,
      message: "Successfully fetch all employees",
      data: employees,
    });
  } catch (error) {
    logger.error("Error in get employees controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Successfully fetch employee by id",
      data: employee,
    });
  } catch (error) {
    logger.error("Error in get employee controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
};
