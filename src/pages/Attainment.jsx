import React, { useEffect, useState, useRef, useMemo } from "react";
import logo from '../assets/img/eklogo.png';

// Load Bootstrap CSS and JS dynamically
const Bootstrap = () => (
  <>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  </>
);

/* =========================== Helpers =========================== */
const toNum = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const s = String(v).trim();
  if (!s) return 0;
  // Handle percentage strings (e.g., "101%") by removing the '%'
  const cleaned = s.replace(/[, %]+/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n));

const parseSheetDate = (s) => {
  if (!s) return null;
  if (s instanceof Date && !isNaN(s)) return toYMD(s);
  const str = String(s).trim();
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const [_, y, m, d] = isoMatch;
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    if (!isNaN(dt)) return toYMD(dt);
  }
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    if (!isNaN(dt)) return toYMD(dt);
  }
  const dt = new Date(str);
  if (!isNaN(dt)) return toYMD(dt);
  return null;
};

const toYMD = (d) => {
  if (!(d instanceof Date) || isNaN(d)) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const lastNDates = (endYMD, n = 10) => {
  const [y, m, d] = endYMD.split("-").map(Number);
  const end = new Date(y, m - 1, d);
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(end);
    t.setDate(end.getDate() - i);
    arr.push(toYMD(t));
  }
  return arr;
};

const sumBy = (rows, key) => rows.reduce((acc, r) => acc + toNum(r[key]), 0);

const formatHeaderLabel = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/* =========================== KPI Cards =========================== */
const KPICards = ({
  rawRows,
  rowsForDate,
  rowsForDailyAttainment,
  selectedDate,
  isLoading,
  eventStartDate,
  eventEndDate,
  setEventStartDate,
  setEventEndDate,
}) => {
  if (isLoading) {
    return (
      <div className="row mt-3">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="col-md-3 mb-3">
            <div className="card shadow rounded-3 border-0">
              <div className="card-body text-center ">
                <h6 className="fw-bold placeholder-glow">
                  <span className="placeholder col-6"></span>
                </h6>
                <p className="fs-5 fw-bold text-primary placeholder-glow">
                  <span className="placeholder col-8"></span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  const [showModal, setShowModal] = useState(false);

  // Daily Attainment
  const totalActualDaily = sumBy(rowsForDailyAttainment, "Actual");
  const totalPlanDaily = sumBy(rowsForDailyAttainment, "Plan");
  const dailyAttainment =
    totalPlanDaily > 0 ? (totalActualDaily / totalPlanDaily) * 100 : 0;

  // Event Attainment
  let eventAttainment = 0;
  if (selectedDate >= eventStartDate && selectedDate <= eventEndDate) {
    const eventRows = rawRows.filter(
      (r) => r.Date >= eventStartDate && r.Date <= eventEndDate
    );
    const totalActualEvent = sumBy(eventRows, "Actual");
    const totalPlanEvent = sumBy(eventRows, "Plan");
    eventAttainment =
      totalPlanEvent > 0 ? (totalActualEvent / totalPlanEvent) * 100 : 0;
  }

  const total120Attainment = sumBy(rowsForDate, ">120Attainment Hubs");
  const totalBelow120Attainment = sumBy(rowsForDate, "<120Attainment Hubs");

  const kpis = [
    { title: "Daily Attainment(DA)", value: `${dailyAttainment.toFixed(2)}%` },
    {
      title: "Event Attainment(EA)",
      value: `${eventAttainment.toFixed(2)}%`,
      isEvent: true,
    },
    { title: ">120 Attainment Hubs", value: fmt(total120Attainment) },
    { title: "<120 Attainment Hubs", value: fmt(totalBelow120Attainment) },
  ];

  return (
    <div className="row mt-3">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="col-md-3 mb-3" style={{minWidth: "fit-content"}}>
          <div className="card shadow rounded-3 border-0">
            <div className="card-body text-center">
              <h6 className="fw-bold">{kpi.title}</h6>
              <div className="d-flex flex-grow-1 flex-shrink-1 justify-content-center gap-1">
                <p className="fs-5 fw-bold text-primary">{kpi.value}</p>

                {/* Only show date pickers for Event Attainment */}
                {kpi.isEvent && (
                  <button
                    style={{
                      height: "30px",
                    }}
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowModal(true)}
                  >
                    Date Range
                  </button>
                )}
              </div>

              {/* Bootstrap Modal */}
              {showModal && (
                <div
                  className="modal fade show d-block"
                  tabIndex="-1"
                  role="dialog"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <div className="modal-dialog" role="document">
                    <div className="modal-content rounded-3 shadow">
                      <div className="modal-header">
                        <h5 className="modal-title">Select Event Dates</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body d-flex flex-column gap-2">
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={eventStartDate}
                          onChange={(e) => setEventStartDate(e.target.value)}
                        />
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={eventEndDate}
                          onChange={(e) => setEventEndDate(e.target.value)}
                        />
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setShowModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            console.log(
                              "Start:",
                              eventStartDate,
                              "End:",
                              eventEndDate
                            );
                            setShowModal(false);
                          }}
                        >
                          Save Dates
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* =========================== Header Component =========================== */
const Header = ({
  date,
  setDate,
  zones,
  gms,
  hours,
  selectedZone,
  setSelectedZone,
  selectedGm,
  setSelectedGm,
  selectedHour,
  setSelectedHour,
  isLoading,
  error,
}) => {
  const handleDateChange = (e) => {
    const newDate = e.target.value ? new Date(e.target.value) : new Date();
    setDate(newDate);
    // Resetting GM and Hour filters here is a good practice to prevent stale data
    setSelectedZone("All");
    setSelectedGm("All");
    setSelectedHour("All");
  };
  const formattedDate = date ? toYMD(date) : "";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top  shadow">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img
            src={logo}
            alt="eKart Logo"
            height="40"
            className="me-2"
          />
        </a>
        <div className="d-flex align-items-center">
          {/* Date Picker */}
          <div className="btn-group me-3 position-relative">
            <input
              type="date"
              className="form-control rounded-pill"
              value={formattedDate}
              onChange={handleDateChange}
            />
          </div>

          {/* Zone Dropdown */}
          <div className="btn-group me-3">
            <button
              type="button"
              className="btn btn-light dropdown-toggle rounded-pill"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Zone: {isLoading ? "Loading..." : selectedZone}
            </button>
            <ul className="dropdown-menu rounded shadow">
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => setSelectedZone("All")}
                >
                  All - ZONE
                </a>
              </li>
              {error ? (
                <li>
                  <a className="dropdown-item text-danger" href="#">
                    {error}
                  </a>
                </li>
              ) : zones.length > 0 ? (
                zones.map((zone, idx) => (
                  <li key={idx}>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setSelectedZone(zone)}
                    >
                      {zone}
                    </a>
                  </li>
                ))
              ) : (
                <li>
                  <a className="dropdown-item text-danger" href="#">
                    No data
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* GM Dropdown */}
          <div className="btn-group me-3">
            <button
              type="button"
              className="btn btn-light dropdown-toggle rounded-pill"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              GM: {isLoading ? "Loading..." : selectedGm}
            </button>
            <ul className="dropdown-menu rounded shadow">
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => setSelectedGm("All")}
                >
                  All - GM
                </a>
              </li>
              {gms.length > 0 ? (
                gms.map((gm, idx) => (
                  <li key={idx}>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setSelectedGm(gm)}
                    >
                      {gm}
                    </a>
                  </li>
                ))
              ) : (
                <li>
                  <a className="dropdown-item text-danger" href="#">
                    No data
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Hour Dropdown */}
          <div className="btn-group me-3">
            <button
              type="button"
              className="btn btn-light dropdown-toggle rounded-pill"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Hrs: {isLoading ? "Loading..." : selectedHour || "All"}
            </button>
            <ul className="dropdown-menu rounded shadow">
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => setSelectedHour("All")}
                >
                  All - Hrs
                </a>
              </li>
              {hours.length > 0 ? (
                hours.map((hr, idx) => (
                  <li key={idx}>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setSelectedHour(hr)}
                    >
                      {hr}
                    </a>
                  </li>
                ))
              ) : (
                <li>
                  <a className="dropdown-item text-danger" href="#">
                    No data
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

/* =========================== ApexChartComponent =========================== */
const ApexChartComponent = ({ chartData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const renderChart = () => {
      if (!chartRef.current || !window.ApexCharts) return;

      chartInstance.current?.destroy();

      const planData = chartData.plan.map(Number);
      const actualData = chartData.actual.map(Number);
      const attainmentData = chartData.attainment.map(Number);

      const options = {
        series: [
          { name: "Plan", type: "column", data: planData },
          { name: "Actual", type: "column", data: actualData },
          { name: "Attainment %", type: "line", data: attainmentData },
        ],
        chart: {
          height: 350,
          type: "line",
          stacked: false,
          toolbar: { show: false },
        },
        dataLabels: { enabled: false },
        stroke: { width: [1, 1, 3] },
        title: {
          text: "Attainment Daily Analysis (Last 10 Days)",
          align: "left",
          offsetX: 110,
          style: { fontWeight: "bold" },
        },
        xaxis: { categories: chartData.headers },
        yaxis: [
          {
            seriesName: "Plan",
            axisTicks: { show: true },
            axisBorder: { show: true, color: "#008FFB" },
            labels: { style: { colors: "#008FFB" } },
            title: { text: "Plan", style: { color: "#008FFB" } },
          },
          {
            seriesName: "Actual",
            opposite: true,
            axisTicks: { show: true },
            axisBorder: { show: true, color: "#00E396" },
            labels: { style: { colors: "#00E396" } },
            title: { text: "Actual", style: { color: "#00E396" } },
          },
          {
            seriesName: "Attainment %",
            opposite: true,
            axisTicks: { show: true },
            axisBorder: { show: true, color: "#FEB019" },
            labels: { style: { colors: "#FEB019" } },
            title: { text: "Attainment %", style: { color: "#FEB019" } },
          },
        ],
        legend: { horizontalAlign: "left", offsetX: 40 },
      };

      chartInstance.current = new window.ApexCharts(chartRef.current, options);
      chartInstance.current.render();
    };

    if (!window.ApexCharts) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/apexcharts";
      script.onload = renderChart;
      document.body.appendChild(script);
    } else {
      renderChart();
    }

    return () => chartInstance.current?.destroy();
  }, [chartData]);

  return <div ref={chartRef} />;
};

/* =========================== Main Component =========================== */
export function Attainment() {
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [date, setDate] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedGm, setSelectedGm] = useState("All");
  const [selectedHour, setSelectedHour] = useState("All");

  const [eventStartDate, setEventStartDate] = useState("2025-09-22");
  const [eventEndDate, setEventEndDate] = useState("2025-10-15");

  const [zones, setZones] = useState([]);
  const [gms, setGms] = useState([]);
  const [hours, setHours] = useState([]);

  const fetchSheet = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const url = apiUrl+"/api/sheets-data";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const js = await res.json();
      const values = js.values || [];
      if (values.length < 2) throw new Error("No data");

      const headers = values[0];
      const rows = values.slice(1);

      const objRows = rows
        .map((r) => {
          const obj = {};
          headers.forEach((h, i) => {
            obj[String(h || "").trim()] = r[i] ?? "";
          });
          const norm = {};
          const get = (name) => {
            const k = Object.keys(obj).find(
              (h) => h.toLowerCase() === name.toLowerCase()
            );
            return k ? obj[k] : "";
          };
          norm.Date = parseSheetDate(get("Date"));
          norm.Zone = get("Zone") || get("Zonal") || get("Region") || "";
          norm.GM = get("GM") || get("General Manager") || "";
          norm.Hour = get("Hour") || get("Time") || "";
          norm.Region = get("Region") || "";
          norm.Plan = toNum(get("Plan"));
          norm.Actual = toNum(get("Actual"));
          norm.DailyAttainment = toNum(get("Daily Attainment"));
          norm.EventAttainment = toNum(get("Event Attainment"));
          norm[">120Attainment Hubs"] = toNum(get(">120 Attainment Hubs"));
          norm["<120Attainment Hubs"] = toNum(get("<120 Attainment Hubs"));
          return norm;
        })
        .filter((r) => r.Date);

      setRawRows(objRows);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError(
        "Failed to load data. Please check the backend server is running."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheet();
  }, []);

  const selectedYMD = useMemo(() => toYMD(date), [date]);

  // Main filtered data based on all selections (Date, Zone, GM, Hour)
  const rowsForDate = useMemo(() => {
    let filteredData = rawRows.filter((r) => r.Date === selectedYMD);

    if (selectedZone !== "All") {
      filteredData = filteredData.filter(
        (r) => String(r.Zone).toLowerCase() === String(selectedZone).toLowerCase()
      );
    }

    if (selectedGm !== "All") {
      filteredData = filteredData.filter(
        (r) => String(r.GM).toLowerCase() === String(selectedGm).toLowerCase()
      );
    }

    if (selectedHour !== "All") {
      filteredData = filteredData.filter(
        (r) => String(r.Hour) === String(selectedHour)
      );
    }

    return filteredData;
  }, [rawRows, selectedYMD, selectedZone, selectedGm, selectedHour]);

  // A separate, unfiltered list of rows for the selected date to calculate the fixed Daily Attainment KPI
  const rowsForDailyAttainment = useMemo(() => {
    return rawRows.filter((r) => r.Date === selectedYMD);
  }, [rawRows, selectedYMD]);

  // Effect to update dropdown options based on current filters
  useEffect(() => {
    let filteredByDate = rawRows.filter((r) => r.Date === selectedYMD);

    // Filter zones for the dropdown
    const z = Array.from(
      new Set(filteredByDate.map((r) => r.Zone).filter(Boolean))
    ).sort();
    setZones(z);

    // Filter by the selected zone to populate GM and Hour dropdowns
    const filteredByZone =
      selectedZone === "All"
        ? filteredByDate
        : filteredByDate.filter((r) => String(r.Zone).toLowerCase() === String(selectedZone).toLowerCase());

    // Get unique GMs, filtering out empty strings and "0"
    const g = Array.from(
      new Set(filteredByZone.map((r) => r.GM).filter(Boolean))
    )
      .filter((gm) => gm !== "0")
      .sort();
    setGms(g);

    // Get unique Hours, filtering out empty strings and "0"
    const h = Array.from(
      new Set(filteredByZone.map((r) => r.Hour).filter(Boolean))
    )
      .filter((hour) => hour !== "0")
      .sort();
    setHours(h);

    // Reset selected GM and Hour if the current selection is no longer available
    if (selectedGm !== "All" && !g.includes(selectedGm)) {
      setSelectedGm("All");
    }
    if (selectedHour !== "All" && !h.includes(selectedHour)) {
      setSelectedHour("All");
    }
  }, [rawRows, selectedYMD, selectedZone, selectedGm, selectedHour]);

  const regions = ["EAST", "WEST", "NORTH", "SOUTH"];

  const regionData = regions.map((reg) => {
    const rows = rowsForDate.filter(
      (r) => (r.Region || "").toUpperCase() === reg.toUpperCase()
    );
    const plan = sumBy(rows, "Plan");
    const actual = sumBy(rows, "Actual");
    const attainmentPct = plan > 0 ? (actual / plan) * 100 : 0;
    return { region: reg, plan, actual, attainmentPct };
  });

  const dailyBuckets = useMemo(() => {
    const days = lastNDates(selectedYMD, 10);
    return days.map((ymd) => {
      let base = rawRows.filter((r) => r.Date === ymd);
      
      if (selectedZone !== "All") {
        base = base.filter((r) => String(r.Zone).toLowerCase() === String(selectedZone).toLowerCase());
      }
      
      if (selectedGm !== "All") {
        base = base.filter((r) => String(r.GM).toLowerCase() === String(selectedGm).toLowerCase());
      }
      
      if (selectedHour !== "All") {
        base = base.filter((r) => String(r.Hour) === String(selectedHour));
      }

      const plan = sumBy(base, "Plan");
      const actual = sumBy(base, "Actual");
      const attainment = plan > 0 ? (actual / plan) * 100 : 0;
      return { ymd, plan, actual, attainment };
    });
  }, [rawRows, selectedYMD, selectedZone, selectedGm, selectedHour]);

  const tableData = useMemo(() => {
    const headers = dailyBuckets.map((d) => formatHeaderLabel(d.ymd));
    const plan = dailyBuckets.map((d) => Math.round(d.plan));
    const actual = dailyBuckets.map((d) => Math.round(d.actual));
    const attainment = dailyBuckets.map((d) => Number(d.attainment.toFixed(2)));
    return { headers, plan, actual, attainment };
  }, [dailyBuckets]);

  return (
    <div>
      <Bootstrap />
      <Header
        date={date}
        setDate={setDate}
        zones={zones}
        gms={gms}
        hours={hours}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        selectedGm={selectedGm}
        setSelectedGm={setSelectedGm}
        selectedHour={selectedHour}
        setSelectedHour={setSelectedHour}
        isLoading={loading}
        error={error}
      />

      {error ? (
        <div className="alert alert-danger mt-3">{error}</div>
      ) : (
        <div className="cswrap">
          {/* Region Cards */}
          <div className="row mt-3">
            {regionData.map((reg, idx) => (
              <div key={idx} className="col-md-3 mb-3">
                <div className="card shadow rounded-3 border-0">
                  <div className="card-body text-center">
                    <h5 className="card-title fw-bold">{reg.region}</h5>
                    <p className="mb-1 text-muted">Plan: {fmt(reg.plan)}</p>
                    <p className="mb-1 text-success">
                      Actual: {fmt(reg.actual)}
                    </p>
                    <p
                      className={`mb-0 fw-bold ${
                        reg.attainmentPct >= 100
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      Attainment: {reg.attainmentPct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* KPI Cards */}
          

          {/* Chart */}
          <div className="mt-4" style={{display:"flex"}}>
            <div style={{width:"90vw"}}>
            {loading ? (
              <div className="alert alert-info">Loading chart data...</div>
            ) : (
              <ApexChartComponent chartData={tableData} />
            )}
            </div>

            <KPICards
            rawRows={rawRows}
            rowsForDate={rowsForDate}
            rowsForDailyAttainment={rowsForDailyAttainment}
            selectedDate={selectedYMD}
            isLoading={loading}
            eventStartDate={eventStartDate}
            eventEndDate={eventEndDate}
            setEventStartDate={setEventStartDate}
            setEventEndDate={setEventEndDate}
          />
          </div>

          

          {/* Table */}
          <div className="mt-4 table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Metric</th>
                  {tableData.headers.map((h, idx) => (
                    <th key={idx}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Plan</td>
                  {tableData.plan.map((v, idx) => (
                    <td key={idx}>{fmt(v)}</td>
                  ))}
                </tr>
                <tr>
                  <td>Actual</td>
                  {tableData.actual.map((v, idx) => (
                    <td key={idx}>{fmt(v)}</td>
                  ))}
                </tr>
                <tr>
                  <td>Attainment %</td>
                  {tableData.attainment.map((v, idx) => (
                    <td key={idx}>{v.toFixed(2)}%</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attainment;