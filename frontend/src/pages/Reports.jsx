import { useState } from "react";
import api from "../api/axios.js";
import { formatINR } from "../utils/currency.js";

const reportOptions = [
  { key: "daily-sales", label: "Daily Sales" },
  { key: "monthly-sales", label: "Monthly Sales" },
  { key: "platform-sales", label: "Platform-wise Sales" },
  { key: "dead-stock", label: "Dead Stock" },
  { key: "fast-moving", label: "Fast Moving Products" },
  { key: "profit", label: "Profit Report" }
];

export default function Reports() {
  const [reportKey, setReportKey] = useState("daily-sales");
  const [rows, setRows] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [error, setError] = useState("");

  const loadReport = async () => {
    setError("");
    try {
      const { data } = await api.get(`/api/reports/${reportKey}`);
      if (reportKey === "profit") {
        setRows(data.rows || []);
        setTotalProfit(data.totalProfit || 0);
      } else {
        setRows(data || []);
        setTotalProfit(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
    }
  };

  const exportCsv = async () => {
    try {
      const response = await api.get(`/api/reports/${reportKey}`, {
        params: { export: "csv" },
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportKey}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "CSV export failed");
    }
  };

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-semibold">Reports</h2>
      <div className="card grid gap-3 p-4 md:grid-cols-4">
        <select className="input md:col-span-2" value={reportKey} onChange={(e) => setReportKey(e.target.value)}>
          {reportOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={loadReport}>
          Load Report
        </button>
        <button className="btn btn-primary" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      {error && <div className="card p-4 text-red-600">{error}</div>}

      {reportKey === "profit" && rows.length > 0 && (
        <div className="card p-4 text-sm">
          Total Profit: <span className="font-semibold">{formatINR(totalProfit)}</span>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              {rows.length ? (
                Object.keys(rows[0]).map((key) => (
                  <th key={key} className="px-4 py-3">
                    {key}
                  </th>
                ))
              ) : (
                <th className="px-4 py-3">Data</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-t border-slate-100">
                {Object.entries(row).map(([key, value]) => {
                  const isCurrency = ["sales", "totalAmount", "profit", "sellingPrice", "costPrice"].includes(key);
                  return <td key={key} className="px-4 py-3">{isCurrency ? formatINR(value) : String(value)}</td>;
                })}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-4 py-6 text-slate-500">Load a report to view data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
