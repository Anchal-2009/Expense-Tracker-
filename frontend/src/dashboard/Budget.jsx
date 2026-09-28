import { useEffect, useState } from "react";
import { Plus, WalletCards } from "lucide-react";
import Sidebar from "./Sidebar";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../CSS/budget.css";

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);

    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const budgetResponse = await API.get("/budgets");
        const transactionResponse = await API.get("/transactions");

        setBudgets(budgetResponse.data);
        setTransactions(transactionResponse.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const currentDate = new Date();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentBudgets = budgets.filter(
    (budget) => budget.month === currentMonth && budget.year === currentYear,
  );

  const getSpentAmount = (category) => {
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);
        return (
          transaction.type === "expense" &&
          transaction.category.toLowerCase() === category.toLowerCase() &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })

      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  };

  const hasCategoryBudget = (category) => {
    return currentBudgets.some(
      (budget) => budget.category.toLowerCase() === category.toLowerCase(),
    );
  };

  const hasCategorySpending = (category) => {
    return getSpentAmount(category) > 0;
  };

  const shouldShowCategory = (category) => {
    return hasCategoryBudget(category) || hasCategorySpending(category);
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) {
      return;
    }

    try {
      await API.delete(`/budgets/${budgetToDelete}`);

      setBudgets((prevBudgets) =>
        prevBudgets.filter((item) => item._id !== budgetToDelete),
      );

      setShowConfirm(false);
      setBudgetToDelete(null);

      showAlert("Budget deleted successfully", "success");
    } catch (error) {
      console.log(error);

      setShowConfirm(false);
      setBudgetToDelete(null);

      showAlert(
        error.response?.data?.message || "Failed to delete budget",
        "error",
      );
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      {alertMessage && (
        <div className={`budget-alert ${alertType}`}>
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

      {showConfirm && (
        <div className="budget-modal-overlay">
          <div className="budget-modal">
            <h3>Delete Budget?</h3>

            <p>
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </p>

            <div className="budget-modal-actions">
              <button
                type="button"
                className="cancel-budget-btn"
                onClick={() => {
                  setShowConfirm(false);
                  setBudgetToDelete(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-budget-btn"
                onClick={handleDeleteBudget}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="dashboard-main">
        {/* HEADER */}
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Budget</h1>
            <p>Manage your monthly spending limits</p>
          </div>

          <button
            className="add-transaction-button"
            onClick={() => navigate("/addbudget")}
          >
            <Plus size={15} />
            Add Budget
          </button>
        </header>

        <div className="budget-page">
          {/* SUMMARY CARDS */}
          <div className="budget-summary">
            <div className="budget-summary-card">
              <div className="budget-summary-icon green">
                <WalletCards size={18} />
              </div>

              <div>
                <span>Total Budget</span>
                <h3>
                  ₹
                  {currentBudgets
                    .reduce((total, budget) => total + Number(budget.limit), 0)
                    .toLocaleString("en-IN")}
                </h3>
                <small>This month</small>
              </div>
            </div>

            <div className="budget-summary-card">
              <div className="budget-summary-icon red">₹</div>

              <div>
                <span>Total Spent</span>
                <h3>
                  ₹
                  {transactions
                    .filter((transaction) => {
                      const date = new Date(transaction.date);

                      return (
                        transaction.type === "expense" &&
                        date.getMonth() === currentMonth &&
                        date.getFullYear() === currentYear
                      );
                    })
                    .reduce(
                      (total, transaction) =>
                        total + Number(transaction.amount),
                      0,
                    )
                    .toLocaleString("en-IN")}
                </h3>
                <small>
                  {(() => {
                    const totalBudget = currentBudgets.reduce(
                      (total, budget) => total + Number(budget.limit),
                      0,
                    );
                    const totalSpent = transactions
                      .filter((transaction) => {
                        const date = new Date(transaction.date);
                        return (
                          transaction.type === "expense" &&
                          date.getMonth() === currentMonth &&
                          date.getFullYear() === currentYear
                        );
                      })
                      .reduce(
                        (total, transaction) =>
                          total + Number(transaction.amount),
                        0,
                      );
                    if (totalBudget === 0) {
                      return 0;
                    }
                    return ((totalSpent / totalBudget) * 100).toFixed(2);
                  })()}
                  % of budget
                </small>
              </div>
            </div>

            <div className="budget-summary-card">
              <div className="budget-summary-icon blue">₹</div>

              <div>
                <span>Remaining</span>
                <h3>
                  ₹
                  {Math.max(
                    currentBudgets.reduce(
                      (total, budget) => total + Number(budget.limit),
                      0,
                    ) -
                      transactions
                        .filter((transaction) => {
                          const date = new Date(transaction.date);
                          return (
                            transaction.type === "expense" &&
                            date.getMonth() === currentMonth &&
                            date.getFullYear() === currentYear
                          );
                        })
                        .reduce(
                          (total, transaction) =>
                            total + Number(transaction.amount),
                          0,
                        ),
                    0,
                  ).toLocaleString("en-IN")}
                </h3>
                <small>
                  {(() => {
                    const totalBudget = currentBudgets.reduce(
                      (total, budget) => total + Number(budget.limit),
                      0,
                    );

                    const totalSpent = transactions
                      .filter((transaction) => {
                        const date = new Date(transaction.date);

                        return (
                          transaction.type === "expense" &&
                          date.getMonth() === currentMonth &&
                          date.getFullYear() === currentYear
                        );
                      })
                      .reduce(
                        (total, transaction) =>
                          total + Number(transaction.amount),
                        0,
                      );

                    if (totalBudget === 0) {
                      return 0;
                    }

                    return Math.max(
                      100 - (totalSpent / totalBudget) * 100,
                      0,
                    ).toFixed(2);
                  })()}
                  % remaining
                </small>
              </div>
            </div>
          </div>

          {/* BUDGET CARD */}
          <div className="budget-list-card">
            <div className="budget-list-header">
              <div>
                <h3>Category Budgets</h3>
                <p>Track your spending against each budget</p>
              </div>
            </div>

            {/* FOOD */}
            {shouldShowCategory("Food") && (
              <div className="budget-item">
                <div className="budget-item-top">
                  <div className="budget-category">
                    <div className="budget-category-icon food">🍔</div>

                    <div>
                      <strong>Food</strong>
                      <span>
                        {currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "food",
                        ) ? (
                          <>
                            ₹{getSpentAmount("Food").toLocaleString("en-IN")} of
                            ₹
                            {(
                              currentBudgets.find(
                                (budget) =>
                                  budget.category.toLowerCase() === "food",
                              )?.limit || 0
                            ).toLocaleString("en-IN")}
                          </>
                        ) : (
                          <>
                            ₹{getSpentAmount("Food").toLocaleString("en-IN")}{" "}
                            spent
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="budget-values">
                    <strong>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "food",
                        );
                        if (!budget || budget.limit === 0) {
                          return "No budget";
                        }
                        return `${Math.min((getSpentAmount("Food") / budget.limit) * 100, 100).toFixed(2)}%`;
                      })()}
                    </strong>

                    <button
                      className="edit-budget-btn"
                      onClick={() => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "food",
                        );
                        if (!budget) {
                          showAlert("Food budget not found");
                          return;
                        }
                        navigate("/addbudget", { state: { budget } });
                      }}
                    >
                      Edit Budget
                    </button>

                    <button
                      className="delete-budget-btn"
                      onClick={async () => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "food",
                        );

                        if (!budget) {
                          showAlert("Food budget not found", "error");
                          return;
                        }
                        setBudgetToDelete(budget._id);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>

                    <span>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "food",
                        );
                        if (!budget) {
                          return "No budget set";
                        }
                        return `₹${Math.max(budget.limit - getSpentAmount("Food"), 0).toLocaleString("en-IN")} left`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div
                    className="budget-progress-fill food-progress"
                    style={{
                      width: `${(() => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "food",
                        );
                        if (!budget || budget.limit === 0) {
                          return 0;
                        }
                        return Math.min(
                          Math.round(
                            (getSpentAmount("Food") / budget.limit) * 100,
                          ),
                          100,
                        );
                      })()}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* TRANSPORT */}
            {shouldShowCategory("Transport") && (
              <div className="budget-item">
                <div className="budget-item-top">
                  <div className="budget-category">
                    <div className="budget-category-icon transport">🚕</div>

                    <div>
                      <strong>Transport</strong>
                      <span>
                        {currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "transport",
                        ) ? (
                          <>
                            ₹
                            {getSpentAmount("Transport").toLocaleString(
                              "en-IN",
                            )}{" "}
                            of ₹
                            {(
                              currentBudgets.find(
                                (budget) =>
                                  budget.category.toLowerCase() === "transport",
                              )?.limit || 0
                            ).toLocaleString("en-IN")}
                          </>
                        ) : (
                          <>
                            ₹
                            {getSpentAmount("Transport").toLocaleString(
                              "en-IN",
                            )}{" "}
                            spent
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="budget-values">
                    <strong>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "transport",
                        );
                        if (!budget || budget.limit === 0) {
                          return "No budget";
                        }
                        return `${Math.min((getSpentAmount("Transport") / budget.limit) * 100, 100).toFixed(2)}%`;
                      })()}
                    </strong>

                    <button
                      className="edit-budget-btn"
                      onClick={() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "transport",
                        );
                        if (!budget) {
                          showAlert("Transport budget not found", "error");
                          return;
                        }
                        navigate("/addbudget", { state: { budget } });
                      }}
                    >
                      Edit Budget
                    </button>

                    <button
                      className="delete-budget-btn"
                      onClick={async () => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "transport",
                        );

                        if (!budget) {
                          showAlert("Transport budget not found", "error");
                          return;
                        }
                        setBudgetToDelete(budget._id);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>

                    <span>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "transport",
                        );
                        if (!budget) {
                          return "No budget set";
                        }
                        return `₹${Math.max(budget.limit - getSpentAmount("Transport"), 0).toLocaleString("en-IN")} left`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div
                    className="budget-progress-fill transport-progress"
                    style={{
                      width: `${(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "transport",
                        );
                        if (!budget || budget.limit === 0) {
                          return 0;
                        }
                        return Math.min(
                          Math.round(
                            (getSpentAmount("Transport") / budget.limit) * 100,
                          ),
                          100,
                        );
                      })()}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* SHOPPING */}
            {shouldShowCategory("Shopping") && (
              <div className="budget-item">
                <div className="budget-item-top">
                  <div className="budget-category">
                    <div className="budget-category-icon shopping">🛍️</div>

                    <div>
                      <strong>Shopping</strong>
                      <span>
                        {currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "shopping",
                        ) ? (
                          <>
                            ₹
                            {getSpentAmount("Shopping").toLocaleString("en-IN")}{" "}
                            of ₹
                            {(
                              currentBudgets.find(
                                (budget) =>
                                  budget.category.toLowerCase() === "shopping",
                              )?.limit || 0
                            ).toLocaleString("en-IN")}
                          </>
                        ) : (
                          <>
                            ₹
                            {getSpentAmount("Shopping").toLocaleString("en-IN")}{" "}
                            spent
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="budget-values">
                    <strong>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "shopping",
                        );
                        if (!budget || budget.limit === 0) {
                          return "No budget";
                        }
                        return `${Math.min((getSpentAmount("Shopping") / budget.limit) * 100, 100).toFixed(2)}%`;
                      })()}
                    </strong>

                    <button
                      className="edit-budget-btn"
                      onClick={() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "shopping",
                        );
                        if (!budget) {
                          showAlert("Shopping budget not found", "error");
                          return;
                        }
                        navigate("/addbudget", { state: { budget } });
                      }}
                    >
                      Edit Budget
                    </button>

                    <button
                      className="delete-budget-btn"
                      onClick={async () => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "shopping",
                        );

                        if (!budget) {
                          showAlert("Shopping budget not found", "error");
                          return;
                        }
                        setBudgetToDelete(budget._id);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>

                    <span>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "shopping",
                        );
                        if (!budget) {
                          return "No budget set";
                        }
                        return `₹${Math.max(budget.limit - getSpentAmount("Shopping"), 0).toLocaleString("en-IN")} left`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div
                    className="budget-progress-fill shopping-progress"
                    style={{
                      width: `${(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "shopping",
                        );
                        if (!budget || budget.limit === 0) {
                          return 0;
                        }
                        return Math.min(
                          Math.round(
                            (getSpentAmount("Shopping") / budget.limit) * 100,
                          ),
                          100,
                        );
                      })()}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* BILLS */}
            {shouldShowCategory("Bills") && (
              <div className="budget-item">
                <div className="budget-item-top">
                  <div className="budget-category">
                    <div className="budget-category-icon bills">⚡</div>

                    <div>
                      <strong>Bills</strong>
                      <span>
                        {currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "bills",
                        ) ? (
                          <>
                            ₹{getSpentAmount("Bills").toLocaleString("en-IN")}{" "}
                            of ₹
                            {(
                              currentBudgets.find(
                                (budget) =>
                                  budget.category.toLowerCase() === "bills",
                              )?.limit || 0
                            ).toLocaleString("en-IN")}
                          </>
                        ) : (
                          <>
                            ₹{getSpentAmount("Bills").toLocaleString("en-IN")}{" "}
                            spent
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="budget-values">
                    <strong>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "bills",
                        );
                        if (!budget || budget.limit === 0) {
                          return "No budget";
                        }
                        return `${Math.min((getSpentAmount("Bills") / budget.limit) * 100, 100).toFixed(2)}%`;
                      })()}
                    </strong>

                    <button
                      className="edit-budget-btn"
                      onClick={() => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "bills",
                        );
                        if (!budget) {
                          showAlert("Bills budget not found", "error");
                          return;
                        }
                        navigate("/addbudget", { state: { budget } });
                      }}
                    >
                      Edit Budget
                    </button>

                    <button
                      className="delete-budget-btn"
                      onClick={async () => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "bills",
                        );

                        if (!budget) {
                          showAlert("Bills budget not found", "error");
                          return;
                        }
                        setBudgetToDelete(budget._id);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>

                    <span>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "bills",
                        );
                        if (!budget) {
                          return "No budget set";
                        }
                        return `₹${Math.max(budget.limit - getSpentAmount("Bills"), 0).toLocaleString("en-IN")} left`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div
                    className="budget-progress-fill bills-progress"
                    style={{
                      width: `${(() => {
                        const budget = currentBudgets.find(
                          (budget) => budget.category.toLowerCase() === "bills",
                        );
                        if (!budget || budget.limit === 0) {
                          return 0;
                        }
                        return Math.min(
                          Math.round(
                            (getSpentAmount("Bills") / budget.limit) * 100,
                          ),
                          100,
                        );
                      })()}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Health */}
            {shouldShowCategory("Health") && (
              <div className="budget-item">
                <div className="budget-item-top">
                  <div className="budget-category">
                    <div className="budget-category-icon health">❤️</div>

                    <div>
                      <strong>Health</strong>
                      <span>
                        {currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "health",
                        ) ? (
                          <>
                            ₹{getSpentAmount("Health").toLocaleString("en-IN")}{" "}
                            of ₹
                            {(
                              currentBudgets.find(
                                (budget) =>
                                  budget.category.toLowerCase() === "health",
                              )?.limit || 0
                            ).toLocaleString("en-IN")}
                          </>
                        ) : (
                          <>
                            ₹{getSpentAmount("Health").toLocaleString("en-IN")}{" "}
                            spent
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="budget-values">
                    <strong>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "health",
                        );
                        if (!budget || budget.limit === 0) {
                          return "No budget";
                        }
                        return `${Math.min((getSpentAmount("Health") / budget.limit) * 100, 100).toFixed(2)}%`;
                      })()}
                    </strong>

                    <button
                      className="edit-budget-btn"
                      onClick={() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "health",
                        );
                        if (!budget) {
                          showAlert("Health budget not found", "error");
                          return;
                        }
                        navigate("/addbudget", { state: { budget } });
                      }}
                    >
                      Edit Budget
                    </button>

                    <button
                      className="delete-budget-btn"
                      onClick={async () => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "health",
                        );

                        if (!budget) {
                          showAlert("Health budget not found", "error");
                          return;
                        }
                        setBudgetToDelete(budget._id);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>

                    <span>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "health",
                        );
                        if (!budget) {
                          return "No budget set";
                        }
                        return `₹${Math.max(budget.limit - getSpentAmount("Health"), 0).toLocaleString("en-IN")} left`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div
                    className="budget-progress-fill health-progress"
                    style={{
                      width: `${(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "health",
                        );
                        if (!budget || budget.limit === 0) {
                          return 0;
                        }
                        return Math.min(
                          Math.round(
                            (getSpentAmount("Health") / budget.limit) * 100,
                          ),
                          100,
                        );
                      })()}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Entertainment */}
            {shouldShowCategory("Entertainment") && (
              <div className="budget-item">
                <div className="budget-item-top">
                  <div className="budget-category">
                    <div className="budget-category-icon entertainment">🎬</div>

                    <div>
                      <strong>Entertainment</strong>
                      <span>
                        {currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "entertainment",
                        ) ? (
                          <>
                            ₹
                            {getSpentAmount("Entertainment").toLocaleString(
                              "en-IN",
                            )}{" "}
                            of ₹
                            {(
                              currentBudgets.find(
                                (budget) =>
                                  budget.category.toLowerCase() ===
                                  "entertainment",
                              )?.limit || 0
                            ).toLocaleString("en-IN")}
                          </>
                        ) : (
                          <>
                            ₹
                            {getSpentAmount("Entertainment").toLocaleString(
                              "en-IN",
                            )}{" "}
                            spent
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="budget-values">
                    <strong>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "entertainment",
                        );
                        if (!budget || budget.limit === 0) {
                          return "No budget";
                        }
                        return `${Math.min((getSpentAmount("Entertainment") / budget.limit) * 100, 100).toFixed(2)}%`;
                      })()}
                    </strong>

                    <button
                      className="edit-budget-btn"
                      onClick={() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "entertainment",
                        );
                        if (!budget) {
                          showAlert("Entertainment budget not found", "error");
                          return;
                        }
                        navigate("/addbudget", { state: { budget } });
                      }}
                    >
                      Edit Budget
                    </button>

                    <button
                      className="delete-budget-btn"
                      onClick={async () => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "entertainment",
                        );

                        if (!budget) {
                          showAlert("Entertainment budget not found", "error");
                          return;
                        }
                        setBudgetToDelete(budget._id);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>

                    <span>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "entertainment",
                        );
                        if (!budget) {
                          return "No budget set";
                        }
                        return `₹${Math.max(budget.limit - getSpentAmount("Entertainment"), 0).toLocaleString("en-IN")} left`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div
                    className="budget-progress-fill entertainment-progress"
                    style={{
                      width: `${(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "entertainment",
                        );
                        if (!budget || budget.limit === 0) {
                          return 0;
                        }
                        return Math.min(
                          Math.round(
                            (getSpentAmount("Entertainment") / budget.limit) *
                              100,
                          ),
                          100,
                        );
                      })()}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Education */}
            {shouldShowCategory("Education") && (
              <div className="budget-item">
                <div className="budget-item-top">
                  <div className="budget-category">
                    <div className="budget-category-icon education">📚</div>

                    <div>
                      <strong>Education</strong>
                      <span>
                        {currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "education",
                        ) ? (
                          <>
                            ₹
                            {getSpentAmount("Education").toLocaleString(
                              "en-IN",
                            )}{" "}
                            of ₹
                            {(
                              currentBudgets.find(
                                (budget) =>
                                  budget.category.toLowerCase() === "education",
                              )?.limit || 0
                            ).toLocaleString("en-IN")}
                          </>
                        ) : (
                          <>
                            ₹
                            {getSpentAmount("Education").toLocaleString(
                              "en-IN",
                            )}{" "}
                            spent
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="budget-values">
                    <strong>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "education",
                        );
                        if (!budget || budget.limit === 0) {
                          return "No budget";
                        }
                        return `${Math.min((getSpentAmount("Education") / budget.limit) * 100, 100).toFixed(2)}%`;
                      })()}
                    </strong>

                    <button
                      className="edit-budget-btn"
                      onClick={() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "education",
                        );
                        if (!budget) {
                          showAlert("Education budget not found", "error");
                          return;
                        }
                        navigate("/addbudget", { state: { budget } });
                      }}
                    >
                      Edit Budget
                    </button>

                    <button
                      className="delete-budget-btn"
                      onClick={async () => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "education",
                        );

                        if (!budget) {
                          showAlert("Education budget not found", "error");
                          return;
                        }
                        setBudgetToDelete(budget._id);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>

                    <span>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "education",
                        );
                        if (!budget) {
                          return "No budget set";
                        }
                        return `₹${Math.max(budget.limit - getSpentAmount("Education"), 0).toLocaleString("en-IN")} left`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div
                    className="budget-progress-fill education-progress"
                    style={{
                      width: `${(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "education",
                        );
                        if (!budget || budget.limit === 0) {
                          return 0;
                        }
                        return Math.min(
                          Math.round(
                            (getSpentAmount("Education") / budget.limit) * 100,
                          ),
                          100,
                        );
                      })()}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Others */}
            {shouldShowCategory("Others") && (
              <div className="budget-item">
                <div className="budget-item-top">
                  <div className="budget-category">
                    <div className="budget-category-icon others">📦</div>

                    <div>
                      <strong>Others</strong>
                      <span>
                        {currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "others",
                        ) ? (
                          <>
                            ₹{getSpentAmount("Others").toLocaleString("en-IN")}{" "}
                            of ₹
                            {(
                              currentBudgets.find(
                                (budget) =>
                                  budget.category.toLowerCase() === "others",
                              )?.limit || 0
                            ).toLocaleString("en-IN")}
                          </>
                        ) : (
                          <>
                            ₹{getSpentAmount("Others").toLocaleString("en-IN")}{" "}
                            spent
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="budget-values">
                    <strong>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "others",
                        );
                        if (!budget || budget.limit === 0) {
                          return "No budget";
                        }
                        return `${Math.min((getSpentAmount("Others") / budget.limit) * 100, 100).toFixed(2)}%`;
                      })()}
                    </strong>

                    <button
                      className="edit-budget-btn"
                      onClick={() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "others",
                        );
                        if (!budget) {
                          showAlert("Others budget not found", "error");
                          return;
                        }
                        navigate("/addbudget", { state: { budget } });
                      }}
                    >
                      Edit Budget
                    </button>

                    <button
                      className="delete-budget-btn"
                      onClick={async () => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "others",
                        );

                        if (!budget) {
                          showAlert("Others budget not found", "error");
                          return;
                        }
                        setBudgetToDelete(budget._id);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>

                    <span>
                      {(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "others",
                        );
                        if (!budget) {
                          return "No budget set";
                        }
                        return `₹${Math.max(budget.limit - getSpentAmount("Others"), 0).toLocaleString("en-IN")} left`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div
                    className="budget-progress-fill others-progress"
                    style={{
                      width: `${(() => {
                        const budget = currentBudgets.find(
                          (budget) =>
                            budget.category.toLowerCase() === "others",
                        );
                        if (!budget || budget.limit === 0) {
                          return 0;
                        }
                        return Math.min(
                          Math.round(
                            (getSpentAmount("Others") / budget.limit) * 100,
                          ),
                          100,
                        );
                      })()}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Budget;
