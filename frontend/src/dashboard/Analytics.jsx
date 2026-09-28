import { useEffect, useState } from "react";
import API from "../services/api";
import "../CSS/analytics.css";

import { TrendingUp, Wallet, CreditCard } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

import { Line } from "react-chartjs-2";

import Sidebar from "./Sidebar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

function Analytics() {
  const [transactions, setTransactions] = useState([]);

  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await API.get("/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTransactions();
  }, []);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  //filtered transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    if (selectedPeriod === "This Month") {
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    }

    if (selectedPeriod === "Last Month") {
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      return (
        date.getMonth() === lastMonthDate.getMonth() &&
        date.getFullYear() === lastMonthDate.getFullYear()
      );
    }

    if (selectedPeriod === "Last 3 Months") {
      const startDate = new Date(currentYear, currentMonth - 2, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 1);
      return date >= startDate && date < endDate;
    }

    if (selectedPeriod === "This Year") {
      return date.getFullYear() === currentYear;
    }

    return true;
  });

  // total spending
  const totalSpending = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  let selectedPeriodDays;

  if (selectedPeriod === "This Month") {
    selectedPeriodDays = currentDate.getDate();
  } else if (selectedPeriod === "Last Month") {
    selectedPeriodDays = new Date(currentYear, currentMonth, 0).getDate();
  } else if (selectedPeriod === "Last 3 Months") {
    selectedPeriodDays =
      new Date(currentYear, currentMonth + 1, 0).getDate() +
      new Date(currentYear, currentMonth, 0).getDate() +
      new Date(currentYear, currentMonth - 1, 0).getDate();
  } else {
    selectedPeriodDays =
      new Date(currentYear, 11, 31).getTime() -
      new Date(currentYear, 0, 1).getTime();

    selectedPeriodDays = selectedPeriodDays / (1000 * 60 * 60 * 24) + 1;
  }

  //Average spending
  const averageDailySpending =
    selectedPeriodDays > 0 ? totalSpending / selectedPeriodDays : 0;

  //Total transactions
  const totalTransactions = filteredTransactions.length;

  //Daily spending
  const selectedMonth =
    selectedPeriod === "Last Month"
      ? new Date(currentYear, currentMonth - 1, 1)
      : new Date(currentYear, currentMonth, 1);

  const selectedMonthNumber = selectedMonth.getMonth();
  const selectedMonthYear = selectedMonth.getFullYear();

  const daysInSelectedMonth = new Date(
    selectedMonthYear,
    selectedMonthNumber + 1,
    0,
  ).getDate();

  const dailySpending =
    selectedPeriod === "Last 3 Months" || selectedPeriod === "This Year"
      ? Array.from(
          {
            length: selectedPeriod === "Last 3 Months" ? 3 : 12,
          },
          (_, index) => {
            const monthDate =
              selectedPeriod === "Last 3 Months"
                ? new Date(currentYear, currentMonth - 2 + index, 1)
                : new Date(currentYear, index, 1);
            return filteredTransactions
              .filter((transaction) => {
                const date = new Date(transaction.date);
                return (
                  transaction.type === "expense" &&
                  date.getMonth() === monthDate.getMonth() &&
                  date.getFullYear() === monthDate.getFullYear()
                );
              })
              .reduce(
                (total, transaction) => total + Number(transaction.amount),
                0,
              );
          },
        )
      : Array.from({ length: daysInSelectedMonth }, (_, index) => {
          const day = index + 1;

          return filteredTransactions
            .filter((transaction) => {
              const date = new Date(transaction.date);

              return (
                transaction.type === "expense" &&
                date.getDate() === day &&
                date.getMonth() === selectedMonthNumber &&
                date.getFullYear() === selectedMonthYear
              );
            })
            .reduce(
              (total, transaction) => total + Number(transaction.amount),
              0,
            );
        });

  //category spending
  const categorySpending = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((categories, transaction) => {
      const category = transaction.category;
      categories[category] =
        (categories[category] || 0) + Number(transaction.amount);
      return categories;
    }, {});

  //top spending category
  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const dailySpendingData = {
    labels:
      selectedPeriod === "Last 3 Months"
        ? Array.from({ length: 3 }, (_, index) =>
            new Date(currentYear, currentMonth - 2 + index).toLocaleString(
              "en-US",
              {
                month: "short",
              },
            ),
          )
        : selectedPeriod === "This Year"
          ? Array.from({ length: 12 }, (_, index) =>
              new Date(currentYear, index).toLocaleString("en-US", {
                month: "short",
              }),
            )
          : Array.from(
              { length: dailySpending.length },
              (_, index) =>
                `${selectedMonth.toLocaleString("en-US", {
                  month: "short",
                })} ${index + 1}`,
            ),

    datasets: [
      {
        label: "Daily Spending",

        data: dailySpending,

        borderColor: "#4388b8",

        backgroundColor: "rgba(67, 136, 184, 0.15)",

        fill: true,

        tension: 0.4,

        pointRadius: 3,

        pointHoverRadius: 5,
      },
    ],
  };

  const dailySpendingOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            const label =
              selectedPeriod === "Last 3 Months" ||
              selectedPeriod === "This Year"
                ? "Monthly Spending"
                : "Daily Spending";
            return `${label}: ₹${Number(context.raw).toLocaleString("en-IN")}`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#8b949e",
          font: {
            size: 10,
          },

          maxTicksLimit: 8,
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "#eef1f0",
        },

        ticks: {
          color: "#8b949e",
          font: {
            size: 10,
          },

          callback: function (value) {
            return `₹${Number(value).toLocaleString("en-IN")}`;
          },
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header*/}

        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Analytics</h1>

            <p>
              Insights into your spending for {selectedPeriod.toLowerCase()}
            </p>
          </div>

          <select
            className="analytics-period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
          </select>
        </header>

        <div className="analytics-page">
          {/* Summary cards */}

          <div className="analytics-summary">
            {/* Total spending */}

            <div className="analytics-card">
              <div className="analytics-icon spending">
                <Wallet size={18} />
              </div>

              <div>
                <span>Total Spending</span>

                <h3>₹{totalSpending.toLocaleString()}</h3>

                <small>{selectedPeriod}</small>
              </div>
            </div>

            {/* Average spending */}

            <div className="analytics-card">
              <div className="analytics-icon average">
                <TrendingUp size={18} />
              </div>

              <div>
                <span>Average Daily</span>

                <h3>
                  ₹
                  {Number(averageDailySpending).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}
                </h3>

                <small>{selectedPeriod}</small>
              </div>
            </div>

            {/* Total transactions */}

            <div className="analytics-card">
              <div className="analytics-icon transactions">
                <CreditCard size={18} />
              </div>

              <div>
                <span>Total Transactions</span>

                <h3>{totalTransactions}</h3>

                <small>{selectedPeriod}</small>
              </div>
            </div>
          </div>

          {/* Chart */}

          <div className="analytics-chart-card">
            <div className="analytics-card-heading">
              <div>
                <h3>
                  {selectedPeriod === "This Year" ||
                  selectedPeriod === "Last 3 Months"
                    ? "Monthly Spending"
                    : "Daily Spending"}
                </h3>

                <p>
                  {selectedPeriod === "Last 3 Months" ||
                  selectedPeriod === "This Year"
                    ? `Your monthly spending for ${selectedPeriod.toLowerCase()}`
                    : `Your daily spending for ${selectedPeriod.toLowerCase()}`}
                </p>
              </div>
            </div>

            <div className="analytics-line-chart">
              <Line data={dailySpendingData} options={dailySpendingOptions} />
            </div>
          </div>

          {/* Top spending categories */}

          <div className="analytics-category-card">
            <div className="analytics-card-heading">
              <div>
                <h3>Top Spending Categories</h3>

                <p>Where most of your money is going</p>
              </div>
            </div>
            {topCategories.length > 0 ? (
              topCategories.map(([category, amount]) => {
                return (
                  <div className="analytics-category" key={category}>
                    <div className="analytics-category-info">
                      <span>{category}</span>
                      <strong>₹{amount.toLocaleString()}</strong>
                    </div>

                    <div className="analytics-category-bar">
                      <div
                        className="category-bar"
                        style={{ width: `${(amount / totalSpending) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-category-message">
                No Expenses For {selectedPeriod}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Analytics;
