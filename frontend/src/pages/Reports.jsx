import { useEffect, useMemo, useState } from "react";
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

const chartColors = ["#10b981", "#0ea5e9", "#f59e0b", "#f97316", "#6366f1", "#ef4444", "#14b8a6"];

function buildPieSlices(data) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (!total) return [];

  let currentAngle = -Math.PI / 2;
  return data.map((item, index) => {
    const sliceAngle = (item.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const x1 = 50 + 45 * Math.cos(startAngle);
    const y1 = 50 + 45 * Math.sin(startAngle);
    const x2 = 50 + 45 * Math.cos(endAngle);
    const y2 = 50 + 45 * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const path = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      ...item,
      path,
      color: chartColors[index % chartColors.length]
    };
  });
}

function buildLinePath(data) {
  if (data.length === 0) return "";

  const values = data.map((item) => item.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const width = 600;
  const height = 200;
  const paddingX = 24;
  const paddingY = 24;

  const points = data.map((item, index) => {
    const x = paddingX + (index / Math.max(data.length - 1, 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((item.value - min) / range) * (height - paddingY * 2);
    return { ...item, x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  return { path, points, width, height, paddingX, paddingY };
}

export default function Reports() {
  const [reportKey, setReportKey] = useState("daily-sales");
  const [rows, setRows] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("bar");

  const loadReport = async () => {
    setError("");
    setLoading(true);
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
    } finally {
      setLoading(false);
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

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey]);

  const summary = useMemo(() => {
    if (!rows.length) return null;

    if (reportKey === "daily-sales" || reportKey === "monthly-sales") {
      const totalSales = rows.reduce((sum, row) => sum + Number(row.sales || 0), 0);
      const totalOrders = rows.reduce((sum, row) => sum + Number(row.orders || 0), 0);
      return [
        { label: "Total Sales", value: formatINR(totalSales) },
        { label: "Total Orders", value: totalOrders.toLocaleString() }
      ];
    }

    if (reportKey === "platform-sales") {
      const totalSales = rows.reduce((sum, row) => sum + Number(row.sales || 0), 0);
      const totalOrders = rows.reduce((sum, row) => sum + Number(row.orders || 0), 0);
      return [
        { label: "Total Sales", value: formatINR(totalSales) },
        { label: "Total Orders", value: totalOrders.toLocaleString() }
      ];
    }

    if (reportKey === "dead-stock") {
      const totalItems = rows.reduce((sum, row) => sum + Number(row.quantityAvailable || 0), 0);
      return [
        { label: "Dead Stock Items", value: rows.length.toLocaleString() },
        { label: "Total Quantity", value: totalItems.toLocaleString() }
      ];
    }

    if (reportKey === "fast-moving") {
      const totalSold = rows.reduce((sum, row) => sum + Number(row.soldQty || 0), 0);
      return [
        { label: "Products Tracked", value: rows.length.toLocaleString() },
        { label: "Units Sold", value: totalSold.toLocaleString() }
      ];
    }

    if (reportKey === "profit") {
      return [
        { label: "Total Profit", value: formatINR(totalProfit) },
        { label: "Orders", value: rows.length.toLocaleString() }
      ];
    }

    return null;
  }, [reportKey, rows, totalProfit]);

  const chart = useMemo(() => {
    if (!rows.length) return null;

    if (reportKey === "daily-sales" || reportKey === "monthly-sales") {
      return {
        title: "Sales Trend",
        valueLabel: "Sales",
        formatter: formatINR,
        data: rows.map((row) => ({
          label: row._id,
          value: Number(row.sales || 0)
        })),
        kind: "time"
      };
    }

    if (reportKey === "platform-sales") {
      return {
        title: "Sales by Platform",
        valueLabel: "Sales",
        formatter: formatINR,
        data: rows.map((row) => ({
          label: row._id || "Unknown",
          value: Number(row.sales || 0)
        })),
        kind: "category"
      };
    }

    if (reportKey === "dead-stock") {
      return {
        title: "Dead Stock Quantity",
        valueLabel: "Quantity",
        formatter: (value) => value.toLocaleString(),
        data: rows.slice(0, 10).map((row) => ({
          label: row.name,
          value: Number(row.quantityAvailable || 0)
        })),
        kind: "category"
      };
    }

    if (reportKey === "fast-moving") {
      return {
        title: "Fast Moving Products",
        valueLabel: "Units Sold",
        formatter: (value) => value.toLocaleString(),
        data: rows.map((row) => ({
          label: row.name,
          value: Number(row.soldQty || 0)
        })),
        kind: "category"
      };
    }

    if (reportKey === "profit") {
      const byPlatform = rows.reduce((acc, row) => {
        const key = row.platform || "Unknown";
        acc[key] = (acc[key] || 0) + Number(row.profit || 0);
        return acc;
      }, {});

      return {
        title: "Profit by Platform",
        valueLabel: "Profit",
        formatter: formatINR,
        data: Object.entries(byPlatform)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value),
        kind: "category"
      };
    }

    return null;
  }, [reportKey, rows, totalProfit]);

  const availableChartTypes = useMemo(() => {
    if (!chart) return [];
    if (chart.kind === "time") return ["line", "bar"];
    return ["bar", "pie"];
  }, [chart]);

  useEffect(() => {
    if (!availableChartTypes.length) return;
    if (!availableChartTypes.includes(chartType)) {
      setChartType(availableChartTypes[0]);
    }
  }, [availableChartTypes, chartType]);

  const pieSlices = useMemo(() => {
    if (!chart || chartType !== "pie") return [];
    return buildPieSlices(chart.data);
  }, [chart, chartType]);

  const line = useMemo(() => {
    if (!chart || chartType !== "line") return null;
    return buildLinePath(chart.data);
  }, [chart, chartType]);

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
        <button className="btn btn-secondary" onClick={loadReport} disabled={loading}>
          {loading ? "Loading..." : "Reload Report"}
        </button>
        <button className="btn btn-primary" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      {error && <div className="card p-4 text-red-600">{error}</div>}

      {summary && (
        <div className="grid gap-3 md:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label} className="card p-4">
              <div className="text-sm text-slate-600">{item.label}</div>
              <div className="mt-1 text-2xl font-semibold text-ink">{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {chart && (
        <div className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-slate-700">{chart.title}</div>
            {availableChartTypes.length > 1 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">View</span>
                {availableChartTypes.map((type) => (
                  <button
                    key={type}
                    className={`btn ${chartType === type ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setChartType(type)}
                    type="button"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {chart.data.length === 0 && <div className="text-sm text-slate-500">No chart data available.</div>}

            {chartType === "bar" && (
              <div className="space-y-3">
                {chart.data.map((item) => {
                  const max = Math.max(...chart.data.map((d) => d.value), 1);
                  const percent = Math.round((item.value / max) * 100);
                  return (
                    <div key={item.label} className="grid gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="font-medium text-ink">{chart.formatter(item.value)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {chartType === "line" && line && (
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${line.width} ${line.height}`} className="w-full">
                  <line
                    x1={line.paddingX}
                    y1={line.height - line.paddingY}
                    x2={line.width - line.paddingX}
                    y2={line.height - line.paddingY}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <path d={line.path} fill="none" stroke="#10b981" strokeWidth="3" />
                  {line.points.map((point) => (
                    <circle key={point.label} cx={point.x} cy={point.y} r="4" fill="#10b981" />
                  ))}
                </svg>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  {line.points.map((point) => (
                    <span key={point.label} className="rounded-full bg-slate-100 px-2 py-1">
                      {point.label}: {chart.formatter(point.value)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {chartType === "pie" && pieSlices.length > 0 && (
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <svg viewBox="0 0 100 100" className="h-56 w-56">
                  {pieSlices.map((slice) => (
                    <path key={slice.label} d={slice.path} fill={slice.color} />
                  ))}
                </svg>
                <div className="grid gap-2 text-sm">
                  {pieSlices.map((slice) => (
                    <div key={slice.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: slice.color }} />
                        <span className="text-slate-700">{slice.label}</span>
                      </div>
                      <span className="font-medium text-ink">{chart.formatter(slice.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
                  return (
                    <td key={key} className="px-4 py-3">
                      {isCurrency ? formatINR(value) : String(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-4 py-6 text-slate-500">
                  {loading ? "Loading report..." : "No data available for this report."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}