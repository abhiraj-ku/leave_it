const LEAVE_TYPES = {
  CASUAL: "casual",
  SICK: "sick",
};

const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const ROLES = {
  HR: "hr",
  EMPLOYEE: "employee",
};

const ANNUAL_LEAVE_QUOTA = {
  CASUAL: 10,
  SICK: 12,
  TOTAL: 22,
};

module.exports = {
  LEAVE_TYPES,
  LEAVE_STATUS,
  ROLES,
  ANNUAL_LEAVE_QUOTA,
};
