import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function IncomeExpenseChart({ transactions, selectedYear }) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const incomeData = months.map((_, monthIndex) => {
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);
        return (
          transaction.type === "income" &&
          date.getFullYear() === selectedYear &&
          date.getMonth() === monthIndex
        );
      })
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  });

  const expenseData = months.map((_, monthIndex) => {
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);
        return (
          transaction.type === "expense" &&
          date.getFullYear() === selectedYear &&
          date.getMonth() === monthIndex
        );
      })
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  });

  const data = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: "#5BBF7A",
        borderRadius: 3,
        // barThickness: 12,
        categoryPercentage: 0.6,
        barPercentage: 0.7,
      },
      {
        label: "Expense",
        data: expenseData,
        backgroundColor: "#E86A63",
        borderRadius: 3,
        // barThickness: 12,
        categoryPercentage: 0.6,
        barPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "start",
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return (
              context.dataset.label +
              ": ₹" +
              context.raw.toLocaleString("en-IN")
            );
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
          font: {
            size: 11,
          },
          color: "#8c9797",
        },
        border: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,
        grid: {
          color: "#edf0ef",
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#8c9797",
          callback: function (value) {
            return "₹" + value / 1000 + "k";
          },
        },
        border: {
          display: false,
        },
      },
    },

    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <div className="income-expense-chart">
      <Bar data={data} options={options} />
    </div>
  );
}

export default IncomeExpenseChart;
