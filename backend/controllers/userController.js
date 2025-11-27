const User = require("../models/user")
const bcrypt = require("bcrypt")

//Register
exports.registerUser = async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    //create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    })

    //save user and response
    const user = await newUser.save()
    res.status(200).json(user._id)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

// login
exports.loginUser =  async (req, res) => {
  try {
    // find user
    const user = await User.findOne({ username: req.body.username })
    // if user does not exist, return error
    if (!user) {
      return res.status(400).json("Invalid username or password")
    }
    // validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password)

    // if password is not valid, return error
    if (!validPassword) {
      return res.status(400).json("Incorret password")
    }
    // Send back user details, including isAdmin status
    res.status(200).json({ _id: user._id, username: user.username, isAdmin: user.isAdmin })
  } catch (err) {
    res.status(500).json(err)
  }
}