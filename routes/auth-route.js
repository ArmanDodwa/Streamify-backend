const express = require('express');
const router = express.Router();
const { signupUser, loginUser, logOutUser, onboard } = require('../controllers/auth-controller');
const {protectRoute} = require("../middleware/auth-middleware");


router.post('/signup', signupUser,);
router.post('/login', loginUser);
router.post('/logout', logOutUser);

router.post('/onboarding',protectRoute, onboard);
router.get('/me',protectRoute, (req, res)=>{
  return res.status(200).json({success:true, user:req.user})
});

module.exports = router;