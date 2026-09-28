const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Transaction = require("../models/Transaction");

const router = express.Router();

//Add transaction
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, amount, category, description, date, paymentMethod } =
      req.body;

    // Validate
    if (!type || !category || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTransaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      category,
      description,
      date,
      paymentMethod,
    });

    res.status(201).json({
      message: "Transaction added successfully",
      Transaction: newTransaction,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add transaction", error: error.message });
  }
});

//Get all transaction
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
    }).sort({ date: -1, createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to fetch transactions", error: error.message });
  }
});

//Delete transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    //Make sure that transaction belongs to logged in user
    if (transaction.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this transaction" });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete transaction", error: error.message });
  }
});

module.exports = router;
