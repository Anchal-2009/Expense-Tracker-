import { useNavigate } from "react-router-dom";

function RecentTransactions({ transactions }) {
  const navigate = useNavigate();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="dashboard-card recent-transactions">
      <div className="card-header">
        <div>
          <h3>Recent Transactions</h3>
          <p>Your latest financial activity</p>
        </div>
        <button
          className="view-all-button"
          onClick={() => navigate("/transactions")}
        >
          View All Transactions
        </button>
      </div>
      <div className="recent-transaction-table-header">
        <span>Transaction</span>
        <span>Category</span>
        <span>Type</span>
        <span>Amount</span>
        <span>Date</span>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="no-transactions">
          <p>No transactions yet.</p>
        </div>
      ) : (
        recentTransactions.map((transaction) => {
          return (
            <div className="recent-transaction-row" key={transaction._id}>
              {/* transaction */}
              <div className="transaction-name">
                <div className="transaction-icon">
                  {transaction.type === "income" ? "💰" : "🛒"}
                </div>

                <span>{transaction.description || "Transaction"}</span>
              </div>

              {/* category */}
              <span>{transaction.category}</span>

              {/* type */}
              <span
                className={
                  transaction.type === "income"
                    ? "income-label"
                    : "expense-label"
                }
              >
                {transaction.type === "income" ? "Income" : "Expense"}
              </span>

              {/* Amount */}
              <strong
                className={
                  transaction.type === "income"
                    ? "income-amount"
                    : "expense-amount"
                }
              >
                {transaction.type === "income" ? "+" : "-"}₹
                {Number(transaction.amount).toLocaleString("en-IN")}
              </strong>

              {/* Date */}
              <span>
                {new Date(transaction.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

export default RecentTransactions;
