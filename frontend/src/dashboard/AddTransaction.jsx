import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../CSS/addTransaction.css";

function AddTransaction() {
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    category: "",
    description: "",
    date: "",
    paymentMethod: "",
  });

  const [alertMessage, setAlertMessage] = useState("");

  const [alertType, setAlertType] = useState("");

  const navigate = useNavigate();

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);

    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 5000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/transactions", {
        type: formData.type,
        amount: formData.amount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
      });

      showAlert("Transaction added successfully", "success");
      setFormData({
        type: "income",
        amount: "",
        category: "",
        description: "",
        date: "",
        paymentMethod: "",
      });
    } catch (error) {
      console.log(error);
      showAlert(
        error.response?.data?.message || "Failed to add transaction",
        "error",
      );
    }
  };

  return (
    <div className="add-transaction-page">
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
      <div className="add-transaction-header">
        <button className="back-btn" onClick={() => navigate("/transactions")}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>Add Transaction</h1>
          <p>Record your income or expense</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form-card">
        <div className="form-group">
          <label>Transaction Type</label>
          <div className="transaction-type">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "income" })}
              className={`type-btn ${formData.type === "income" ? "active-income" : ""}`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "expense" })}
              className={`type-btn ${formData.type === "expense" ? "active-expense" : ""}`}
            >
              Expense
            </button>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              placeholder="enter amount"
              min="0"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select Category</option>
              <option>Food</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Salary</option>
              <option>Bills</option>
              <option>Entertainment</option>
              <option>Health</option>
              <option>Education</option>
              <option>Others</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            placeholder="enter short description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="Date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Payment Method</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
          >
            <option value="">Select Category</option>
            <option>UPI</option>
            <option>Cash</option>
            <option>Debit Card</option>
            <option>Credit Card</option>
            <option>Bank Transfer</option>
            <option>Net Banking</option>
            <option>Cheque</option>
            <option>Others</option>
          </select>
        </div>
        <button
          type="submit"
          className={`save-transaction-btn ${formData.type === "expense" ? "save-expense" : ""}`}
        >
          Add {formData.type === "income" ? "Income" : "Expense"}
        </button>
      </form>
    </div>
  );
}

export default AddTransaction;
