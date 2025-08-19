const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      // ambiguity as to which date actual joining or on to which employee was registered by hr on this platform
      type: Date,
      required: true,
    },
    role: {
      type: String,
      enum: ["hr", "employee"],
      default: "employee",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
