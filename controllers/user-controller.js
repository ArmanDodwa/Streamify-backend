const User = require("../model/User");
const FriendRequest = require("../model/FriendRequest");

const getRecommendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    const recommendedUser = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser } },
        { isOnboarded: true },
      ],
    });

    res.status(200).json(recommendedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate("friends", "name profilePic nativeLanguage learningLanguage location");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Friends retrieved successfully",
      friends: user.friends,
    });
  } catch (error) {
    console.log("Error getMyFriends controller", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: recipientId } = req.params;

    // 1. Prevent sending to self
    if (myId.toString() === recipientId.toString()) {
      return res
        .status(400)
        .json({ message: "You can't send a friend request to yourself." });
    }

    
    // 2. Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    // 3. Optional: Check if already friends (if your User model has a friends array)
    const me = await User.findById(myId);
    if (me.friends && me.friends.includes(recipientId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }

    // 4. Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({
          message: "A friend request already exists between you and this user.",
        });
    }

    // 5. Create new friend request
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    return res.status(201).json({
      message: "Friend request sent successfully.",
      data: friendRequest,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const userId = req.user._id; // current logged-in user

    // 1. Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // 2. Check authorization
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    // 3. Check if already accepted
    if (friendRequest.status === "accepted") {
      return res
        .status(400)
        .json({ message: "Friend request already accepted" });
    }

    // 4. Update status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // 5. Add each other to friends list
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    return res.status(200).json({
      message: "Friend request accepted successfully",
      data: friendRequest,
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    // 1️⃣ Incoming pending friend requests (others sent to you)
    const incomingReqs = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("sender", "name profilePic nativeLanguage learningLanguage");

    // 2️⃣ Accepted friend requests where you're the recipient
    const acceptedReqs = await FriendRequest.find({
      recipient: req.user._id,
      status: "accepted",
    }).populate("sender", "name profilePic");

    // (Optional) Sent pending requests by you
    const sentReqs = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate("recipient", "name profilePic nativeLanguage learningLanguage");

    // 3️⃣ Send response
    return res.status(200).json({
      message: "Friend requests fetched successfully",
      incoming: incomingReqs,
      accepted: acceptedReqs,
      sent: sentReqs,
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


const outgoingFriendRequest = async (req, res) => {
  try {
    // Find all friend requests sent by the logged-in user
    const outgoingRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate("recipient", "name profilePic nativeLanguage learningLanguage");

    // console.log(outgoingRequests)
    return res.status(200).json({
      message: "Outgoing friend requests fetched successfully",
      data: outgoingRequests,
    });
  
  } catch (error) {
    console.error("Error fetching outgoing friend requests:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = {
  getRecommendedUsers,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  outgoingFriendRequest
};
