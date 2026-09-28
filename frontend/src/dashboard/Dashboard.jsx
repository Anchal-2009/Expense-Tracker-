import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import IncomeExpenseChart from "./IncomeExpenseChart";
import ExpenseCategoryChart from "./ExpenseCategoryChart";
import RecentTransactions from "./RecentTransaction";
import BudgetOverview from "./BudgetOverview";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../CSS/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  const [transactions, setTransactions] = useState([]);

  // Selected year for Income vs Expense chart
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name);
    }
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await API.get("/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTransactions();
  }, []);

  // Current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  //Previous Month
  let previousMonth = currentMonth - 1;
  let previousMonthYear = currentYear;

  if (previousMonth < 0) {
    previousMonth = 11;
    previousMonthYear = currentYear - 1;
  }

  //current month income
  const currentMonthIncome = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        transaction.type === "income" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  //previous month income
  const previousMonthIncome = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        transaction.type === "income" &&
        date.getMonth() === previousMonth &&
        date.getFullYear() === previousMonthYear
      );
    })
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  //Current month expenses
  const currentMonthExpenses = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        transaction.type === "expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  //Previous month expenses
  const previousMonthExpenses = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        transaction.type === "expense" &&
        date.getMonth() === previousMonth &&
        date.getFullYear() === previousMonthYear
      );
    })
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  // Total income of current year
  const totalIncome = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        transaction.type === "income" && date.getFullYear() === currentYear
      );
    })
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  // Total expenses of current year
  const totalExpenses = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        transaction.type === "expense" && date.getFullYear() === currentYear
      );
    })
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  //total balance
  const balance = totalIncome - totalExpenses;

  //current month balance
  const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

  //previous month balance
  const previousMonthBalance = previousMonthIncome - previousMonthExpenses;

  //calculate percentage change
  const calculateChange = (current, previous) => {
    if (previous === 0) {
      return current === 0 ? 0 : null;
    }

    return Math.round(((current - previous) / previous) * 100);
  };

  const incomeChange = calculateChange(currentMonthIncome, previousMonthIncome);

  const expenseChange = calculateChange(
    currentMonthExpenses,
    previousMonthExpenses,
  );

  const balanceChange = calculateChange(
    currentMonthBalance,
    previousMonthBalance,
  );

  const years = Array.from(
    { length: 6 },
    (_, index) => currentYear - 2 + index,
  );

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome Back, {userName}!👋</h1>
            <p>Here's your financial overview</p>
          </div>
          <button
            className="add-transaction-button"
            onClick={() => navigate("/addtransaction")}
          >
            <Plus size={15} />
            Add Transaction
          </button>
        </header>

        <section className="dashboard-content">
          <div className="summary-grid">
            {/* balance   */}
            <div className="summary-card">
              <div className="summary-card-top">
                <div>
                  <p>Total Balance</p>
                  <h2>₹{balance.toLocaleString("en-IN")}</h2>
                  <div className="summary-bottom positive">This year</div>
                </div>
              </div>
            </div>

            {/* income */}
            <div className="summary-card">
              <div className="summary-card-top">
                <div>
                  <p>Total Income</p>
                  <h2>₹{totalIncome.toLocaleString("en-IN")}</h2>
                  <div className="summary-bottom positive">This year</div>
                </div>
              </div>
            </div>

            {/* expense */}
            <div className="summary-card">
              <div className="summary-card-top">
                <div>
                  <p>Total Expenses</p>
                  <h2>₹{totalExpenses.toLocaleString("en-IN")}</h2>
                  <div className="summary-bottom positive">This year</div>
                </div>
              </div>
            </div>

            {/* savings */}
            <div className="summary-card">
              <div className="summary-card-top">
                <div>
                  <p>Savings</p>
                  <h2>₹{balance.toLocaleString("en-IN")}</h2>
                  <div className="summary-bottom positive">This year</div>
                </div>
              </div>
            </div>
          </div>

          {/* income vs expense */}
          <div className="dashboard-row">
            {/* income vs expense */}
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Income vs Expense</h3>
                  <p>Your financial activity this year</p>
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {" "}
                      {year}{" "}
                    </option>
                  ))}
                </select>
              </div>
              <IncomeExpenseChart
                transactions={transactions}
                selectedYear={selectedYear}
              />
            </div>

            {/* Expense by category */}
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Expenses by Category</h3>
                  <p>This month's spending</p>
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  <option value={0}>January</option>
                  <option value={1}>Februray</option>
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
              <ExpenseCategoryChart
                transactions={transactions}
                selectedMonth={selectedMonth}
              />
            </div>
          </div>

          {/* recent transactions and budget overview */}

          <div className="dashboard-row bottom">
            <RecentTransactions transactions={transactions} />
            <BudgetOverview transactions={transactions} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
