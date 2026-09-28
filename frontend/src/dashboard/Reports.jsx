import { useEffect, useState } from "react";
import API from "../services/api";
import * as XLSX from "@redoper1/xlsx-js-style";
import "../CSS/reports.css";

import {
  FileText,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Download,
} from "lucide-react";

import Sidebar from "./Sidebar";

function Reports() {
  const [transactions, setTransactions] = useState([]);

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("en-US", { month: "long" });
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(
    `${currentMonth} ${currentYear}`,
  );

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

  //total income
  const totalIncome = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      const [monthName, year] = selectedMonth.split(" ");

      const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth();

      return (
        transaction.type === "income" &&
        date.getMonth() === monthNumber &&
        date.getFullYear() === Number(year)
      );
    })
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  //Total expense
  const totalExpenses = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      const [monthName, year] = selectedMonth.split(" ");

      const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth();

      return (
        transaction.type === "expense" &&
        date.getMonth() === monthNumber &&
        date.getFullYear() === Number(year)
      );
    })
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  //Net savings
  const netSavings = totalIncome - totalExpenses;

  //Expense breakdown
  const categoryExpenses = {};

  transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      const [monthName, year] = selectedMonth.split(" ");

      const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth();

      return (
        transaction.type === "expense" &&
        date.getMonth() === monthNumber &&
        date.getFullYear() === Number(year)
      );
    })
    .forEach((transaction) => {
      const category = transaction.category;

      categoryExpenses[category] =
        (categoryExpenses[category] || 0) + Number(transaction.amount);
    });

  //Report download
  const downloadReport = () => {
    const [monthName, year] = selectedMonth.split(" ");

    const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth();

    const selectedMonthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        date.getMonth() === monthNumber && date.getFullYear() === Number(year)
      );
    });

    const categoryCount = Object.keys(categoryExpenses).length;

    // REPORT DATA

    const reportData = [
      // Row 1
      ["ExpensePilot Financial Report", ""],

      // Row 2
      [],

      // Row 3
      ["", "", "Report Period", selectedMonth],

      // Row 4
      ["", "", "Total Income", totalIncome],

      // Row 5
      ["", "", "Total Expenses", totalExpenses],

      // Row 6
      ["", "", "Net Savings", netSavings],

      // Row 7
      [
        "",
        "",
        "Savings Rate",
        totalIncome > 0
          ? Number(((netSavings / totalIncome) * 100).toFixed(1))
          : 0,
      ],

      // Row 8
      [],

      // Row 9
      ["Expense Breakdown", ""],

      // Row 10
      ["", "", "Category", "Amount"],

      // Expense categories
      ...Object.entries(categoryExpenses).map(([category, amount]) => [
        "",
        "",
        category,
        amount,
      ]),

      // Total Expenses
      ["", "", "Total Expenses", totalExpenses],

      // Blank
      [],

      // Blank
      [],

      // Transactions heading
      ["Transactions", ""],

      // Blank
      [],

      // Transaction column headings
      ["Date", "Type", "Category", "Description", "Payment Method", "Amount"],

      // Transaction data
      ...selectedMonthTransactions.map((transaction) => [
        new Date(transaction.date).toLocaleDateString("en-IN"),

        transaction.type,

        transaction.category,

        transaction.description || "-",

        transaction.paymentMethod || "-",

        Number(transaction.amount),
      ]),
    ];

    // CREATE WORKSHEET

    const worksheet = XLSX.utils.aoa_to_sheet(reportData);

    // COLUMN WIDTHS

    worksheet["!cols"] = [
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 32 },
      { wch: 20 },
      { wch: 18 },
    ];

    // ROW HEIGHT

    worksheet["!rows"] = [
      {
        hpt: 30,
      },
    ];

    // MERGE HEADINGS

    worksheet["!merges"] = [
      // ExpensePilot Financial Report
      {
        s: {
          r: 0,
          c: 0,
        },
        e: {
          r: 0,
          c: 5,
        },
      },

      // Expense Breakdown
      {
        s: {
          r: 8,
          c: 0,
        },
        e: {
          r: 8,
          c: 5,
        },
      },

      // Transactions
      {
        s: {
          r: 13 + categoryCount,
          c: 0,
        },
        e: {
          r: 13 + categoryCount,
          c: 5,
        },
      },
    ];

    // CENTER ALL CELLS

    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

        const cell = worksheet[cellAddress];

        if (cell) {
          cell.s = {
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
          };
        }
      }
    }

    // REPORT PERIOD

    if (worksheet["C3"]) {
      worksheet["C3"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        font: {
          bold: true,
        },
      };
    }

    if (worksheet["D3"]) {
      worksheet["D3"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        font: {
          bold: true,
        },
      };
    }

    // MAIN REPORT HEADING

    if (worksheet["A1"]) {
      worksheet["A1"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },

        font: {
          bold: true,
          sz: 16,
        },
      };
    }

    // SUMMARY VALUES

    // Total Income
    if (worksheet["D4"]) {
      worksheet["D4"].z = "₹#,##0";

      worksheet["D4"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }

    // Total Expenses
    if (worksheet["D5"]) {
      worksheet["D5"].z = "₹#,##0";

      worksheet["D5"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }

    // Net Savings
    if (worksheet["D6"]) {
      worksheet["D6"].z = "₹#,##0";

      worksheet["D6"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }

    // Savings Rate
    if (totalIncome > 0) {
      worksheet["D7"].v =
        Number(((netSavings / totalIncome) * 100).toFixed(1)) / 100;
    }

    if (worksheet["D7"]) {
      worksheet["D7"].z = "0.0%";

      worksheet["D7"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }

    // EXPENSE BREAKDOWN HEADING

    if (worksheet["A9"]) {
      worksheet["A9"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },

        font: {
          bold: true,
          sz: 13,
        },
      };
    }

    // EXPENSE BREAKDOWN COLUMN HEADINGS

    if (worksheet["C10"]) {
      worksheet["C10"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },

        font: {
          bold: true,
        },
      };
    }

    if (worksheet["D10"]) {
      worksheet["D10"].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },

        font: {
          bold: true,
        },
      };
    }

    // EXPENSE AMOUNTS

    Object.keys(categoryExpenses).forEach((_, index) => {
      const rowNumber = 11 + index;

      const cell = worksheet[`D${rowNumber}`];

      if (cell) {
        cell.z = "₹#,##0";

        cell.s = {
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        };
      }
    });

    // TOTAL EXPENSES

    const totalExpenseRow = 11 + categoryCount;

    if (worksheet[`C${totalExpenseRow}`]) {
      worksheet[`C${totalExpenseRow}`].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },

        font: {
          bold: true,
        },
      };
    }

    if (worksheet[`D${totalExpenseRow}`]) {
      worksheet[`D${totalExpenseRow}`].z = "₹#,##0";

      worksheet[`D${totalExpenseRow}`].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },

        font: {
          bold: true,
        },
      };
    }

    // TRANSACTIONS MAIN HEADING
    const transactionsHeadingRow = 14 + categoryCount;

    const transactionsHeadingCell = `A${transactionsHeadingRow}`;

    if (worksheet[transactionsHeadingCell]) {
      worksheet[transactionsHeadingCell].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },

        font: {
          bold: true,
          sz: 13,
        },
      };
    }

    // TRANSACTION COLUMN HEADINGS

    const transactionHeaderRow = 16 + categoryCount;

    const transactionHeaders = ["A", "B", "C", "D", "E", "F"];

    transactionHeaders.forEach((column) => {
      const cell = worksheet[`${column}${transactionHeaderRow}`];

      if (cell) {
        cell.s = {
          alignment: {
            horizontal: "center",
            vertical: "center",
          },

          font: {
            bold: true,
          },
        };
      }
    });

    // TRANSACTION AMOUNTS

    const transactionStartRow = 17 + categoryCount;

    selectedMonthTransactions.forEach((_, index) => {
      const rowNumber = transactionStartRow + index;

      const cell = worksheet[`F${rowNumber}`];

      if (cell) {
        cell.z = "₹#,##0";

        cell.s = {
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        };
      }
    });

    // CREATE WORKBOOK

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");

    // DOWNLOAD

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `ExpenseAI-${selectedMonth}-Report.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Reports</h1>
            <p>View and analyze your financial reports</p>
          </div>

          {/* <button className="generate-report-button">
            <Download size={15} />
            Generate Report
          </button> */}
        </header>

        <div className="reports-page">
          <div className="report-filter-card">
            <div>
              <span>Report Period</span>
              <h3>{selectedMonth}</h3>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month}>
                  {month} {new Date().getFullYear()}
                </option>
              ))}
            </select>
          </div>

          <div className="reports-summary">
            <div className="report-summary-card">
              <div className="report-icon income">
                <TrendingUp size={18} />
              </div>

              <div>
                <span>Total Income</span>
                <h3>₹{totalIncome.toLocaleString("en-IN")}</h3>
              </div>
            </div>

            <div className="report-summary-card">
              <div className="report-icon expense">
                <TrendingDown size={18} />
              </div>

              <div>
                <span>Total Expenses</span>
                <h3>₹{totalExpenses.toLocaleString()}</h3>
              </div>
            </div>

            <div className="report-summary-card">
              <div className="report-icon savings">
                <PiggyBank size={18} />
              </div>

              <div>
                <span>Net Savings</span>
                <h3>₹{netSavings.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <div className="reports-grid">
            {/* Expense breakdown */}

            <div className="report-card">
              <div className="report-card-heading">
                <div className="report-heading-icon">
                  <FileText size={17} />
                </div>

                <div>
                  <h3>Expense Breakdown</h3>
                  <p>Spending by category</p>
                </div>
              </div>

              {Object.entries(categoryExpenses).map(([category, amount]) => (
                <div className="report-category" key={category}>
                  <div>
                    <span>{category}</span>
                    <strong>₹{amount.toLocaleString()}</strong>
                  </div>

                  <div className="report-progress">
                    <div
                      className="report-progress-fill"
                      style={{ width: `${(amount / totalExpenses) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial summary */}

            <div className="report-card">
              <div className="report-card-heading">
                <div className="report-heading-icon">
                  <TrendingUp size={17} />
                </div>

                <div>
                  <h3>Financial Summary</h3>
                  <p>{selectedMonth} overview</p>
                </div>
              </div>

              <div className="financial-row">
                <span>Income</span>
                <strong className="report-income">
                  +₹{totalIncome.toLocaleString()}
                </strong>
              </div>

              <div className="financial-row">
                <span>Expenses</span>
                <strong className="report-expense">
                  -₹{totalExpenses.toLocaleString()}
                </strong>
              </div>

              <div className="financial-row">
                <span>Savings</span>
                <strong>₹{netSavings.toLocaleString()}</strong>
              </div>

              <div className="financial-row total">
                <span>Savings Rate</span>
                <strong>
                  {totalIncome > 0
                    ? ((netSavings / totalIncome) * 100).toFixed(1)
                    : 0}
                  %
                </strong>
              </div>
            </div>
          </div>

          {/* Report info */}

          <div className="report-info-card">
            <div className="report-info-icon">
              <FileText size={18} />
            </div>

            <div>
              <h3>Your {selectedMonth} report is ready</h3>

              <p>
                Generate a detailed report containing your income, expenses,
                savings and category-wise spending.
              </p>
            </div>

            <button className="download-report-button" onClick={downloadReport}>
              <Download size={15} />
              Download Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Reports;
