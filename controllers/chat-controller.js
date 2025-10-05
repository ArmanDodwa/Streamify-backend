const { generateStreamToken } = require("../lib/stream");

const getStreamToken = async (req, res) => {
  try {
    // ✅ Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // ✅ Generate token using your helper function
    const token = generateStreamToken(req.user.id);

    // ✅ Return the token
    return res.status(200).json({
      message: "Stream token generated successfully",
      token,
    });
  } catch (error) {
    console.error("Error generating stream token:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { getStreamToken };
