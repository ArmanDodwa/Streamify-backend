const jwt = require("jsonwebtoken");
const User = require("../model/User");

const protectRoute = async (req, res, next) => {
  try {
    // ✅ 1. Get token from cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // ✅ 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    // ✅ 3. Find user in DB
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    // ✅ 4. Attach user to request
    req.user = user;


    // ✅ 5. Continue
    next();

  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    return res.status(401).json({ message: "Unauthorized - Token failed or expired" });
  }
};

module.exports = { protectRoute };
