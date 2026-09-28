import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenseCategoryChart({ transactions, selectedMonth }) {
  const categories = ["Food", "Transport", "Shopping", "Bills", "Others"];

  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    return (
      transaction.type === "expense" &&
      date.getMonth() === selectedMonth &&
      date.getFullYear() === currentYear
    );
  });

  const categoryAmounts = categories.map((category) => {
    if (category === "Others") {
      return currentMonthExpenses
        .filter((transaction) => {
          const transactionCategory = transaction.category.toLowerCase();

          return !["food", "transport", "shopping", "bills"].includes(
            transactionCategory,
          );
        })
        .reduce((total, transaction) => total + Number(transaction.amount), 0);
    }
    return currentMonthExpenses
      .filter(
        (transaction) =>
          transaction.category.toLowerCase() === category.toLowerCase(),
      )
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  });

  const totalExpenses = categoryAmounts.reduce(
    (total, Amount) => total + Amount,
    0,
  );

  const percentages = categoryAmounts.map((amount) => {
    if (totalExpenses === 0) {
      return 0;
    }

    return Math.round((amount / totalExpenses) * 100);
  });

  const data = {
    labels: categories,
    datasets: [
      {
        data: categoryAmounts,
        backgroundColor: [
          "#16a34a",
          "#3b82f6",
          "#d99a31",
          "#a45b8a",
          "#8b9494",
        ],
        borderWidth: 0,
        borderColor: "#ffffff",
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return (
              context.label +
              ": ₹" +
              Number(context.raw).toLocaleString("en-IN")
            );
          },
        },
      },
    },
  };

  return (
    <div className="expense-category-wrapper">
      <div className="expense-category-chart">
        <Doughnut data={data} options={options} />
        <div className="donut-center">
          <strong>₹{totalExpenses.toLocaleString("en-IN")}</strong>
          <span>Total</span>
        </div>
      </div>
      <div className="category-list">
        {categories.map((category, index) => {
          return (
            <div className="category-item" key={category}>
              <span className={`category-dot ${category.toLowerCase()}`}></span>
              {category}
              <strong>{percentages[index]}%</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExpenseCategoryChart;
