import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import API from "../../services/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const handleinputchange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setAlertMessage("Account created successfully");
      setAlertType("success");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.log(error);
      setAlertMessage(error.response?.data?.message || "Signup failed");
      setAlertType("error");
    }
  };

  return (
    <>
      {alertMessage && (
        <div className={`custom-alert ${alertType}`}>
          <span>{alertMessage}</span>
          <button type="button" onClick={() => setAlertMessage("")}>
            ×
          </button>
        </div>
      )}
      <div className="signup-page">
        {/* Left-side */}
        <div className="signup-left">
          <div className="container">
            <div className="heading">
              <h1>Create Account</h1>
              <p>Start managing your expenses today</p>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    name="name"
                    value={formData.name}
                    onChange={handleinputchange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={formData.email}
                    onChange={handleinputchange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    name="password"
                    value={formData.password}
                    onChange={handleinputchange}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="button">
                <span>Sign up</span>
                <ArrowRight size={20} />
              </button>
            </form>
            <p className="text">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>

        {/* Right-side */}
        <div className="signup-right">
          <img
            src="images/signup.png"
            className="image"
            alt="ExpenseAI financial management"
          />
        </div>
      </div>
    </>
  );
}

export default Signup;
