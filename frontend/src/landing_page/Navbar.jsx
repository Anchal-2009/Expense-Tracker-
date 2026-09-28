import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <div className="logo-icon">
          <TrendingUp size={18} />
        </div>
        <span>
          Expense<span className="logo-green">Pilot</span>
        </span>
      </Link>
      <div className="nav-buttons">
        <Link to="/login" className="login-btn">
          Log in
        </Link>
        <Link to="/signup" className="signup-btn">
          Sign up
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
