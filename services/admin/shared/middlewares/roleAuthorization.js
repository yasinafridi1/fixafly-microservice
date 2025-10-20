import ErrorHandler from "../utils/ErrorHandler.js";

const roleAuthorization = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Assumes user role is available on req.user

    // Check if the user's role is in the allowedRoles array
    if (allowedRoles.includes(userRole)) {
      next(); // User has required role, proceed to controller
    } else {
      return next(new ErrorHandler("Unauthorized user", 400));
    }
  };
};

export default roleAuthorization;
