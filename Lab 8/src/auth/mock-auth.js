// src/auth/mock-auth.js
module.exports = (req, res, next) => {
  req.user = 'user1@email.com';
  next();
};
