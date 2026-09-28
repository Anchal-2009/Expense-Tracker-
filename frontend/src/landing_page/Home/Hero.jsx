import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import Features from "./Features";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Star size={14} fill="current-color" />
            Smart Money Management
          </div>
          <h1>
            Take Control of <br /> Your Finances
          </h1>
          <h2>Track. Analyze. Save.</h2>
          <p className="hero-description">
            ExpensePilot helps you track expenses, set budgets,
            <br /> and get AI powered insights to achieve your <br /> financial
            goals faster.
          </p>
          <button className="primary-btn" onClick={() => navigate("/signup")}>
            Get Started Free <ArrowRight size={17} />
          </button>
        </div>
        <img src="images/image.png" className="hero-img" />
      </section>

      {/* Features */}
      <Features />

      {/* Bottom */}
      <section className="bottom-cta">
        <div className="cta-illustration">
          <ShieldCheck size={70} />
        </div>
        <div className="cta-content">
          <h2>Ready to Take Control of your Finances?</h2>
          <p>Join the users who are managing their money smarter</p>
        </div>

        <div className="cta-action">
          <button className="bottom-btn" onClick={() => navigate("/signup")}>
            Get Started Free <ArrowRight size={17} />
          </button>
          <span>No credit card required</span>
        </div>
      </section>
    </div>
  );
}

export default Hero;
