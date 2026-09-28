import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useEffect, useState } from "react";
import "../CSS/transaction.css";

function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("All");
  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const [monthFilter, setMonthFilter] = useState(currentMonth);

  // Custom alert
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  // Custom delete confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await API.get("/transactions");
        // console.log("transactions received...",response.data);
        setTransactions(response.data);
      } catch (error) {
        console.log(error);
        setAlertMessage(
          error.response?.data?.message || "Failed to fetch transactions",
        );
        setAlertType("error");
      }
    };
    fetchTransactions();
  }, []);

  // Show custom alert
  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);

    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 5000);
  };

  // Open confirmation modal
  const openDelete = (id) => {
    setTransactionToDelete(id);
    setShowConfirm(true);
  };

  const handleDelete = async (id) => {
    if (!transactionToDelete) {
      return;
    }

    try {
      await API.delete(`/transactions/${transactionToDelete}`);

      setTransactions(
        transactions.filter(
          (transaction) => transaction._id !== transactionToDelete,
        ),
      );
      setShowConfirm(false);
      setTransactionToDelete(null);
      showAlert("Transaction deleted successfully", "success");
    } catch (error) {
      console.log(error);
      setShowConfirm(false);
      setTransactionToDelete(null);
      showAlert(
        error.response?.data?.message || "Failed to delete transaction",
        "error",
      );
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowConfirm(false);
    setTransactionToDelete(null);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    //Income/Expense Filter
    const typeMatch =
      filter === "All" ||
      transaction.type.toLowerCase() === filter.toLowerCase();

    //Month filter
    let monthMatch = true;
    if (monthFilter !== "All Months") {
      const transactionDate = new Date(transaction.date);

      const transactionMonth = transactionDate.toLocaleString("en-US", {
        month: "long",
      });

      const transactionYear = transactionDate.getFullYear();
      const transactionMonthYear = `${transactionMonth} ${transactionYear}`;

      monthMatch =
        transactionYear === new Date().getFullYear() &&
        transactionMonthYear === monthFilter;
    }
    return typeMatch && monthMatch;
  });

  const currentYear = new Date().getFullYear();

  //Create a list of months from transactions
  const months = [
    currentMonth,
    ...new Set(
      transactions
        .filter((transaction) => {
          const date = new Date(transaction.date);
          return date.getFullYear() === currentYear;
        })
        .map((transaction) => {
          const date = new Date(transaction.date);

          return date.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          });
        }),
    ),
  ].filter((month, index, array) => array.indexOf(month) === index);

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="dashboard-main">
        {/* CUSTOM ALERT */}
        {alertMessage && (
          <div className={`transaction-alert ${alertType}`}>
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

        {/* DELETE CONFIRMATION */}
        {showConfirm && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <h3>Delete Transaction?</h3>

              <p>
                Are you sure you want to delete this transaction? This action
                cannot be undone.
              </p>

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="cancel-delete-btn"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirm-delete-btn"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Transactions</h1>
            <p>View and manage all your transactions</p>
          </div>
          <button
            className="add-transaction-button"
            onClick={() => navigate("/addtransaction")}
          >
            <Plus size={15} />
            Add Transaction
          </button>
        </header>

        <div className="transactions-page">
          {/* Filters */}
          <div className="transactions-toolbar">
            {/* type filter */}
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              <option>Income</option>
              <option>Expense</option>
            </select>

            {/* Month filter */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              {months.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="transactions-card">
            <div className="transactions-card-header">
              <div>
                <h3>All Transactions</h3>
                <p>{filteredTransactions.length} Transactions found</p>
              </div>
            </div>

            <div className="transactions-table-header">
              <span>Transactions</span>
              <span>Category</span>
              <span>Type</span>
              <span>PaymentMethod</span>
              <span>Date</span>
              <span>Amount</span>
            </div>

            {/* Transactions */}
            {filteredTransactions.length === 0 ? (
              <div className="no-transactions">
                <p>No transactions found.</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div className="transaction-row" key={transaction._id}>
                  <div className="transaction-name">
                    <div className="transaction-icon">
                      {transaction.type === "income" ? "💰" : "🛒"}
                    </div>

                    <div>
                      <strong>
                        {transaction.description || "Transaction"}
                      </strong>
                      <span>{transaction.category}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <span>{transaction.category}</span>

                  {/* Type */}
                  <span
                    className={
                      transaction.type === "income"
                        ? "income-label"
                        : "expense-label"
                    }
                  >
                    {transaction.type === "income" ? "Income" : "Expense"}
                  </span>

                  {/* PaymentMethod */}
                  <span>{transaction.paymentMethod || "Cash"}</span>

                  {/* Date */}
                  <span>
                    {new Date(transaction.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  {/* AMOUNT */}
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
                  <button
                    className="delete-transaction-btn"
                    onClick={() => openDelete(transaction._id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Transactions;
