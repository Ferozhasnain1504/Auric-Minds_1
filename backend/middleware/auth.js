const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ error: "token_expired" });
    }

    if (payload.version !== user.tokenVersion) {
      return res.status(401).json({ error: "token_expired" });
    }

    req.user = user;
    next();

  } catch {
    return res.status(401).json({ error: "token_expired" });
  }
};

module.exports = auth;
