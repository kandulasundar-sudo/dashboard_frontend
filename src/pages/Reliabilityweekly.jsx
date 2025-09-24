import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import logo from '../assets/img/eklogo.png';
// Register Chart.js components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Helper function to format numbers with suffixes for charts
const formatNumber = (value) => {
  if (value >= 10000000)
    return (value / 10000000).toFixed(1).replace(/\.0$/, "") + "Cr";
  if (value >= 100000)
    return (value / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return value.toString();
};

// Helper function to format numbers with commas for stat cards
const formatWithCommas = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// StatCard component
const StatCard = ({ title, value, icon, gradient, borderColor }) => {
  const cardStyle = {
    backgroundImage: gradient,
    borderColor: borderColor,
    borderWidth: "1px",
    borderStyle: "solid",
    height: "120px",
    position: "relative",
  };

  const circleStyle = {
    position: "absolute",
    borderRadius: "2rem",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  };

  return (
    <div
      className="card text-white shadow-lg p-3 rounded-5 d-flex flex-column justify-content-between overflow-hidden"
      style={cardStyle}
    >
      <div
        style={{
          ...circleStyle,
          width: "100px",
          height: "100px",
          top: "-40px",
          right: "-40px",
        }}
      ></div>
      <div
        style={{
          ...circleStyle,
          width: "80px",
          height: "80px",
          bottom: "-40px",
          left: "-40px",
        }}
      ></div>

      <div className="d-flex justify-content-between align-items-start">
        <h3 className="fs-5 fw-semibold opacity-75">{title}</h3>
        <span className="fs-5">{icon}</span>
      </div>
      <p
        className="mb-1 stat-card-value"
      >
        {formatWithCommas(value)}
      </p>
    </div>
  );
};

// BarChart component
const BarChart = ({ title, labels, data, barColor }) => {
  const chartRef = useRef(null);

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: barColor,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        display: false,
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#000",
        font: {
          weight: "bold",
          size: 9,
        },
        formatter: (value) => formatNumber(value),
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-5 shadow-lg h-150">
      <Bar options={options} data={chartData} ref={chartRef} />
    </div>
  );
};

// Main Dashboard with charts
const Reliabilityweekly = ({
  selectedZones,
  selectedGm,
  selectedHour,
  date,
  allData,
}) => {
  const [statsData, setStatsData] = useState([]);
  const [chartData, setChartData] = useState({
    ofd: [],
    delivered: [],
    availability: [],
    ofcOfp: [],
    landing: [],
  });
  const [chartHourLabels, setChartHourLabels] = useState([]);

  const getDefaultStats = () => {
    return [
      {
        title: "Landing",
        value: 0,
        icon: "⇡",
        gradient: "linear-gradient(to bottom right, #f87289, #ee5a7a)",
        borderColor: "#41b590",
      },
      {
        title: "OFD+OFP",
        value: 0,
        icon: "⇡",
        gradient: "linear-gradient(to bottom right, #ffa466, #ff7e5a)",
        borderColor: "#41b590",
      },
      {
        title: "Availability",
        value: 0,
        icon: "⇣",
        gradient: "linear-gradient(to bottom right, #4c4d9a, #5658b1)",
        borderColor: "#41b590",
      },
      {
        title: "OFD",
        value: 0,
        icon: "⇣",
        gradient: "linear-gradient(to bottom right, #4c4d9a, #5658b1)",
        borderColor: "#41b590",
      },
      {
        title: "Delivered",
        value: 0,
        icon: "⇣",
        gradient: "linear-gradient(to bottom right, #4c4d9a, #5658b1)",
        borderColor: "#41b590",
      },
    ];
  };

  const calculateStats = (data, selectedHour) => {
    if (data.length === 0) {
      return getDefaultStats();
    }

    const selectedHourNum = parseInt(selectedHour);
    const filteredBySelectedHour = data.filter(
      (item) => item.hour === selectedHour
    );

    const totalLandingForSelectedHour = filteredBySelectedHour.reduce(
      (sum, item) => sum + (parseFloat(item.Landing) || 0),
      0
    );

    let landingValueToDisplay = totalLandingForSelectedHour;
    if (selectedHour !== "All" && totalLandingForSelectedHour === 0) {
      const previousHours = [
        ...new Set(data.map((item) => parseInt(item.hour))),
      ]
        .filter((h) => h < selectedHourNum)
        .sort((a, b) => b - a);

      let foundLanding = 0;
      for (const hour of previousHours) {
        const hourData = data.filter((item) => parseInt(item.hour) === hour);
        const totalLanding = hourData.reduce(
          (sum, item) => sum + (parseFloat(item.Landing) || 0),
          0
        );
        if (totalLanding > 0) {
          foundLanding = totalLanding;
          break;
        }
      }
      landingValueToDisplay = foundLanding;
    }

    const totalOfdOfp = filteredBySelectedHour.reduce(
      (sum, item) => sum + (parseFloat(item["OFD+OFP"]) || 0),
      0
    );
    const totalAvailability = filteredBySelectedHour.reduce(
      (sum, item) => sum + (parseFloat(item.Availability) || 0),
      0
    );
    const totalDelivered = filteredBySelectedHour.reduce(
      (sum, item) => sum + (parseFloat(item.Delivered) || 0),
      0
    );
    const totalOFD = filteredBySelectedHour.reduce(
      (sum, item) => sum + (parseFloat(item.OFD) || 0),
      0
    );

    return [
      {
        title: "OFD",
        value: totalOFD.toFixed(0),
        icon: "⇣",
        gradient: "linear-gradient(to bottom right, #4c4d9a, #5658b1)",
        borderColor: "#41b590",
      },
      {
        title: "Delivered",
        value: totalDelivered.toFixed(0),
        icon: "⇣",
        gradient: "linear-gradient(to bottom right, #4c4d9a, #5658b1)",
        borderColor: "#41b590",
      },
      {
        title: "Availability",
        value: totalAvailability.toFixed(0),
        icon: "⇣",
        gradient: "linear-gradient(to bottom right, #4c4d9a, #5658b1)",
        borderColor: "#41b590",
      },
      {
        title: "Landing",
        value: landingValueToDisplay.toFixed(0),
        icon: "⇡",
        gradient: "linear-gradient(to bottom right, #f87289, #ee5a7a)",
        borderColor: "#41b590",
      },
      {
        title: "OFD+OFP",
        value: totalOfdOfp.toFixed(0),
        icon: "⇡",
        gradient: "linear-gradient(to bottom right, #ffa466, #ff7e5a)",
        borderColor: "#41b590",
      },
    ];
  };

  const generateChartData = (data) => {
    const hourlyDataMap = {};
    const uniqueHours = [
      ...new Set(data.map((item) => parseInt(item.hour))),
    ].sort((a, b) => a - b);

    uniqueHours.forEach((hour) => {
      hourlyDataMap[hour] = {
        ofd: 0,
        delivered: 0,
        availability: 0,
        ofcOfp: 0,
        landing: 0,
      };
    });

    data.forEach((item) => {
      const hour = parseInt(item.hour);
      if (hourlyDataMap[hour]) {
        hourlyDataMap[hour].ofd += parseFloat(item.OFD) || 0;
        hourlyDataMap[hour].delivered += parseFloat(item.Delivered) || 0;
        hourlyDataMap[hour].availability += parseFloat(item.Availability) || 0;
        hourlyDataMap[hour].ofcOfp += parseFloat(item["OFD+OFP"]) || 0;
        hourlyDataMap[hour].landing += parseFloat(item.Landing) || 0;
      }
    });

    const ofdData = uniqueHours.map((hour) => hourlyDataMap[hour].ofd);
    const deliveredData = uniqueHours.map(
      (hour) => hourlyDataMap[hour].delivered
    );
    const availabilityData = uniqueHours.map(
      (hour) => hourlyDataMap[hour].availability
    );
    const ofcOfpData = uniqueHours.map((hour) => hourlyDataMap[hour].ofcOfp);
    const landingData = uniqueHours.map((hour) => hourlyDataMap[hour].landing);
    const hourLabels = uniqueHours.map(
      (hour) => `${hour} ${hour >= 12 ? "pm" : "am"}`
    );

    setChartHourLabels(hourLabels);

    return {
      ofd: ofdData,
      delivered: deliveredData,
      availability: availabilityData,
      ofcOfp: ofcOfpData,
      landing: landingData,
    };
  };

  useEffect(() => {
    if (!allData || allData.length === 0 || !date) {
      setStatsData(getDefaultStats());
      setChartData({
        ofd: [],
        delivered: [],
        availability: [],
        ofcOfp: [],
        landing: [],
      });
      setChartHourLabels([]);
      return;
    }

    const filteredData = allData.filter((item) => {
      const isDateMatch =
        new Date(item.date).toDateString() === date.toDateString();

      const itemZoneNormalized = item.zone
        ? item.zone.charAt(0).toUpperCase() + item.zone.slice(1).toLowerCase()
        : null;
      const isZoneMatch =
        selectedZones.includes("All") || selectedZones.includes(itemZoneNormalized);

      const isGmMatch =
        selectedGm === "All" ||
        (item.gm && item.gm.toLowerCase() === selectedGm.toLowerCase());
      return isDateMatch && isZoneMatch && isGmMatch;
    });

    setChartData(generateChartData(filteredData));
    setStatsData(calculateStats(filteredData, selectedHour));
  }, [allData, selectedZones, selectedGm, selectedHour, date]);

  return (
    <div
      className="p-4 cswrap"
      style={{
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Stat Cards */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4 mb-4">
        {statsData.map((stat, index) => (
          <div key={index} className="col">
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-6">
          <BarChart
            title="OFD"
            labels={chartHourLabels}
            data={chartData.ofd}
            barColor="#ff8c00"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <BarChart
            title="Delivered"
            labels={chartHourLabels}
            data={chartData.delivered}
            barColor="#41b590"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <BarChart
            title="Availability"
            labels={chartHourLabels}
            data={chartData.availability}
            barColor="#4c4d9a"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <BarChart
            title="OFD+OFP"
            labels={chartHourLabels}
            data={chartData.ofcOfp}
            barColor="#ee5a7a"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <BarChart
            title="Landing"
            labels={chartHourLabels}
            data={chartData.landing}
            barColor="#41b590"
          />
        </div>
        
      </div>
    </div>
  );
};

// Main App component
export default function App() {
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [allData, setAllData] = useState([]);
  const [zones, setZones] = useState([]);
  const [gms, setGms] = useState([]);
  const [hours, setHours] = useState([]);
  const [selectedZones, setSelectedZones] = useState(["All"]);
  const [selectedGm, setSelectedGm] = useState("All");
  const [selectedHour, setSelectedHour] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the allowed zones
  const ALLOWED_ZONES = ["East", "West", "North", "South"];

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const API_URL = apiUrl + "/api/reliability-data";

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to load data from server.");
      }

      const data = await response.json();
      const rowsData = data.values;

      if (!rowsData || rowsData.length < 2) {
        setAllData([]);
        setZones([]);
        setGms([]);
        setHours([]);
        setError("No data");
        setSelectedZones(["All"]);
        setSelectedGm("All");
        setSelectedHour("All");
        setIsLoading(false);
        return;
      }

      const headers = rowsData[0].map((h) => String(h).trim().toLowerCase());
      const rows = rowsData.slice(1);

      const parsedData = rows.map((row) => {
        const rowData = {};
        rowData.zone = row[headers.indexOf("zone")] || "";
        rowData.gm = row[headers.indexOf("gm")] || "";
        rowData.hour = row[headers.indexOf("hour")] || "";
        rowData.date = row[headers.indexOf("date")] || "";
        rowData.Landing = row[headers.indexOf("landing")] || 0;
        rowData["OFD+OFP"] = row[headers.indexOf("ofd+ofp")] || 0;
        rowData.Availability = row[headers.indexOf("availability")] || 0;
        rowData.Delivered = row[headers.indexOf("delivered")] || 0;
        rowData.OFD = row[headers.indexOf("ofd")] || 0;
        return rowData;
      });

      setAllData(parsedData);
      setIsLoading(false);
    } catch (e) {
      setError(
        "Failed to load Google Sheet data. Ensure the backend server is running."
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (date) {
      const selectedDateData = allData.filter(
        (item) => new Date(item.date).toDateString() === date.toDateString()
      );
      if (selectedDateData.length === 0) {
        setZones([]);
        setGms([]);
        setHours([]);
        setError("No data");
        setSelectedZones(["All"]);
        setSelectedGm("All");
        setSelectedHour("All");
      } else {
        const uniqueZones = [
          ...new Set(selectedDateData.map((item) => item.zone)),
        ].filter((zone) =>
          ALLOWED_ZONES.map((z) => z.toLowerCase()).includes(
            String(zone).trim().toLowerCase()
          )
        );
        const sortedZones = uniqueZones
          .map((z) => z.charAt(0).toUpperCase() + z.slice(1).toLowerCase())
          .sort();

        const availableHours = [
          ...new Set(selectedDateData.map((item) => item.hour)),
        ];
        const hoursSorted = availableHours.sort(
          (a, b) => parseInt(a) - parseInt(b)
        );

        const now = new Date();
        const currentHour = now.getHours();

        const latestAvailableHour = hoursSorted
          .filter((h) => parseInt(h) <= currentHour)
          .pop();
        let defaultHour = "All";
        if (latestAvailableHour) {
          defaultHour = latestAvailableHour;
        } else if (hoursSorted.length > 0) {
          defaultHour = hoursSorted[0];
        }

        setZones(sortedZones);
        setHours(hoursSorted);
        setSelectedHour(defaultHour);
        setError(null);
      }
    } else {
      setZones([]);
      setGms([]);
      setHours([]);
      setError("No data");
      setSelectedZones(["All"]);
      setSelectedGm("All");
      setSelectedHour("All");
    }
  }, [date, allData]);

  // This is the modified useEffect hook
  useEffect(() => {
    if (date && allData.length > 0) {
      const gmsForZones = allData.filter(
        (item) =>
          new Date(item.date).toDateString() === date.toDateString() &&
          (selectedZones.includes("All") ||
            selectedZones.includes(
              item.zone.charAt(0).toUpperCase() + item.zone.slice(1).toLowerCase()
            ))
      );

      const uniqueGms = [
        ...new Set(gmsForZones.map((item) => item.gm).filter(Boolean)),
      ].sort();

      setGms(uniqueGms);

      if (selectedGm !== "All" && !uniqueGms.includes(selectedGm)) {
        setSelectedGm("All");
      } else if (uniqueGms.length === 0) {
        setSelectedGm("All");
      }
    } else {
      setGms([]);
      setSelectedGm("All");
    }
  }, [selectedZones, allData, date, selectedGm]);

  // Handle Zone checkbox change
  const handleZoneChange = (zone) => {
    setSelectedZones((prevZones) => {
      if (zone === "All") {
        return ["All"];
      }

      const isAllSelected = prevZones.includes("All");
      const isZoneSelected = prevZones.includes(zone);

      // If "All" is selected and we click another zone, deselect "All" and select the new zone
      if (isAllSelected && !isZoneSelected) {
        return [zone];
      }

      // If zone is already selected, unselect it
      if (isZoneSelected) {
        const newZones = prevZones.filter((z) => z !== zone);
        // If no zones are left, default back to "All"
        return newZones.length === 0 ? ["All"] : newZones;
      }

      // If zone is not selected, add it to the list
      return [...prevZones, zone];
    });
  };

  return (
    <>
      <style>
        {`
          .stat-card-value {
            font-weight: 500;
            font-size: clamp(1rem, 5vw, 2rem);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
            margin-bottom: 0 !important;
          }
        `}
      </style>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
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
            {/* Date picker */}
            <div className="btn-group me-3 position-relative">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {date ? date.toDateString() : "Select Date"}
              </button>
              {showCalendar && (
                <div
                  className="dropdown-menu p-2 show rounded"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    zIndex: 1000,
                    backgroundColor: "#fff",
                  }}
                >
                  <input
                    type="date"
                    className="form-control"
                    value={date ? date.toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      setDate(new Date(e.target.value));
                      setShowCalendar(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Zone dropdown - Multi-select with checkboxes */}
            <div className="btn-group me-3">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
              >
                Zone:{" "}
                {selectedZones.includes("All")
                  ? "All"
                  : selectedZones.join(", ") || "None"}
              </button>
              <ul
                className="dropdown-menu rounded p-2"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <li onClick={(e) => e.stopPropagation()}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="zone-all"
                      checked={selectedZones.includes("All")}
                      onChange={() => handleZoneChange("All")}
                    />
                    <label className="form-check-label" htmlFor="zone-all">
                      All
                    </label>
                  </div>
                </li>
                {zones.map((zone, idx) => (
                  <li key={idx} onClick={(e) => e.stopPropagation()}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`zone-${zone}`}
                        checked={selectedZones.includes(zone)}
                        onChange={() => handleZoneChange(zone)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`zone-${zone}`}
                      >
                        {zone}
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* GM dropdown */}
            <div className="btn-group me-3">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                GM: {isLoading ? "Loading..." : selectedGm}
              </button>
              <ul className="dropdown-menu rounded">
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={() => setSelectedGm("All")}
                  >
                    All
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

            {/* Hour dropdown */}
            <div className="btn-group me-3">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Hrs: {isLoading ? "Loading..." : selectedHour || "None"}
              </button>
              <ul className="dropdown-menu rounded">
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

      <Reliabilityweekly
        selectedZones={selectedZones}
        selectedGm={selectedGm}
        selectedHour={selectedHour}
        date={date}
        allData={allData}
      />
    </>
  );
}