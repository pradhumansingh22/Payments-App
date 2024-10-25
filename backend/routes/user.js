const express = require("express");
const jwt = require("jsonwebtoken");
const zod = require("zod");
const { User, Account } = require("../db");
const JWT_SECRET = require("../config");
const { authMiddleware } = require("../middleware");

const router = express.Router();

const signupSchema = zod.object({
  username: zod.string().email(),
  firstName: zod.string().min(3).max(50),
  lastName: zod.string().min(3).max(50),
  password: zod.string().min(8),
});

const signinSchema = zod.object({
  username: zod.string().email(),
  password: zod.string().min(8),
});

const updateSchema = zod.object({
  firstName: zod.string().min(3).max(50).optional(),
  lastName: zod.string().min(3).max(50).optional(),
  password: zod.string().min(8).optional(),
})

router.post("/signup", async (req, res) => {
  const body = req.body;
  const parsedBody = signupSchema.safeParse(body);

  if (!parsedBody.success) {
    return res.json({ message: "Invalid Input" });
  }

  const existingUser = await User.findOne({ username: body.username });
  if (existingUser) {
    return res.status(400).json({ message: "User Already exists" });
  }

  const newUser = await User.create({
    username: body.username,
    firstName: body.firstName,
    lastName: body.lastName,
    password: body.password,
  });

  await Account.create({
    userID: newUser._id,
    balance: Math.floor(Math.random() * 10000)+1,
  });

  const jwtToken = jwt.sign({ userID: newUser._id }, JWT_SECRET);

  return res.status(200).json({
    message: "User created successfully",
    jwt: jwtToken,
  });
});

router.post("/signin", async (req, res) => {
  const body = req.body;
  const parsedBody = signinSchema.safeParse(body);
  if (!parsedBody.success) {
    return res.status(411).json({ message: "Invalid inputs" });
  }

  const user = await User.findOne({ username: body.username });
  if (user && user.password === body.password) {
    const jwtToken = jwt.sign({ userID: user._id }, JWT_SECRET);
    return res.json({ token: jwtToken });
  }

  return res.status(411).json({ message: "Error while logging in" });
});

router.put("/", authMiddleware, async (req, res) => {
  const body = req.body;
  const parsedBody = updateSchema.safeParse(body);
  if (!parsedBody.success) {
    return res.status(411).json({ message: "Invalid Inputs" });
  }
  await User.updateOne({ _id: req.userID }, body);
  return res.json({message:"User updated successfully"})
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter ||"";
  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
          $options: "i"
        },
      },
      {
        lastName: {
          $regex: filter,
          $options:"i"
        },
      },
    ],
  });

  res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})
module.exports = router;