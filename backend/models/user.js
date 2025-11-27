const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 4,
      max: 25,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    // Add isAdmin field for admin role
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)


module.exports = mongoose.model("user", UserSchema)