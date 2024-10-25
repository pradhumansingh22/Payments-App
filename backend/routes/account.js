const express = require("express");
const { Account } = require("../db");
const { authMiddleware } = require("../middleware");
const { mongoose } = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({ userID: req.userID });
    //console.log(req.userID);
  res.status(200).json({ balance: account.balance });
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const to = req.body.to;
    const amount = req.body.amount;

    const reciever = await Account.findOne({ userID: to }).session(session);
    if (!reciever) {
        await session.abortTransaction();
        return res.status(400).json({message:"Invalid account"})
    }

    const sender = await Account.findOne({ userID: req.userID }).session(session);
    if (sender.balance < amount) {
        await session.abortTransaction();
        return res.json({ message: "Insufficient Balance" });
    }

    await Account.updateOne({ userID: req.userID }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userID: to }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();
    res.json({ message: "Transfer successful" });

})

module.exports = router;
