import React, { useState, useEffect, useMemo } from "react";
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
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

const sumBy = (rows, key) => rows.reduce((acc, r) => acc + toNum(r[key]), 0);

const generate24Hours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = i === 0 ? "12 AM" : i > 12 ? `${i - 12} PM` : `${i} AM`;
    hours.push(hour);
  }
  return hours;
};

// Register Chart.js components and the datalabels plugin
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

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

  const formatWithCommas = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
      <p className="fw-semibold mb-1" style={{ fontSize: "2.5rem" }}>{formatWithCommas(value)}</p>
    </div>
  );
};

// BarChart component
const BarChart = ({ title, labels, data, barColor }) => {
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
        color: 'black',
        anchor: 'end',
        align: 'top',
        offset: -5,
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: function(value) {
          if (value === 0) {
            return '';
          }
          if (value >= 100000) {
            return (value / 100000).toFixed(1) + 'L';
          }
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
          }
          return value;
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        display: false,
        beginAtZero: true,
        max: Math.max(...data) * 1.2,
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-5 shadow-lg" style={{ height: "300px" }}>
      <Bar options={options} data={chartData} />
    </div>
  );
};

// Main Dashboard with charts (modified to handle date range)
const Reliabilityweekly = ({ selectedZones, selectedGm, selectedHour, date, dateRange, allData }) => {
  const [statsData, setStatsData] = useState([]);
  const [chartData, setChartData] = useState({
    ofd: [],
    delivered: [],
    availability: [],
    ofcOfp: [],
    landing: [],
  });
  const [chartLabels, setChartLabels] = useState([]);

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
        title: "Delivered",
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
    ];
  };

  const calculateStats = (data, selectedHour, allData, date, selectedZones, selectedGm) => {
    if (data.length === 0) {
      return getDefaultStats();
    }
    const totalLanding = data.reduce((sum, item) => sum + (parseFloat(item.Landing) || 0), 0);
    const totalOfdOfp = data.reduce((sum, item) => sum + (parseFloat(item["OFD+OFP"]) || 0), 0);
    const totalAvailability = data.reduce((sum, item) => sum + (parseFloat(item.Availability) || 0), 0);
    const totalDelivered = data.reduce((sum, item) => sum + (parseFloat(item.Delivered) || 0), 0);
    const totalOFD = data.reduce((sum, item) => sum + (parseFloat(item.OFD) || 0), 0);

    let landingValue = totalLanding;

    // Logic to get previous hour's Landing data if current is zero
    if (landingValue === 0 && selectedHour !== "All") {
      const allHoursData = allData.filter(item => 
        new Date(item.date).toDateString() === date.toDateString() &&
        (selectedZones.includes("All") || selectedZones.some(zone => zone.toLowerCase() === (item.zone || "").toLowerCase())) &&
        (selectedGm === "All" || (item.gm && item.gm.toLowerCase() === selectedGm.toLowerCase()))
      );
      
      const availableHours = [...new Set(allHoursData.map(item => item.hour))].filter(Boolean).sort((a, b) => parseInt(a) - parseInt(b));
      const currentHourIndex = availableHours.indexOf(selectedHour);
      
      if (currentHourIndex !== -1) {
        for (let i = currentHourIndex - 1; i >= 0; i--) {
          const previousHour = availableHours[i];
          const previousHourData = allHoursData.filter(item => item.hour === previousHour);
          const previousLanding = previousHourData.reduce((sum, item) => sum + (parseFloat(item.Landing) || 0), 0);
          if (previousLanding > 0) {
            landingValue = previousLanding;
            break;
          }
        }
      }
    }


    return [
      {
        title: "Landing",
        value: landingValue.toFixed(0),
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
      {
        title: "Availability",
        value: totalAvailability.toFixed(0),
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
        title: "OFD",
        value: totalOFD.toFixed(0),
        icon: "⇣",
        gradient: "linear-gradient(to bottom right, #4c4d9a, #5658b1)",
        borderColor: "#41b590",
      },
    ];
  };

  const generateChartData = (data, startDate, endDate, selectedHour) => {
    const isSingleDay = startDate && endDate && startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0];
    const ofdData = [];
    const deliveredData = [];
    const availabilityData = [];
    const ofcOfpData = [];
    const landingData = [];
    const chartLabels = [];

    if (selectedHour !== "All" && !isSingleDay) {
      const dateMap = {};
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        dateMap[dateString] = { ofd: 0, delivered: 0, availability: 0, ofcOfp: 0, landing: 0 };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      data.filter(item => item.hour === selectedHour).forEach(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        if (dateMap[itemDate]) {
          dateMap[itemDate].ofd += parseFloat(item.OFD) || 0;
          dateMap[itemDate].delivered += parseFloat(item.Delivered) || 0;
          dateMap[itemDate].availability += parseFloat(item.Availability) || 0;
          dateMap[itemDate].ofcOfp += parseFloat(item["OFD+OFP"]) || 0;
          dateMap[itemDate].landing += parseFloat(item.Landing) || 0;
        }
      });

      Object.keys(dateMap).sort().forEach(date => {
        ofdData.push(dateMap[date].ofd);
        deliveredData.push(dateMap[date].delivered);
        availabilityData.push(dateMap[date].availability);
        ofcOfpData.push(dateMap[date].ofcOfp);
        landingData.push(dateMap[date].landing);
        chartLabels.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      });

    } else if (isSingleDay) {
      const dateString = startDate.toISOString().split('T')[0];
      const hourlyDataMap = {};
      
      const uniqueHours = [...new Set(data.filter(item => new Date(item.date).toISOString().split('T')[0] === dateString).map(item => item.hour))]
        .sort((a,b) => parseInt(a) - parseInt(b));

      uniqueHours.forEach(hour => {
        hourlyDataMap[hour] = { ofd: 0, delivered: 0, availability: 0, ofcOfp: 0, landing: 0 };
      });
      
      data.filter(item => new Date(item.date).toISOString().split('T')[0] === dateString).forEach(item => {
        if (hourlyDataMap[item.hour]) {
          hourlyDataMap[item.hour].ofd += parseFloat(item.OFD) || 0;
          hourlyDataMap[item.hour].delivered += parseFloat(item.Delivered) || 0;
          hourlyDataMap[item.hour].availability += parseFloat(item.Availability) || 0;
          hourlyDataMap[item.hour].ofcOfp += parseFloat(item["OFD+OFP"]) || 0;
          hourlyDataMap[item.hour].landing += parseFloat(item.Landing) || 0;
        }
      });

      let previousLandingValue = 0;
      uniqueHours.forEach(hour => {
        const currentLanding = hourlyDataMap[hour].landing;
        if (currentLanding > 0) {
          previousLandingValue = currentLanding;
          landingData.push(currentLanding);
        } else {
          landingData.push(previousLandingValue);
        }
        
        ofdData.push(hourlyDataMap[hour].ofd);
        deliveredData.push(hourlyDataMap[hour].delivered);
        availabilityData.push(hourlyDataMap[hour].availability);
        ofcOfpData.push(hourlyDataMap[hour].ofcOfp);
        chartLabels.push(`${hour}:00`);
      });
      
    } else {
      const dateDataMap = {};
      const currentDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
      const endUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

      while (currentDate <= endUTC) {
        const dateString = currentDate.toISOString().split('T')[0];
        dateDataMap[dateString] = { ofd: 0, delivered: 0, availability: 0, ofcOfp: 0, landing: 0 };
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      data.forEach(item => {
        const itemDate = new Date(item.date);
        const dateString = itemDate.toISOString().split('T')[0];
        if (dateDataMap[dateString]) {
          dateDataMap[dateString].ofd += parseFloat(item.OFD) || 0;
          dateDataMap[dateString].delivered += parseFloat(item.Delivered) || 0;
          dateDataMap[dateString].availability += parseFloat(item.Availability) || 0;
          dateDataMap[dateString].ofcOfp += parseFloat(item["OFD+OFP"]) || 0;
          dateDataMap[dateString].landing += parseFloat(item.Landing) || 0;
        }
      });

      Object.keys(dateDataMap).sort().forEach(date => {
        ofdData.push(dateDataMap[date].ofd);
        deliveredData.push(dateDataMap[date].delivered);
        availabilityData.push(dateDataMap[date].availability);
        ofcOfpData.push(dateDataMap[date].ofcOfp);
        landingData.push(dateDataMap[date].landing);
        chartLabels.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      });
    }

    return {
      ofd: ofdData,
      delivered: deliveredData,
      availability: availabilityData,
      ofcOfp: ofcOfpData,
      landing: landingData,
      labels: chartLabels,
    };
  };

  useEffect(() => {
    if (!allData || allData.length === 0) {
      setStatsData(getDefaultStats());
      setChartData({ ofd: [], delivered: [], availability: [], ofcOfp: [], landing: [] });
      setChartLabels([]);
      return;
    }

    const chartFilteredData = allData.filter((item) => {
      const itemDate = new Date(item.date);
      const isDateRangeMatch = dateRange.startDate && dateRange.endDate && itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
      const isZoneMatch = selectedZones.includes("All") || selectedZones.some(zone => zone.toLowerCase() === (item.zone || "").toLowerCase());
      const isGmMatch = selectedGm === "All" || (item.gm && item.gm.toLowerCase() === selectedGm.toLowerCase());
      return isDateRangeMatch && isZoneMatch && isGmMatch;
    });

    const newChartData = generateChartData(chartFilteredData, dateRange.startDate, dateRange.endDate, selectedHour);
    setChartData({
      ofd: newChartData.ofd,
      delivered: newChartData.delivered,
      availability: newChartData.availability,
      ofcOfp: newChartData.ofcOfp,
      landing: newChartData.landing,
    });
    setChartLabels(newChartData.labels);

    const statsFilteredData = allData.filter((item) => {
      const isDateMatch = date && (new Date(item.date).toDateString() === date.toDateString());
      const isZoneMatch = selectedZones.includes("All") || selectedZones.some(zone => zone.toLowerCase() === (item.zone || "").toLowerCase());
      const isGmMatch = selectedGm === "All" || (item.gm && item.gm.toLowerCase() === selectedGm.toLowerCase());
      const isHourMatch = selectedHour === "All" || item.hour === selectedHour;
      return isDateMatch && isZoneMatch && isGmMatch && isHourMatch;
    });
    
    setStatsData(calculateStats(statsFilteredData, selectedHour, allData, date, selectedZones, selectedGm));

  }, [allData, selectedZones, selectedGm, selectedHour, date, dateRange]);

  return (
    <div
      className="p-4 cswrap"
      style={{
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Stat Cards */}
      {/* <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4 mb-4">
        {statsData.map((stat, index) => (
          <div key={index} className="col">
            <StatCard {...stat} />
          </div>
        ))}
      </div> */}

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-6">
          <BarChart title="OFD" labels={chartLabels} data={chartData.ofd} barColor="#ff8c00" />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <BarChart title="Delivered" labels={chartLabels} data={chartData.delivered} barColor="#41b590" />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <BarChart title="Availability" labels={chartLabels} data={chartData.availability} barColor="#4c4d9a" />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <BarChart title="OFD+OFP" labels={chartLabels} data={chartData.ofcOfp} barColor="#ee5a7a" />
        </div>
        <div className="col-12 col-md-6 col-lg-12">
          <BarChart title="Landing" labels={chartLabels} data={chartData.landing} barColor="#41b590" />
        </div>
      </div>
    </div>
  );
};

// Main App component
export default function App() {
  const [date, setDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
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
      
      const headers = rowsData[0].map(h => String(h).trim().toLowerCase());
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
        rowData.OFD = row[headers.indexOf("OFD")] || 0;
        rowData.OFD = row[headers.indexOf("ofd")] || 0;
        return rowData;
      });
      
      setAllData(parsedData);
      setIsLoading(false);

    } catch (e) {
      setError("Failed to load Google Sheet data. Ensure the backend server is running.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const today = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(today.getDate() - 14);
    setDateRange({ startDate: fifteenDaysAgo, endDate: today });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate && allData.length > 0) {
      const selectedDateData = allData.filter(item => {
        const itemDate = new Date(item.date);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      });

      if (selectedDateData.length === 0) {
        setZones([]);
        setGms([]);
        setHours([]);
        setError("No data");
        setSelectedZones(["All"]);
        setSelectedGm("All");
        setSelectedHour("All");
      } else {
        const uniqueZones = [...new Set(selectedDateData.map(item => (item.zone || "").toLowerCase()))]
          .filter(zone => ["east", "west", "north", "south"].includes(zone))
          .sort()
          .map(zone => zone.charAt(0).toUpperCase() + zone.slice(1));
        const uniqueGms = [...new Set(selectedDateData.map(item => item.gm))].filter(Boolean).sort();
        const availableHours = [...new Set(selectedDateData.map(item => item.hour))].filter(Boolean).sort((a, b) => parseInt(a) - parseInt(b));
        
        setZones(uniqueZones);
        setGms(uniqueGms);
        setHours(availableHours);
        
        setSelectedZones(["All"]);
        setSelectedGm("All");
        
        const todayData = allData.filter(item => new Date(item.date).toDateString() === new Date().toDateString());
        const latestHour = todayData.length > 0 ? [...new Set(todayData.map(item => item.hour))].sort((a, b) => parseInt(b) - parseInt(a))[0] : "All";
        setSelectedHour(latestHour || "All");
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
  }, [dateRange, allData]);

  useEffect(() => {
    if (date && allData.length > 0) {
      const selectedDateData = allData.filter(
        (item) =>
          new Date(item.date).toDateString() === date.toDateString() &&
          (selectedZones.includes("All") || selectedZones.some(zone => zone.toLowerCase() === (item.zone || "").toLowerCase()))
      );

      const gmsForZone = selectedDateData.map((item) => item.gm);
      const uniqueGms = [...new Set(gmsForZone.filter(Boolean))].sort();
      
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

  const handleZoneChange = (zone) => {
    setSelectedZones(prevZones => {
      if (zone === "All") {
        return ["All"];
      }
      
      const isAllSelected = prevZones.includes("All");
      const isZoneSelected = prevZones.includes(zone);
      
      if (isAllSelected && !isZoneSelected) {
        return [zone];
      }
      
      if (isZoneSelected) {
        const newZones = prevZones.filter(z => z !== zone);
        return newZones.length === 0 ? ["All"] : newZones;
      }
      
      return [...prevZones, zone];
    });
  };

  const handleDateRangeChange = (e, type) => {
    const newDate = new Date(e.target.value);
    let newDateRange = { ...dateRange };
    if (type === 'start') {
      newDateRange.startDate = newDate;
    } else {
      newDate.setHours(23, 59, 59, 999);
      newDateRange.endDate = newDate;
    }
    setDateRange(newDateRange);
  };
  
  const handleSingleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setDate(newDate);
  };
  

  return (
    <>
      <Bootstrap />
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#"><img src={logo} alt="eKart Logo" height="40" className="me-2" /></a>
          <div className="d-flex align-items-center">
            <div className="btn-group me-3 position-relative">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {dateRange.startDate && dateRange.endDate
                  ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                  : "Select Date Range"}
              </button>
              {showCalendar && (
                <div className="dropdown-menu p-2 show rounded" style={{ position: "absolute", top: "100%", left: 0, zIndex: 1000, backgroundColor: "#fff", }}>
                  <p className="fw-bold mb-1">Select Chart Date Range:</p>
                  <label>Start Date:</label>
                  <input type="date" className="form-control mb-2" value={dateRange.startDate ? dateRange.startDate.toISOString().split("T")[0] : ""} onChange={(e) => handleDateRangeChange(e, 'start')} />
                  <label>End Date:</label>
                  <input type="date" className="form-control" value={dateRange.endDate ? dateRange.endDate.toISOString().split("T")[0] : ""} onChange={(e) => handleDateRangeChange(e, 'end')} />
                  <p className="fw-bold mt-3 mb-1">Select Single Date for Stats:</p>
                  <input type="date" className="form-control" value={date ? date.toISOString().split("T")[0] : ""} onChange={handleSingleDateChange} />
                </div>
              )}
            </div>

            <div className="btn-group me-3">
              <button type="button" className="btn btn-light dropdown-toggle rounded" data-bs-toggle="dropdown" aria-expanded="false"> Zone: {isLoading ? "Loading Zones..." : (selectedZones.includes("All") ? "All" : selectedZones.join(", "))}</button>
              <ul className="dropdown-menu rounded p-2" style={{ maxHeight: '300px', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <li>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="zone-all" checked={selectedZones.includes("All")} onChange={() => handleZoneChange("All")} />
                    <label className="form-check-label" htmlFor="zone-all">All - ZONE</label>
                  </div>
                </li>
                {zones.length > 0 ? (
                  zones.map((zone, idx) => (
                    <li key={idx}>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id={`zone-${zone}`} checked={selectedZones.includes(zone)} onChange={() => handleZoneChange(zone)} />
                        <label className="form-check-label" htmlFor={`zone-${zone}`}>{zone}</label>
                      </div>
                    </li>
                  ))
                ) : (
                  <li><div className="dropdown-item text-danger">No data</div></li>
                )}
              </ul>
            </div>

            <div className="btn-group me-3">
              <button type="button" className="btn btn-light dropdown-toggle rounded" data-bs-toggle="dropdown" aria-expanded="false">GM: {isLoading ? "Loading GMs..." : selectedGm}</button>
              <ul className="dropdown-menu rounded">
                <li><a className="dropdown-item" href="#" onClick={() => setSelectedGm("All")}>All - GM</a></li>
                {gms.length > 0 ? (
                  gms.map((gm, idx) => (
                    <li key={idx}><a className="dropdown-item" href="#" onClick={() => setSelectedGm(gm)}>{gm}</a></li>
                  ))
                ) : (
                  <li><a className="dropdown-item text-danger" href="#">No data</a></li>
                )}
              </ul>
            </div>

            <div className="btn-group me-3">
              <button type="button" className="btn btn-light dropdown-toggle rounded" data-bs-toggle="dropdown" aria-expanded="false">Hrs: {isLoading ? "Loading Hours..." : selectedHour || "No data"}</button>
              <ul className="dropdown-menu rounded">
                <li><a className="dropdown-item" href="#" onClick={() => setSelectedHour("All")}>All - HRS</a></li>
                {hours.length > 0 ? (
                  hours.map((hr, idx) => (
                    <li key={idx}><a className="dropdown-item" href="#" onClick={() => setSelectedHour(hr)}>{hr}</a></li>
                  ))
                ) : (
                  <li><a className="dropdown-item text-danger" href="#">No data</a></li>
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
        dateRange={dateRange}
        allData={allData}
      />
    </>
  );
}