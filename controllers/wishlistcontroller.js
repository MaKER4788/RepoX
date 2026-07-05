const User = require("../models/user");

exports.toggleWishlist = async (req, res) => {

    const user = await User.findById(req.user._id);

    const projectId = req.params.id;

    const exists = user.wishlist.includes(projectId);

    if (exists) {

        user.wishlist.pull(projectId);

    } else {

        user.wishlist.push(projectId);

    }

    await user.save();

    res.redirect("back");

};