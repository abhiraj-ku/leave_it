const mongoose = require("mongoose");
const { ANNUAL_LEAVE_QUOTA } = require("../utils/constants");

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },
    year: {
      type: Number,
      required: true,
    },
    casualLeaveBalance: {
      type: Number,
      default: ANNUAL_LEAVE_QUOTA.CASUAL,
    },
    sickLeaveBalance: {
      type: Number,
      default: ANNUAL_LEAVE_QUOTA.SICK,
    },
    casualLeaveUsed: {
      type: Number,
      default: 0,
    },
    sickLeaveUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for employee and year
leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
