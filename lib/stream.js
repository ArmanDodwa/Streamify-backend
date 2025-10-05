const { StreamChat } = require("stream-chat");
require("dotenv").config();  // 👈 This must come before using process.env


console.log(process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
)

// ✅ Make sure both API key and secret are passed here
const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUser(userData); // ✅ object, not array
    return userData;
  } catch (error) {
    console.error("Error upserting stream user:", error);
  }
};

const generateStreamToken = (userId) => {
  try {
    const token = streamClient.createToken(userId.toString());
    return token;
  } catch (error) {
    console.error("Error generating stream token:", error);
    throw new Error("Failed to generate stream token");
  }
};

module.exports = { upsertStreamUser, generateStreamToken };
