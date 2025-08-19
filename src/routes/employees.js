const express = require("express");
const router = express.Router();
const { validate, validationSchemas } = require("../middleware/validation");
const checkRole = require("../middleware/roleCheck");
const { ROLES } = require("../utils/constants");
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
} = require("../controller/employeeController");

// Create employee (HR only)
router.post(
  "/",
  validate(validationSchemas.createEmployee),
  checkRole([ROLES.HR]),
  createEmployee
);

// Get all employees (HR only)
router.get("/", checkRole([ROLES.HR]), getAllEmployees);

// Get employee by ID
router.get("/:id", getEmployeeById);

module.exports = router;
