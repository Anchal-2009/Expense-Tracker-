import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../CSS/goals.css";

import { Target, Plus, Calendar, TrendingUp } from "lucide-react";

import Sidebar from "./Sidebar";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [showSavingsForm, setShowSavingsForm] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState("");

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const navigate = useNavigate();

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);

    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 5000);
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await API.get("/goals");
        setGoals(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchGoals();
  }, []);

  const handleAddSavings = async (goalId) => {
    const amount = Number(savingsAmount);

    if (!amount || amount <= 0) {
      showAlert("Please enter a valid savings amount", "error");
      return;
    }

    try {
      const response = await API.put(`/goals/${goalId}/add-savings`, {
        amount,
      });

      setGoals(
        goals.map((goal) => (goal._id === goalId ? response.data.goal : goal)),
      );

      setSavingsAmount("");
      setShowSavingsForm(null);

      showAlert("Savings added successfully", "success");
    } catch (error) {
      console.log(error);

      showAlert(
        error.response?.data?.message || "Failed to add savings",
        "error",
      );
    }
  };

  const handleDeleteGoal = (id) => {
    setGoalToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) {
      return;
    }

    try {
      await API.delete(`/goals/${goalToDelete}`);

      setGoals(goals.filter((goal) => goal._id !== goalToDelete));

      setShowDeleteModal(false);
      setGoalToDelete(null);

      showAlert("Goal deleted successfully", "success");
    } catch (error) {
      console.log(error);

      setShowDeleteModal(false);
      setGoalToDelete(null);

      showAlert(
        error.response?.data?.message || "Failed to delete goal",
        "error",
      );
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        {alertMessage && (
          <div className={`goal-alert ${alertType}`}>
            <span>{alertMessage}</span>

            <button
              type="button"
              onClick={() => {
                setAlertMessage("");
                setAlertType("");
              }}
            >
              ×
            </button>
          </div>
        )}
        {showDeleteModal && (
          <div className="goal-modal-overlay">
            <div className="goal-delete-modal">
              <h3>Delete Goal?</h3>

              <p>
                Are you sure you want to delete this goal? This action cannot be
                undone.
              </p>

              <div className="goal-modal-actions">
                <button
                  type="button"
                  className="cancel-goal-btn"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setGoalToDelete(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirm-delete-goal-btn"
                  onClick={confirmDeleteGoal}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Financial Goals</h1>
            <p>Set goals and track your financial progress</p>
          </div>

          <button
            className="add-goal-button"
            onClick={() => navigate("/addgoal")}
          >
            <Plus size={15} />
            Add Goal
          </button>
        </header>

        <div className="goals-page">
          {/* OVERVIEW */}

          <div className="goals-overview">
            <div className="goal-overview-card">
              <div className="goal-overview-icon">
                <Target size={18} />
              </div>

              <div>
                <span>Active Goals</span>
                <h3>
                  {goals.filter((goal) => goal.status === "Active").length}
                </h3>
              </div>
            </div>

            <div className="goal-overview-card">
              <div className="goal-overview-icon">
                <TrendingUp size={18} />
              </div>

              <div>
                <span>Total Target</span>
                <h3>
                  ₹
                  {goals
                    .reduce(
                      (total, goal) => total + Number(goal.targetAmount || 0),
                      0,
                    )
                    .toLocaleString()}
                </h3>
              </div>
            </div>

            <div className="goal-overview-card">
              <div className="goal-overview-icon">
                <Target size={18} />
              </div>

              <div>
                <span>Total Saved</span>
                <h3>
                  ₹
                  {goals
                    .reduce(
                      (total, goal) => total + Number(goal.savedAmount || 0),
                      0,
                    )
                    .toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* GOALS */}

          <div className="goals-grid">
            {goals.length === 0 ? (
              <div className="no-goals">
                <Target size={22} />
                <h3>No goals yet</h3>
                <p>Start by creating your first financial goal.</p>
              </div>
            ) : (
              goals.map((goal) => {
                const targetAmount = Number(goal.targetAmount || 0);
                const savedAmount = Number(goal.savedAmount || 0);

                const progress =
                  goal.status === "Completed"
                    ? 100
                    : targetAmount > 0
                      ? Math.min((savedAmount / targetAmount) * 100, 100)
                      : 0;
                const remainingAmount =
                  goal.status === "Completed"
                    ? 0
                    : Math.max(targetAmount - savedAmount, 0);
                const today = new Date();
                const targetDate = new Date(goal.targetDate);
                const daysRemaining = Math.ceil(
                  (targetDate - today) / (1000 * 60 * 60 * 24),
                );

                return (
                  <div className="goal-card" key={goal._id}>
                    <div className="goal-card-top">
                      <div
                        className={`goal-icon ${goals.indexOf(goal) % 3 === 0 ? "green" : goals.indexOf(goal) % 3 === 1 ? "blue" : "orange"}`}
                      >
                        <Target size={18} />
                      </div>

                      <span className="goal-status">{goal.status}</span>
                    </div>

                    <h3>{goal.name}</h3>
                    <p>{goal.description}</p>

                    <div className="goal-amount">
                      <strong>₹{savedAmount.toLocaleString()}</strong>
                      <span> of ₹{targetAmount.toLocaleString()}</span>
                    </div>

                    <div className="goal-progress">
                      <div
                        className="goal-progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="goal-progress-info">
                      <span>{progress.toFixed(0)}% completed</span>
                      <strong>₹{remainingAmount.toLocaleString()} left</strong>
                    </div>

                    <div className="goal-date">
                      <Calendar size={13} />
                      <span>
                        Target:{" "}
                        {new Date(goal.targetDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {goal.status !== "Completed" && (
                      <div
                        className={`goal-date-status ${daysRemaining < 0 ? "overdue" : daysRemaining <= 7 ? "due-soon" : "upcoming"}`}
                      >
                        {daysRemaining < 0
                          ? "Overdue"
                          : daysRemaining <= 7
                            ? "Due soon"
                            : "Upcoming"}
                      </div>
                    )}

                    {goal.status !== "Completed" && (
                      <div className="goal-savings-section">
                        {showSavingsForm === goal._id ? (
                          <div className="goal-savings-form">
                            <input
                              type="number"
                              min="1"
                              placeholder="Enter savings amount"
                              value={savingsAmount}
                              onChange={(e) => setSavingsAmount(e.target.value)}
                            />

                            <button
                              type="button"
                              onClick={() => handleAddSavings(goal._id)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setShowSavingsForm(null);
                                setSavingsAmount("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="add-savings-button"
                            onClick={() => {
                              setShowSavingsForm(goal._id);
                              setSavingsAmount("");
                            }}
                          >
                            Add Savings
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      className="delete-goal-button"
                      onClick={() => handleDeleteGoal(goal._id)}
                    >
                      Delete Goal
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Goals;
