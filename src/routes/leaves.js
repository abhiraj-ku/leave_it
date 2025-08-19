const express = require("express");
const router = express.Router();
const { validate, validationSchemas } = require("../middleware/validation");
const checkRole = require("../middleware/roleCheck");
const { ROLES } = require("../utils/constants");
const {
  applyLeave,
  processLeave,
  getLeaveBalance,
  getEmployeeLeaves,
} = require("../controller/leaveController");

// Apply for leave (open to any role)
router.post("/apply", validate(validationSchemas.applyLeave), applyLeave);

// Process leave (approve/reject) - HR only
router.patch(
  "/:id/process",
  validate(validationSchemas.processLeave),
  checkRole([ROLES.HR]),
  processLeave
);

// Get leave balance for employee
router.get("/balance/:employeeId", getLeaveBalance);

// Get employee leaves
router.get("/employee/:employeeId", getEmployeeLeaves);

module.exports = router;
