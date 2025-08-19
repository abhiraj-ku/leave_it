const mongoose = require("mongoose");
const { LEAVE_TYPES, LEAVE_STATUS } = require("../utils/constants");

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(LEAVE_TYPES),
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(LEAVE_STATUS),
      default: LEAVE_STATUS.PENDING,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    approvedAt: Date,
    comments: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
leaveSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ type: 1 });

module.exports = mongoose.model("Leave", leaveSchema);
