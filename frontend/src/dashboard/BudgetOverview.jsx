import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function BudgetOverview({ transactions }) {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await API.get("/budgets");
        setBudgets(response.data);
      } catch (error) {
        console.log("Budget overview error:", error);
      }
    };

    fetchBudgets();
  }, []);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Only budgets for current month
  const currentBudgets = budgets.filter(
    (budget) => budget.month === currentMonth && budget.year === currentYear,
  );

  // Calculate current-month spending for a category
  const getSpentAmount = (category) => {
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);

        return (
          transaction.type === "expense" &&
          transaction.category?.toLowerCase() === category.toLowerCase() &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  };

  // Only show categories that have a budget or spending
  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Health",
    "Entertainment",
    "Education",
    "Others",
  ];

  const visibleCategories = categories
    .filter((category) => {
      const hasBudget = currentBudgets.some(
        (budget) => budget.category?.toLowerCase() === category.toLowerCase(),
      );

      const hasSpending = getSpentAmount(category) > 0;

      return hasBudget || hasSpending;
    })
    .slice(0, 4);

  return (
    <div className="dashboard-card budget-overview">
      <div className="card-header">
        <div>
          <h3>Budget Overview</h3>
          <p>Monthly spending limits</p>
        </div>
      </div>

      {visibleCategories.length === 0 ? (
        <div className="no-transactions">
          <p>No budgets or spending for this month.</p>
        </div>
      ) : (
        visibleCategories.map((category) => {
          const budget = currentBudgets.find(
            (item) => item.category?.toLowerCase() === category.toLowerCase(),
          );

          const limit = Number(budget?.limit || 0);
          const spent = getSpentAmount(category);

          const percentage =
            limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;

          return (
            <div className="budget-overview-item" key={category}>
              <div className="budget-info">
                <span>{category}</span>

                <span>
                  ₹{spent.toLocaleString("en-IN")}
                  {limit > 0 && ` / ₹${limit.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="budget-overview-progress">
                <div
                  className="budget-progress-fill"
                  style={{
                    width: `${percentage}%`,
                  }}
                ></div>
              </div>

              <div className="budget-percent">
                {limit > 0 ? `${percentage}%` : "No budget"}
              </div>
            </div>
          );
        })
      )}

      <button className="view-btn" onClick={() => navigate("/budget")}>
        View All Budgets
      </button>
    </div>
  );
}

export default BudgetOverview;
