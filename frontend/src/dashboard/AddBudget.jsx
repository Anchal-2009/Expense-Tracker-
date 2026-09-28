import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import "../CSS/addTransaction.css";

function AddBudget() {
  const navigate = useNavigate();

  const location = useLocation();

  const budget = location.state?.budget;

  const [formData, setFormData] = useState({
    category: budget?.category || "",
    limit: budget?.limit || "",
    month: budget?.month ?? new Date().getMonth(),
    year: budget?.year ?? new Date().getFullYear(),
  });

  const [alertMessage, setAlertMessage] = useState("");

  const [alertType, setAlertType] = useState("");

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
      await API.post("/budgets", {
        category: formData.category,
        limit: Number(formData.limit),
        month: Number(formData.month),
        year: Number(formData.year),
      });
      showAlert(
        budget ? "Budget updated successfully" : "Budget saved successfully",
        "success",
      );
      setTimeout(() => {
        navigate("/budget");
      }, 1500);
    } catch (error) {
      console.log(error);
      showAlert(
        error.response?.data?.message || "Failed to add budget",
        "error",
      );
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, index) => currentYear + index);

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
        <button className="back-btn" onClick={() => navigate("/budget")}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3>Add Budget</h3>
          <p>Set a monthly spending limit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form-card">
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Health">Health</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div className="form-group">
          <label>Budget Limit</label>
          <input
            name="limit"
            placeholder="enter your budget limit"
            type="number"
            min="0"
            step="100"
            value={formData.limit}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Month</label>
          <select
            name="month"
            value={formData.month}
            onChange={handleInputChange}
            required
          >
            <option value={0}>January</option>
            <option value={1}>February</option>
            <option value={2}>March</option>
            <option value={3}>April</option>
            <option value={4}>May</option>
            <option value={5}>June</option>
            <option value={6}>July</option>
            <option value={7}>August</option>
            <option value={8}>September</option>
            <option value={9}>October</option>
            <option value={10}>November</option>
            <option value={11}>December</option>
          </select>
        </div>

        <div className="form-group">
          <label>Year</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            required
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="save-transaction-btn">
          {budget ? "Update Budget" : "Add Budget"}
        </button>
      </form>
    </div>
  );
}

export default AddBudget;
