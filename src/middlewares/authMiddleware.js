const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

const authorizeRecruiter = (req, res, next) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({ message: "Access denied. Only recruiters can perform this action." });
  }
  next();
};

const authorizeCandidate = (req, res, next) => {
  if (req.user.role !== "candidate") {
    return res.status(403).json({ message: "Access denied. Only candidates can perform this action." });
  }
  next();
};

module.exports = { authenticateUser, authorizeRecruiter, authorizeCandidate };
