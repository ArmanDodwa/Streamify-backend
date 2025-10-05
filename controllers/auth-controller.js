const { json } = require("express");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const { upsertStreamUser } = require("../lib/stream");

const signupUser = async (req, res) => {
  console.log(req.body)
  const { name, email, password } = req.body;

  try {
    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Random avatar
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(), // ✅ Stream requires string IDs
        name: newUser.name,
        image: newUser.profilePic || "", // ✅ optional fallback
      });

      console.log(`✅ Stream user created: ${newUser.name}`);
    } catch (error) {
      console.error("❌ Error creating stream user:", error.message || error);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    // Set cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // prevent XSS attacks
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    // Send response
    res.status(200).json({
      success: true,
      data: newUser,
      error: {},
    });
  } catch (error) {
    console.log("Error in signup Controller:", error);
    res.status(500).json({
      success: false,
      data: {},
      error: error.message || error,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ 1. Check if both fields are present
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ 2. Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // ✅ 3. Check password
    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // ✅ 4. Create token using correct user id
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // ✅ 5. Set cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // ✅ 6. Send success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user, token,
    });
  } catch (error) {
    console.log("Error in loginUser Controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const logOutUser = (req, res) => {
  try {
    // ✅ Clear the cookie by name
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Error in logOutUser Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message || error,
    });
  }
};

const onboard = async (req, res) => {
  console.log(req.user);
  try {
    const userId = req.user._id;

    const { name, bio, location, learningLanguage, nativeLanguage } = req.body;

    if (!name || !bio || !location || !learningLanguage || !nativeLanguage) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields: {
          name: !name,
          bio: !bio,
          location: !location,
          learningLanguage: !learningLanguage,
          nativeLanguage: !nativeLanguage,
        },
      });
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnBoarded: true,
      },
      { new: true }
    );

    if (!updateUser) return res.status(201).json({ message: "user not found" });

    //update
    try {
      await upsertStreamUser({
        id: updateUser._id.toString(),
        name: updateUser.name,
        image: updateUser.profilePic || "",
      });

      console.log("✅ Stream user updated successfully");
    } catch (error) {
      console.error("❌ Stream update failed:", error.message);
      // Optional: log stack for debugging
      console.error(error.stack);

      // You can also handle it silently or inform the client
      // return res.status(500).json({ message: "Failed to sync with Stream", error: error.message });
    }

    res.status(200).json({ message: updateUser });
  } catch (error) {
    console.error("onBoard Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { signupUser, loginUser, logOutUser, onboard };
