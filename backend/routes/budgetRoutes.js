const express = require("express");
const Budget = require("../models/Budget");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//Get all budgets
router.get("/", authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(200).json(budgets);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to fetch transactions", error: error.message });
  }
});

//Add or update budget
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || limit === undefined || month === undefined || !year) {
      return res
        .status(400)
        .json({ message: "Category, limit, month and year are required" });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user.id,
        category,
        month,
        year,
      },
      {
        user: req.user.id,
        category,
        limit,
        month,
        year,
      },
      {
        returnDocument: "after",
        upsert: true,
      },
    );

    res.status(200).json({ message: "Budget saved successfully", budget });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to save budget", error: error.message });
  }
});

//Delete Budget
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to delete budget", error: error.message });
  }
});

module.exports = router;
