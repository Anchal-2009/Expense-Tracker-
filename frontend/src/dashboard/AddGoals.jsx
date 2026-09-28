import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../CSS/addTransaction.css";

function AddGoal() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    savedAmount: "",
    targetDate: "",
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/goals", {
        name: formData.name,
        description: formData.description,
        targetAmount: Number(formData.targetAmount),
        savedAmount: Number(formData.savedAmount || 0),
        targetDate: formData.targetDate,
      });

      showAlert("Goal added successfully", "success");

      setFormData({
        name: "",
        description: "",
        targetAmount: "",
        savedAmount: "",
        targetDate: "",
      });

      setTimeout(() => {
        navigate("/goals");
      }, 1500);
    } catch (error) {
      console.log(error);

      showAlert(error.response?.data?.message || "Failed to add goal", "error");
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
        <button className="back-btn" onClick={() => navigate("/goals")}>
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1>Add Goal</h1>
          <p>Set a financial goal and track your progress</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form-card">
        <div className="form-group">
          <label>Goal Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter goal name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>

          <input
            type="text"
            name="description"
            placeholder="Enter short description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Target Amount</label>

            <input
              type="number"
              name="targetAmount"
              placeholder="Enter target amount"
              min="1"
              value={formData.targetAmount}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Already Saved</label>

            <input
              type="number"
              name="savedAmount"
              placeholder="Enter saved amount"
              min="0"
              value={formData.savedAmount}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Target Date</label>

          <input
            type="date"
            name="targetDate"
            value={formData.targetDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="save-transaction-btn">
          Add Goal
        </button>
      </form>
    </div>
  );
}

export default AddGoal;
