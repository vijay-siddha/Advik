module.exports = function can_access(requiredRole) {
  return function (req, res, next) {
    next();
  };
};
