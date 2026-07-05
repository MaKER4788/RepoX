const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wishlistcontroller = require("../controllers/wishlistcontroller");
const { isLoggedIn } = require("../middlewares/middleware");

router.post(
    "/wishlist/:id",
    isLoggedIn,
    wishlistcontroller.toggleWishlist
);
router.get("/wishlist", isLoggedIn, async (req,res)=>{

    const user = await User.findById(req.user._id)
        .populate("wishlist");

    res.render("wishlist",{
        projects:user.wishlist
    });

});
module.exports = router;