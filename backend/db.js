const mongoose = require("mongoose");
const { Schema, number } = require("zod");

mongoose.connect(
  "mongodb+srv://pradhuman362:12341234432143214545@cluster0.srd3d.mongodb.net/paytm"
);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
});

const User = mongoose.model("Users", userSchema);


const accountSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required : true
  }, 
  balance: {
    type: Number,
    required: true
  }
})

const Account = mongoose.model("Accounts", accountSchema);

module.exports = { User , Account};