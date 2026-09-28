import {
  BarChart3,
  Bot,
  Receipt,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react";

function Features() {
  const features = [
    {
      icon: Receipt,
      title: "Track Expenses",
      description:
        "Easily track all your expenses in one place with smart categorization",
      color: "green",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Visualize your spending patterns with beautiful charts and reports",
      color: "blue",
    },
    {
      icon: Wallet,
      title: "Budget Management",
      description:
        "Set budgets for categories and get alerts when you're close to the limit",
      color: "yellow",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description:
        "Set financial goals and track your progress towards achieving them",
      color: "pink",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      description:
        "Your data is encrypted and secure. We never share your information",
      color: "teal",
    },
  ];

  return (
    <section className="features-section">
      <div className="section-heading">
        <span className="section-label">FEATURES</span>
        <h2>Everything You Need to Manage Your Money</h2>
        <p>
          Poweful features to help you track, analyze, and optimize your
          finances
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div className="feature-card" key={index}>
              <div className={`feature-icon ${feature.color}`}>
                <Icon size={24} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Features;
