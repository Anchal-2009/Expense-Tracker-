const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Goal = require("../models/Goals");

const router = express.Router();

//add new goals
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, targetAmount, savedAmount, targetDate } =
      req.body;

    if (!name || !targetAmount || !targetDate) {
      return res
        .status(400)
        .json({ message: "Name, target amount and target date are required" });
    }

    const finalSavedAmount = Number(savedAmount || 0);
    const finalTargetAmount = Number(targetAmount);

    const goal = new Goal({
      user: req.user.id,
      name,
      description,
      targetAmount: finalTargetAmount,
      savedAmount: finalSavedAmount,
      targetDate,
      status: finalSavedAmount >= finalTargetAmount ? "Completed" : "Active",
    });

    await goal.save();

    res.status(201).json(goal);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create goal" });
  }
});

//get all goals
router.get("/", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(goals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

// Add savings to a goal
router.put("/:id/add-savings", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    const savingsAmount = Number(amount);

    if (!savingsAmount || savingsAmount <= 0) {
      return res.status(400).json({
        message: "Savings amount must be greater than 0",
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    const newSavedAmount = Number(goal.savedAmount || 0) + savingsAmount;

    goal.savedAmount = Math.min(newSavedAmount, Number(goal.targetAmount));

    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = "Completed";
    } else {
      goal.status = "Active";
    }

    await goal.save();

    res.json({
      message: "Savings added successfully",
      goal,
    });
  } catch (error) {
    console.log("add savings error", error);

    res.status(500).json({
      message: "Failed to add savings",
    });
  }
});

//delete a goal
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

module.exports = router;
