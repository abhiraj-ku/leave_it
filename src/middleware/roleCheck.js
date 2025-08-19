const { ROLES } = require("../utils/constants");

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const { hrRole, hrId } = req.body;

    // todo: this should come from decoded JWT

    if (!hrRole || !hrId) {
      return res.status(400).json({
        success: false,
        message: "creator Role and creator's hrId are required",
      });
    }

    if (!allowedRoles.includes(hrRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions",
      });
    }

    req.hrRole = hrRole;
    req.hrId = hrId;
    next();
  };
};

module.exports = checkRole;
