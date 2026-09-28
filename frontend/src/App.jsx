import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./landing_page/Home/HomePage";
import Signup from "./landing_page/Signup/Signup";
import Login from "./landing_page/Signup/Login";
import Dashboard from "./dashboard/Dashboard";
import AddTransaction from "./dashboard/AddTransaction";
import Transactions from "./dashboard/Transactions";
import Budget from "./dashboard/Budget";
import Analytics from "./dashboard/Analytics";
import Reports from "./dashboard/Reports";
import Settings from "./dashboard/Settings";
import Goals from "./dashboard/Goals";
import ProtectedRoute from "./components/ProtectedRoute";
import AddBudget from "./dashboard/AddBudget";
import AddGoal from "./dashboard/AddGoals";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/addtransaction"
          element={
            <ProtectedRoute>
              <AddTransaction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addbudget"
          element={
            <ProtectedRoute>
              <AddBudget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addgoal"
          element={
            <ProtectedRoute>
              <AddGoal />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
