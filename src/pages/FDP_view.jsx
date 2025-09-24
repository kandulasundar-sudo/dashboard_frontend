// This is the updated App.js component
import React, { useState, useEffect, useRef } from "react";
import logo from '../assets/img/eklogo.png';
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
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { format, isWithinInterval, addDays } from "date-fns";


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
  if (value >= 10000000) return (value / 10000000).toFixed(1).replace(/\.0$/, "") + "Cr";
  if (value >= 100000) return (value / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return value.toString();
};

// Helper function to format numbers with commas for stat cards
const formatWithCommas = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// StatCard component (no changes needed)
const StatCard = ({ title, mainValue, percentage, icon, gradient }) => {
  const cardStyle = {
    backgroundImage: gradient,
    height: "120px",
    position: "relative",
    color: "white",
    borderRadius: "1.5rem",
  };

  const circle1Style = {
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: "120px",
    height: "120px",
    top: "-30px",
    right: "-30px",
  };

  const circle2Style = {
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: "100px",
    height: "100px",
    bottom: "10px",
    right: "10px",
  };

  return (
    <div
      className="shadow-lg p-3 d-flex flex-column justify-content-between overflow-hidden"
      style={cardStyle}
    >
      <div style={circle1Style}></div>
      <div style={circle2Style}></div>

      <div className="d-flex justify-content-between" style={{ zIndex: 1,alignItems: "center" }}>
        <h3 className="fs-6 fw-normal opacity-90 mb-0" style={{ maxWidth: "50%",  wordWrap: "break-word"}}>{title}</h3>
        <p className="mb-0 fw-bold" style={{ fontSize: "clamp(0.5rem, 1.5rem, 2.5rem)" }}>
          {percentage}
        </p>
      </div>

      <div className="d-flex align-items-end" style={{ zIndex: 1 }}>
        <div className="d-flex align-items-center">
          <p className="mb-0 fw-bold" style={{ fontSize: "clamp(0.5rem, 1.5vw, 3.5rem)", lineHeight: 1 }}>
            {formatWithCommas(mainValue)}
          </p>
          {icon && <span className="ms-1 fs-4 fw-bold">{icon}</span>}
        </div>
      </div>
    </div>
  );
};

// BarChart component (no changes needed)
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
    <div className="bg-white p-4 rounded-5 shadow-lg" style={{height:"60vh"}}>
      <Bar options={options} data={chartData} ref={chartRef} />
    </div>
  );
};

// Main Dashboard with charts (no changes needed)
const Reliabilityweekly = ({
  selectedZones,
  selectedGm,
  selectedHour,
  date,
  allData,
  dayStartData,
  promisesData
}) => {
  const [statsData, setStatsData] = useState([]);
  const [chartData, setChartData] = useState({
    daystart: [],
    unadncd: [],
    labels: [],
  });
  const [daystartDateRange, setDaystartDateRange] = useState([
    {
      startDate: addDays(new Date(), -6),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [showDaystartCalendar, setShowDaystartCalendar] = useState(false);
  const [unadncdDateRange, setUnadncdDateRange] = useState([
    {
      startDate: addDays(new Date(), -6),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [showUnadncdCalendar, setShowUnadncdCalendar] = useState(false);
  const [unadncdSelectedHour, setUnadncdSelectedHour] = useState("All");
  const [unadncdHours, setUnadncdHours] = useState([]);

  const getDefaultStats = () => {
    return [
      {
        title: "DayStart",
        mainValue: 0,
        percentage: "0%",
        icon: null,
        gradient: "linear-gradient(to right, #f87289, #ee5a7a)",
      },
      {
        title: "UNA",
        mainValue: 0,
        percentage: "0%",
        icon: null,
        gradient: "linear-gradient(to right, #ffa466, #ff7e5a)",
      },
      {
        title: "NCD",
        mainValue: 0,
        percentage: "0%",
        icon: null,
        gradient: "linear-gradient(to right, #4c4d9a, #5658b1)",
      },
      {
        title: "UNA+Attempted_NCD",
        mainValue: 0,
        percentage: "0%",
        icon: null,
        gradient: "linear-gradient(to right, #4c4d9a, #5658b1)",
      },
      {
        title: "CD",
        mainValue: 0,
        percentage: "0%",
        icon: null,
        gradient: "linear-gradient(to right, #4c4d9a, #5658b1)",
      },
    ];
  };

  const calculateStats = (data, selectedHour,filteredDayStartData,filteredPromisesData) => {
    if (data.length === 0) {
      return getDefaultStats();
    }

    const filteredBySelectedHour = data.filter(
      (item) => selectedHour === "All" || String(item.hours) === String(selectedHour)
    );

    const totalDaystart = filteredDayStartData.reduce(
      (sum, item) => sum + (parseFloat(item.dayStartCpd) || 0),
      0
    );

    const promises = filteredPromisesData.reduce(
      (sum, item) => sum + (parseFloat(item.promises) || 0),
      0
    );

    // const totalDaystart = promises;
    const totalUNA = filteredBySelectedHour.reduce(
      (sum, item) => sum + (parseFloat(item.una) || 0),
      0
    );

    const totalNCD = filteredBySelectedHour.reduce(
      (sum, item) => sum + (parseFloat(item.ncd) || 0),
      0
    );

    const totalUNAAttemptedNCD = filteredBySelectedHour.reduce(
      (sum, item) => sum + (parseFloat(item["una+attempted_ncd"]) || 0),
      0
    );

    const totalCD = filteredBySelectedHour.reduce(
      (sum, item) => sum + (parseFloat(item.cd) || 0),
      0
    );

    const daystartPercentage = promises > 0 ? ((totalDaystart / promises) * 100).toFixed(1) + "%" : "0%";
    const unaPercentage = promises > 0 ? ((totalUNA / promises) * 100).toFixed(1) + "%" : "0%";
    const ncdPercentage = promises > 0 ? ((totalNCD / promises) * 100).toFixed(1) + "%" : "0%";
    const unaNcdPercentage = promises > 0 ? ((totalUNAAttemptedNCD / promises) * 100).toFixed(1) + "%" : "0%";
    const cdPercentage = promises > 0 ? ((totalCD / promises) * 100).toFixed(1) + "%" : "0%";

    return [
      {
        title: "DayStart",
        mainValue: totalDaystart.toFixed(0),
        percentage: daystartPercentage,
        icon: null,
        gradient: "linear-gradient(to right, #f87289, #ee5a7a)",
      },
      {
        title: "UNA",
        mainValue: totalUNA.toFixed(0),
        percentage: unaPercentage,
        icon: null,
        gradient: "linear-gradient(to right, #ffa466, #ff7e5a)",
      },
      {
        title: "NCD",
        mainValue: totalNCD.toFixed(0),
        percentage: ncdPercentage,
        icon: null,
        gradient: "linear-gradient(to right, #4c4d9a, #5658b1)",
      },
      {
        title: "UNA+Attempted_NCD",
        mainValue: totalUNAAttemptedNCD.toFixed(0),
        percentage: unaNcdPercentage,
        icon: null,
        gradient: "linear-gradient(to right, #4c4d9a, #5658b1)",
      },
      {
        title: "CD",
        mainValue: totalCD.toFixed(0),
        percentage: cdPercentage,
        icon: null,
        gradient: "linear-gradient(to right, #4c4d9a, #5658b1)",
      },
    ];
  };

  const generateDaystartChartData = (data, startDate, endDate) => {
    if (!startDate || !endDate) {
      return { daystart: [], labels: [] };
    }
    const dailyDataMap = {};
    const labels = [];
    const daystartData = [];
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      dailyDataMap[dateString] = { daystart: 0 };
      labels.push(format(currentDate, 'MMM d'));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    filteredData.forEach(item => {
      const itemDateString = format(new Date(item.date), 'yyyy-MM-dd');
      if (dailyDataMap[itemDateString]) {
        dailyDataMap[itemDateString].daystart += parseFloat(item.daystart) || 0;
      }
    });

    Object.values(dailyDataMap).forEach(dayData => {
      daystartData.push(dayData.daystart);
    });

    return {
      daystart: daystartData,
      labels: labels,
    };
  };

  const generateUnadncdChartData = (data, startDate, endDate, selectedHour) => {
    if (!startDate || !endDate) {
      return { unadncd: [], labels: [] };
    }
    const filteredByDate = data.filter(item => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });
    const filteredData = selectedHour === "All"
      ? filteredByDate
      : filteredByDate.filter(item => String(item.hours) === String(selectedHour));
    const availableHours = [...new Set(filteredByDate.map((item) => item.hours))];
    const hoursSorted = availableHours.sort((a, b) => parseInt(a) - parseInt(b));
    setUnadncdHours(hoursSorted);
    const dailyDataMap = {};
    const labels = [];
    const unadncdData = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      dailyDataMap[dateString] = { unadncd: 0 };
      labels.push(format(currentDate, 'MMM d'));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    filteredData.forEach(item => {
      const itemDateString = format(new Date(item.date), 'yyyy-MM-dd');
      if (dailyDataMap[itemDateString]) {
        dailyDataMap[itemDateString].unadncd += parseFloat(item["una+attempted_ncd"]) || 0;
      }
    });

    Object.values(dailyDataMap).forEach(dayData => {
      unadncdData.push(dayData.unadncd);
    });

    return {
      unadncd: unadncdData,
      labels: labels,
    };
  };

  useEffect(() => {
    if (!allData || allData.length === 0 || !date) {
      setStatsData(getDefaultStats());
      return;
    }

    const filteredPromisesData = promisesData.filter((item)=>{
      const isDateMatch = new Date(item.date).toDateString() === date.toDateString();
      const isZoneMatch = selectedZones.includes("All") || selectedZones.includes(item.zone);
      const isGmMatch =
        selectedGm === "All" ||
        (item.gm && item.gm.toLowerCase() === selectedGm.toLowerCase());

      return isDateMatch && isZoneMatch && isGmMatch;
    })

    const filteredDayStartData = dayStartData.filter((item)=>{
      const isDateMatch = new Date(item.date).toDateString() === date.toDateString();
      const isZoneMatch = selectedZones.includes("All") || selectedZones.includes(item.zone);
      const isGmMatch =
        selectedGm === "All" ||
        (item.gm && item.gm.toLowerCase() === selectedGm.toLowerCase());

      return isDateMatch && isZoneMatch && isGmMatch;
    })

    const filteredData = allData.filter((item) => {
      const isDateMatch = new Date(item.date).toDateString() === date.toDateString();
      const isZoneMatch = selectedZones.includes("All") || selectedZones.includes(item.zone);
      const isGmMatch =
        selectedGm === "All" ||
        (item.gm && item.gm.toLowerCase() === selectedGm.toLowerCase());
      return isDateMatch && isZoneMatch && isGmMatch;
    });

    setStatsData(calculateStats(filteredData, selectedHour,filteredDayStartData,filteredPromisesData));

  }, [allData, selectedZones, selectedGm, selectedHour, date]);

  useEffect(() => {
    if (allData.length > 0) {
      const newChartData = generateDaystartChartData(allData, daystartDateRange[0].startDate, daystartDateRange[0].endDate);
      setChartData(prev => ({
        ...prev,
        daystart: newChartData.daystart,
        labels: newChartData.labels,
      }));
    }
  }, [allData, daystartDateRange]);

  useEffect(() => {
    if (allData.length > 0) {
      const filteredByDate = allData.filter(item => {
        const itemDate = new Date(item.date);
        return isWithinInterval(itemDate, { start: unadncdDateRange[0].startDate, end: unadncdDateRange[0].endDate });
      });
      const availableHours = [...new Set(filteredByDate.map((item) => item.hours))];
      const hoursSorted = availableHours.sort((a, b) => parseInt(a) - parseInt(b));
      setUnadncdHours(hoursSorted);
      const newChartData = generateUnadncdChartData(allData, unadncdDateRange[0].startDate, unadncdDateRange[0].endDate, unadncdSelectedHour);
      setChartData(prev => ({
        ...prev,
        unadncd: newChartData.unadncd,
      }));
    }
  }, [allData, unadncdDateRange, unadncdSelectedHour]);

  return (
    <div className="p-4 cswrap" style={{ overflowY: "auto", overflowX: "hidden" }}>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4 mb-4">
        {statsData.map((stat, index) => (
          <div key={index} className="col">
            <StatCard {...stat} />
          </div>
        ))}
      </div>
      <div className="row g-4 mb-4" style={{display:"flex"}}>
        <div className="col-12" style={{width:"50%"}}>
          <div className="position-relative">
            <BarChart
              title="DayStart by Day"
              labels={chartData.labels}
              data={chartData.daystart}
              barColor="#f87289"
            />
            <div className="position-absolute top-0 end-0 mt-3 me-3">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowDaystartCalendar(!showDaystartCalendar)}
              >
                {daystartDateRange[0].startDate
                  ? `${format(daystartDateRange[0].startDate, "MMM d")} - ${
                      daystartDateRange[0].endDate ? format(daystartDateRange[0].endDate, "MMM d") : ""
                    }`
                  : "Select Range"}
              </button>
              {showDaystartCalendar && (
                <div
                  className="dropdown-menu p-2 show rounded"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    zIndex: 1000,
                    backgroundColor: "#fff",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DateRangePicker
                    ranges={daystartDateRange}
                    onChange={(item) => setDaystartDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    direction="horizontal"
                    editableDateInputs={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-12" style={{width:"50%"}}>
          <div className="position-relative">
            <BarChart
              title="UNA+Attempted_NCD by Day"
              labels={chartData.labels}
              data={chartData.unadncd}
              barColor="#4c4d9a"
            />
            <div className="position-absolute top-0 end-0 mt-3 me-3 d-flex align-items-center">
              <div className="btn-group me-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {unadncdSelectedHour}
                </button>
                <ul className="dropdown-menu rounded">
                  <li><a className="dropdown-item" href="#" onClick={() => setUnadncdSelectedHour("All")}>All</a></li>
                  {unadncdHours.length > 0 ? (
                    unadncdHours.map((hr, idx) => (
                      <li key={idx}>
                        <a className="dropdown-item" href="#" onClick={() => setUnadncdSelectedHour(hr)}>{hr}</a>
                      </li>
                    ))
                  ) : (
                    <li><a className="dropdown-item text-danger" href="#">No data</a></li>
                  )}
                </ul>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowUnadncdCalendar(!showUnadncdCalendar)}
              >
                {unadncdDateRange[0].startDate
                  ? `${format(unadncdDateRange[0].startDate, "MMM d")} - ${
                      unadncdDateRange[0].endDate ? format(unadncdDateRange[0].endDate, "MMM d") : ""
                    }`
                  : "Select Range"}
              </button>
              {showUnadncdCalendar && (
                <div
                  className="dropdown-menu p-2 show rounded"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    zIndex: 1000,
                    backgroundColor: "#fff",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DateRangePicker
                    ranges={unadncdDateRange}
                    onChange={(item) => setUnadncdDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    direction="horizontal"
                    editableDateInputs={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App component with fixes
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
  const [dayStartData,setDayStartData] = useState([]);
  const [promisesData,setPromisesData] = useState([]);
  
  const ALLOWED_ZONES = ['East', 'West', 'North', 'South'];

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const API_URL = apiUrl + "/api/FDP-data";

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to load data from server.");
      }
      const data = await response.json();

      const dayStart = data['Day_Start']?.values;

      const rowsData = data['FDP_Pendency']?.values;

      const promisesData = data['Promises']?.values;

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
        setDayStartData([]);
        return;
      }
      
      const headers = rowsData[0].map(h => String(h).trim().toLowerCase().replace(/ /g, "_"));
      
      const rows = rowsData.slice(1);
      
      const parsedData = rows.map((row) => {
        const rowData = {};
        rowData.zone = row[headers.indexOf("zone")] || "";
        rowData.gm = row[headers.indexOf("gm")] || "";
        rowData.daystart = parseFloat(row[headers.indexOf("daystart")] || 0);
        rowData.una = parseFloat(row[headers.indexOf("una")] || 0);
        rowData.ncd = parseFloat(row[headers.indexOf("ncd")] || 0);
        rowData["una+attempted_ncd"] = parseFloat(row[headers.indexOf("una+attempted_ncd")] || 0);
        rowData.cd = parseFloat(row[headers.indexOf("cd")] || 0);
        rowData.date = row[headers.indexOf("date")] || "";
        rowData.hours = row[headers.indexOf("hour")] || ""; // Correctly map 'hour' column
        return rowData;
      });


      setAllData(parsedData);

      const headersDayStart = dayStart[0].map(h => String(h).trim().toLowerCase().replace(/ /g, "_"));

      const rowsHeadersDayStart = dayStart.slice(1);

      const parsedDayStartData = rowsHeadersDayStart.map((row)=>{
        const rowData = {};

        rowData.dayStartCpd = parseFloat(row[headersDayStart.indexOf("day_start-cpd")] || 0);
        
        rowData.date = row[headersDayStart.indexOf("date")] || "";

        rowData.hour = row[headersDayStart.indexOf("hour")] || "";

        rowData.zone = row[headersDayStart.indexOf("zone")] || "";

        rowData.gm = row[headersDayStart.indexOf("gm")] || "";

        return rowData;
      });

      setDayStartData(parsedDayStartData);

      const headerPromises = promisesData[0].map(h => String(h).trim().toLowerCase().replace(/ /g, "_"));

      const rowsPromises = promisesData.slice(1);

      const parsedpromisesData = rowsPromises.map((row) => {
        const rowData = {};
        rowData.zone = row[headerPromises.indexOf("zone")] || "";
        rowData.gm = row[headerPromises.indexOf("gm_name")] || "";
        rowData.promises = parseFloat(row[headerPromises.indexOf("promises")] || 0);
        rowData.date = row[headerPromises.indexOf("date")] || "";
        return rowData;
      });

      setPromisesData(parsedpromisesData);

      setIsLoading(false);
    } catch (e) {

      console.log(e);
      setError("Failed to load Google Sheet data. Ensure the backend server is running.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Combined useEffect for GMs, Hours, and Zones based on date and selected zones
  useEffect(() => {
    if (!allData || allData.length === 0 || !date) {
      setZones([]);
      setGms(["All"]);
      setHours(["All"]);
      setSelectedGm("All");
      setSelectedHour("All");
      return;
    }

    const selectedDateData = allData.filter(
      item => new Date(item.date).toDateString() === date.toDateString()
    );

    const uniqueZones = [...new Set(selectedDateData.map(item => item.zone))]
      .filter(zone => ALLOWED_ZONES.map(z => z.toLowerCase()).includes(String(zone).trim().toLowerCase()))
      .sort();
    setZones(uniqueZones);

    const filteredDataByZone = selectedZones.includes("All")
      ? selectedDateData
      : selectedDateData.filter(item => selectedZones.includes(item.zone));

    const gmsForZone = [...new Set(filteredDataByZone.map(item => item.gm))].filter(Boolean).sort();
    setGms(["All", ...gmsForZone]);

    // The corrected filtering and parsing logic for hours
    const hoursForZone = [...new Set(filteredDataByZone.map(item => {
      const hourString = String(item.hours).trim();
      const parts = hourString.split(' ')[0];
      return parseInt(parts, 10);
    }))]
      .filter(hour => hour && !isNaN(hour))
      .sort((a, b) => a - b);

    setHours(["All", ...hoursForZone]);

    // Reset GM and Hour to "All" if the previously selected value is no longer available
    if (selectedGm !== "All" && !gmsForZone.includes(selectedGm)) {
      setSelectedGm("All");
    }
    if (selectedHour !== "All" && !hoursForZone.includes(selectedHour)) {
      setSelectedHour("All");
    }
  }, [date, allData, selectedZones]);

  const handleZoneChange = (zone) => {
    setSelectedZones(prevZones => {
      if (zone === "All") {
        return ["All"];
      }
      const isCurrentlyAll = prevZones.includes("All");
      const isZoneSelected = prevZones.includes(zone);
      
      if (isCurrentlyAll) {
        return [zone];
      }
      if (isZoneSelected) {
        const newZones = prevZones.filter(z => z !== zone);
        return newZones.length === 0 ? ["All"] : newZones;
      }
      return [...prevZones, zone];
    });
  };

  return (
    <>
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
                  style={{ position: "absolute", top: "100%", left: 0, zIndex: 1000, backgroundColor: "#fff" }}
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

            <div className="btn-group me-3">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Zone: {selectedZones.includes("All") ? "All" : selectedZones.join(", ")}
              </button>
              <ul className="dropdown-menu rounded p-2" style={{ maxHeight: '300px', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <li>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="zone-all" 
                      checked={selectedZones.includes("All")} 
                      onChange={() => handleZoneChange("All")}
                    />
                    <label className="form-check-label" htmlFor="zone-all">
                      All - ZONE
                    </label>
                  </div>
                </li>
                {zones.map((zone, idx) => (
                  <li key={idx}>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`zone-${zone}`} 
                        checked={selectedZones.includes(zone)}
                        onChange={() => handleZoneChange(zone)}
                      />
                      <label className="form-check-label" htmlFor={`zone-${zone}`}>
                        {zone}
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="btn-group me-3">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                GM: {isLoading ? "Loading GMs..." : selectedGm}
              </button>
              <ul className="dropdown-menu rounded">
                {gms.map((gm, idx) => (
                  <li key={idx}>
                    <a className="dropdown-item" href="#" onClick={() => setSelectedGm(gm)}>
                      {gm}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="btn-group me-3">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Hrs: {isLoading ? "Loading Hours..." : selectedHour}
              </button>
              <ul className="dropdown-menu rounded">
                {hours.map((hr, idx) => (
                  <li key={idx}>
                    <a className="dropdown-item" href="#" onClick={() => setSelectedHour(hr)}>
                      {hr}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger m-4" role="alert">
          {error}
        </div>
      ) : (
        <Reliabilityweekly
          selectedZones={selectedZones}
          selectedGm={selectedGm}
          selectedHour={selectedHour}
          date={date}
          allData={allData}
          dayStartData={dayStartData}
          promisesData={promisesData}
        />
      )}
    </>
  );
}