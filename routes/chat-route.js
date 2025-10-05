const express = require('express');
const router = express.Router();
const {getStreamToken} = require("../controllers/chat-controller")

const {protectRoute} = require("../middleware/auth-middleware");

router.get("/token", protectRoute, getStreamToken)






module.exports = router;