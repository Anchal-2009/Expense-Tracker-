import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import API from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
      const response = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      //save jwt token
      localStorage.setItem("token", response.data.token);

      //save user inf
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setAlertMessage("Login successfully");
      setAlertType("success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.log(error);
      setAlertMessage(error.response?.data?.message || "Login failed");
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
      <div className="login-page">
        {/* Left-side */}
        <div className="login-left">
          <div className="container">
            <div className="login-heading">
              <h1>Welcome Back!</h1>
              <p>Login to your account</p>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="email"
                    placeholder="enter your email"
                    onChange={handleinputchange}
                    value={formData.email}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    name="password"
                    placeholder="enter your password"
                    onChange={handleinputchange}
                    value={formData.password}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="button">
                <span>Login</span>
                <ArrowRight size={20} />
              </button>
            </form>
            <p className="text">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Right-side */}
        <div className="login-right">
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

export default Login;
