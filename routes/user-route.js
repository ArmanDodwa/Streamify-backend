const express = require('express');
const router = express.Router();
const {getRecommendedUsers, getMyFriends, sendFriendRequest, acceptFriendRequest, getFriendRequests, outgoingFriendRequest} = require("../controllers/user-controller.js")
const {protectRoute} = require("../middleware/auth-middleware");


router.use(protectRoute)
router.get("/", getRecommendedUsers)
router.get("/friends", getMyFriends)
router.post("/friends-request/:id", sendFriendRequest)
router.put("/friends-request/:id/accept", acceptFriendRequest)

router.get("/friends-requests", getFriendRequests)

router.get("/outgoing-friends-request", outgoingFriendRequest)





module.exports = router;