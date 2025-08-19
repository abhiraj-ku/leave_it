const Joi = require("joi");
const { LEAVE_TYPES, ROLES } = require("../utils/constants");
const { min } = require("moment");

const validationSchemas = {
  createEmployee: Joi.object({
    userId: Joi.string().min(16).required(),
    userRole: Joi.string()
      .valid(...Object.values(ROLES))
      .default("employee"),
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    department: Joi.string().min(2).max(50).required(),
    joiningDate: Joi.date().max("now").required(),
    role: Joi.string()
      .valid(...Object.values(ROLES))
      .default("employee"),
  }),

  applyLeave: Joi.object({
    employeeId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    type: Joi.string()
      .valid(...Object.values(LEAVE_TYPES))
      .required(),
    startDate: Joi.date().min("now").required(),
    endDate: Joi.date().min(Joi.ref("startDate")).required(),
    reason: Joi.string().min(5).max(500).required(),
    role: Joi.string()
      .valid(...Object.values(ROLES))
      .required(),
  }),

  processLeave: Joi.object({
    action: Joi.string().valid("approve", "reject").required(),
    hrId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    comments: Joi.string().max(500).optional(),
    hrRole: Joi.string().valid("hr").required(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details[0].message,
      });
    }
    next();
  };
};

module.exports = { validate, validationSchemas };
