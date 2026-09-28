import { useEffect, useState } from "react";
import API from "../services/api";
import "../CSS/settings.css";

import { User, Save } from "lucide-react";

import Sidebar from "./Sidebar";

function Settings() {
  const savedUser = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState(savedUser?.name || "");

  const [email, setEmail] = useState(savedUser?.email || "");

  const [memberSince, setMemberSince] = useState("");

  const [accountStatus, setAccountStatus] = useState("Active");

  const [alertMessage, setAlertMessage] = useState("");

  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/auth/me");
        setAccountStatus("Active");
        const createdDate = new Date(response.data.user.createdAt);
        setMemberSince(
          createdDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        );
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const response = await API.put("/auth/profile", {
        name: name,
      });

      localStorage.setItem("user", JSON.stringify(response.data.user));

      setAlertMessage("Settings saved successfully");
      setAlertType("success");
    } catch (error) {
      console.log(error);

      setAlertMessage("Failed to update settings");
      setAlertType("error");
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        {/* HEADER */}
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Settings</h1>
            <p>Manage your account and preferences</p>
          </div>
        </header>

        <div className="settings-page">
          {alertMessage && (
            <div className={`custom-alert ${alertType}`}>
              <span>{alertMessage}</span>
              <button type="button" onClick={() => setAlertMessage("")}>
                ×
              </button>
            </div>
          )}

          {/* PROFILE */}

          <div className="settings-card">
            <div className="settings-heading">
              <div className="settings-heading-icon">
                <User size={17} />
              </div>

              <div>
                <h3>Profile Information</h3>
                <p>Update your personal information</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="settings-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="settings-form-group">
                <label>Email Address</label>
                <input type="email" value={email} readOnly />
              </div>
            </div>

            <div className="settings-account-info">
              <div className="account-info-item">
                <span>Account Status</span>
                <strong>{accountStatus}</strong>
              </div>

              <div className="account-info-item">
                <span>Member Since</span>
                <strong>{memberSince}</strong>
              </div>
            </div>
          </div>

          {/* SAVE */}

          <div className="settings-save-area">
            <button
              className="save-settings-button"
              onClick={handleSaveSettings}
            >
              <Save size={15} />
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
