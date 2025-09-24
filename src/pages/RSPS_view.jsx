import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from '../assets/img/eklogo.png';


const formatWithCommas = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// New function to get a consistent light color for each card title
const getCardColor = (title) => {
  switch (title) {
    case "Overall DayStart":
    case "Overall Pendency":
      return "#E3F2FD"; // Light blue for Overall
    case "Day Start-CPD":
    case "CPD-Pendency":
    case "CPD -Attempted_&Marked_NCD":
    case "CPD -Attempted_&_Marked_CD":
      return "#F9EBEA"; // Light red/pink for CPD
    case "Day Start-EOB":
    case "EOB-Pendency":
      return "#F0F4C3"; // Light yellow for EOB
    case "Day Start-IPD3":
    case "IPD3-Pendency":
      return "#E8F5E9"; // Light green for IPD3
    case "Day Start-IPD3+":
    case "IPD3+-Pendency":
      return "#FFFDE7"; // Light beige for IPD3+
    case "DayStart-FPD":
    case "FPD-Pendency":
      return "#EFEBE9"; // Light brown for FPD
    default:
      return "#f8f9fa"; // Default light gray
  }
};

const StatCard = ({ title, mainValue, percentage }) => {
  const cardColor = getCardColor(title);
  const cardStyle = {
    backgroundColor: cardColor,
    border: "1px solid #e0e0e0",
    height: "100px",
    position: "relative",
    color: "#495057",
    borderRadius: "1.2rem",
    fontFamily: "'Roboto', sans-serif"
  };

  return (
    <div
      className="shadow-sm p-2 d-flex flex-column justify-content-between overflow-hidden stat-card"
      style={cardStyle}
    >
      <div className="d-flex justify-content-between align-items-start" style={{ zIndex: 1 }}>
        <h3 className="fs-6 fw-normal opacity-90 mb-0">{title}</h3>
        <p className="mb-0 fw-normal" style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>
          {percentage}
        </p>
      </div>
      <div className="d-flex align-items-end" style={{ zIndex: 1 }}>
        <div className="d-flex align-items-center">
          <p className="mb-0 fw-medium" style={{ fontSize: "clamp(1.5rem, 3vw, 1.8rem)", lineHeight: 1 }}>
            {formatWithCommas(mainValue)}
          </p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ date, selectedZones, selectedGm, selectedHour, allData,dayStartData,promisesData }) => {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFilteredData = (data,skipHours = false) => {
    if (!data || data.length === 0 || !date) {
      return [];
    }
    let filteredData = data.filter(item => {
      const itemDate = item?.date;
      const selectedDate = formatDate(date);
      return itemDate === selectedDate;
    });
    if (selectedZones && selectedZones[0] !== "All" ) {
      filteredData = filteredData.filter(item => selectedZones.includes(item?.zone));
    }
    if (selectedGm && selectedGm !== "All" ) {
      filteredData = filteredData.filter(item => item?.gm === selectedGm);
    }
    if (selectedHour && selectedHour !== "All" && !skipHours) {
      filteredData = filteredData.filter(item => {
        const itemHour = parseInt(String(item?.hours).trim().split(' ')[0], 10);
        return itemHour === parseInt(selectedHour, 10);
      });
    }
    return filteredData;
  };

  const calculateMetrics = (allData,dayStartData,promisesData) => {
    const rspsPendencyData = getFilteredData(allData);

    const dayStartSheetData = getFilteredData(dayStartData,true);

    const promisesSheetData = getFilteredData(promisesData,true);

    const overallDaystart = dayStartSheetData.reduce((sum, item) => sum + (item.overall_daystart || 0), 0);
    const cpdDaystart = dayStartSheetData.reduce((sum, item) => sum + (item.day_start_cpd || 0), 0);
    const eobDaystart = dayStartSheetData.reduce((sum, item) => sum + (item.day_start_eob || 0), 0);
    const ipd3Daystart = dayStartSheetData.reduce((sum, item) => sum + (item.day_start_ipd3 || 0), 0);
    const ipd3PlusDaystart = dayStartSheetData.reduce((sum, item) => sum + (item.day_start_ipd3plus || 0), 0);
    const fpdDaystart = dayStartSheetData.reduce((sum, item) => sum + (item.day_start_fpd || 0), 0);
    
    
    const overallPendency = rspsPendencyData.reduce((sum, item) => sum + (item.overall_pendency || 0), 0);
    const cpdPendency = rspsPendencyData.reduce((sum, item) => sum + (item.cpd_pendency || 0), 0);
    const eobPendency = rspsPendencyData.reduce((sum, item) => sum + (item.eob_pendency || 0), 0);
    const ipd3Pendency = rspsPendencyData.reduce((sum, item) => sum + (item.ipd3_pendency || 0), 0);
    const ipd3PlusPendency = rspsPendencyData.reduce((sum, item) => sum + (item.ipd3plus_pendency || 0), 0);
    const fpdPendency = rspsPendencyData.reduce((sum, item) => sum + (item.fpd_pendency || 0), 0);
    const ncd = rspsPendencyData.reduce((sum, item) => sum + (item.ncd || 0), 0);
    const cd = rspsPendencyData.reduce((sum, item) => sum + (item.cd || 0), 0);

const promisesFiltredData = promisesSheetData.reduce((sum, item) => sum + (item.promises || 0), 0);
    
    return {
      overallDaystart,
      cpdDaystart,
      eobDaystart,
      ipd3Daystart,
      ipd3PlusDaystart,
      fpdDaystart,
      overallPendency,
      cpdPendency,
      eobPendency,
      ipd3Pendency,
      ipd3PlusPendency,
      fpdPendency,
promisesFiltredData,
ncd,
cd
    };
  };

  let metrics = calculateMetrics(allData,dayStartData,promisesData);

  const getPercentage = (divident, divisor) => {
    if (divisor === 0) return "0%";
    const percentage = ((divident / divisor) * 100).toFixed(2);
    return `${percentage}%`;
  };

let dashboardData = [
    {
      category: "Overall",
      metrics: [
        { title: "Overall DayStart", value: metrics.overallDaystart },
        { title: "Overall Pendency", value: metrics.overallPendency, percentage: getPercentage(metrics.overallPendency, metrics.overallDaystart) },
      ],
    },
    {
      category: "CPD",
      metrics: [
        { title: "Day Start-CPD", value: metrics.cpdDaystart },
        { title: "CPD-Pendency", value: metrics.cpdPendency, percentage: getPercentage(metrics.cpdPendency, metrics.cpdDaystart) },
        { title: "CPD -Attempted_&Marked_NCD", value: metrics.ncd ? metrics.ncd : 0 },
        { title: "CPD -Attempted_&_Marked_CD", value: metrics.cd ? metrics.cd : 0 },
      ],
    },
    {
      category: "EOB",
      metrics: [
        { title: "Day Start-EOB", value: metrics.eobDaystart },
        { title: "EOB-Pendency", value: metrics.eobPendency, percentage: getPercentage(metrics.eobPendency, metrics.eobDaystart) },
      ],
    },
    {
      category: "IPD3",
      metrics: [
        { title: "Day Start-IPD3", value: metrics.ipd3Daystart },
        { title: "IPD3-Pendency", value: metrics.ipd3Pendency, percentage: getPercentage(metrics.ipd3Pendency, metrics.ipd3Daystart) },
      ],
    },
    {
      category: "IPD3+",
      metrics: [
        { title: "Day Start-IPD3+", value: metrics.ipd3PlusDaystart },
        { title: "IPD3+-Pendency", value: metrics.ipd3PlusPendency, percentage: getPercentage(metrics.ipd3PlusPendency, metrics.ipd3PlusDaystart) },
      ],
    },
    {
      category: "FPD",
      metrics: [
        { title: "DayStart-FPD", value: metrics.fpdDaystart },
        { title: "FPD-Pendency", value: metrics.fpdPendency, percentage: getPercentage(metrics.fpdPendency, metrics.fpdDaystart) },
      ],
    },
  ];

const RefreshDashBoard=()=>{
    metrics = calculateMetrics(allData,dayStartData,promisesData);

    dashboardData = [
    {
      category: "Overall",
      metrics: [
        { title: "Overall DayStart", value: metrics.overallDaystart },
        { title: "Overall Pendency", value: metrics.overallPendency, percentage: getPercentage(metrics.overallPendency, metrics.overallDaystart) },
      ],
    },
    {
      category: "CPD",
      metrics: [
        { title: "Day Start-CPD", value: metrics.cpdDaystart },
        { title: "CPD-Pendency", value: metrics.cpdPendency, percentage: getPercentage(metrics.cpdPendency, metrics.cpdDaystart) },
        { title: "CPD -Attempted_&Marked_NCD", value: metrics.ncd ? metrics.ncd : 0 },
        { title: "CPD -Attempted_&_Marked_CD", value: metrics.cd ? metrics.cd : 0 },
      ],
    },
    {
      category: "EOB",
      metrics: [
        { title: "Day Start-EOB", value: metrics.eobDaystart },
        { title: "EOB-Pendency", value: metrics.eobPendency, percentage: getPercentage(metrics.eobPendency, metrics.eobDaystart) },
      ],
    },
    {
      category: "IPD3",
      metrics: [
        { title: "Day Start-IPD3", value: metrics.ipd3Daystart },
        { title: "IPD3-Pendency", value: metrics.ipd3Pendency, percentage: getPercentage(metrics.ipd3Pendency, metrics.ipd3Daystart) },
      ],
    },
    {
      category: "IPD3+",
      metrics: [
        { title: "Day Start-IPD3+", value: metrics.ipd3PlusDaystart },
        { title: "IPD3+-Pendency", value: metrics.ipd3PlusPendency, percentage: getPercentage(metrics.ipd3PlusPendency, metrics.ipd3PlusDaystart) },
      ],
    },
    {
      category: "FPD",
      metrics: [
        { title: "DayStart-FPD", value: metrics.fpdDaystart },
        { title: "FPD-Pendency", value: metrics.fpdPendency, percentage: getPercentage(metrics.fpdPendency, metrics.fpdDaystart) },
      ],
    },
  ];
}

useEffect(()=>{
    RefreshDashBoard();
},[allData])

  

  return (
    <div className="container-fluid py-3" style={{ backgroundColor: "#f8f9fa", fontFamily: "'Roboto', sans-serif" }}>
      <div className="card shadow-lg p-4 rounded-4" style={{ backgroundColor: "white", marginLeft: "250px"}}>
        <table className="table">
          <tbody>
            {dashboardData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="align-middle">
                  <h5 className="fw-bold text-muted">{row.category}</h5>
                </td>
                <td className="w-250">
                  <div className="d-flex flex-wrap gap-3">
                    {row.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} style={{ width: "200px"}}>
                        <StatCard
                          title={metric.title}
                          mainValue={metric.value}
                          percentage={metric.percentage}
                        />
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [allData, setAllData] = useState([]);
  const [zones, setZones] = useState([]);
  const [gms, setGms] = useState([]);
  const [hours, setHours] = useState([]);
  const [selectedZones, setSelectedZones] = useState("All");
  const [selectedGm, setSelectedGm] = useState("All");
  const [selectedHour, setSelectedHour] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
const [dayStartData,setDayStartData] = useState([]);
const [promisesData,setPromisesData] = useState([]);

  const ALLOWED_ZONES = ['East', 'West', 'North', 'South'];

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const API_URL = apiUrl + "/api/RSPS-data";

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to load data from server.");
      }
      const data = await response.json();

      const rspsPendencyData = data['RSPS_Pendency']?.values;


    const dayStartData = data['Day_Start']?.values;

    const promisesData = data['Promises']?.values;




      if (!rspsPendencyData || rspsPendencyData.length < 2) {
        setAllData([]);
        setZones([]);
        setGms([]);
        setHours([]);
        setError("No data");
        setSelectedZones("All");
        setSelectedGm("All");
        setSelectedHour("All");
        setIsLoading(false);
setDayStartData([]);
setPromisesData([]);
        return;
      }

      const headers = rspsPendencyData[0].map(h => String(h).trim().toLowerCase().replace(/ /g, "_"));
      
    const getHeaderIndex = (name) => headers.indexOf(name.trim().toLowerCase().replace(/ /g, "_"));
      
    const rows = rspsPendencyData.slice(1);
      
      const parsedData = rows.map((row) => {
        const rowData = {};
        rowData.zone = row[getHeaderIndex("zone")] || "";
        rowData.gm = row[getHeaderIndex("gm")] || "";
        
        rowData.overall_pendency = parseFloat(String(row[getHeaderIndex("overall_pendency")]).replace(/,/g, '') || 0);
        rowData.cpd_pendency = parseFloat(String(row[getHeaderIndex("cpd-pendency")]).replace(/,/g, '') || 0);
        rowData.eob_pendency = parseFloat(String(row[getHeaderIndex("eob-pendency")]).replace(/,/g, '') || 0);
        rowData.ipd3_pendency = parseFloat(String(row[getHeaderIndex("ipd3-pendency")]).replace(/,/g, '') || 0);
        rowData.ipd3plus_pendency = parseFloat(String(row[getHeaderIndex("ipd3+-pendency")]).replace(/,/g, '') || 0);
        rowData.fpd_pendency = parseFloat(String(row[getHeaderIndex("fpd-pendency")]).replace(/,/g, '') || 0);
        rowData.ncd = parseFloat(String(row[getHeaderIndex("cpd_-attempted_&marked_ncd")]).replace(/,/g, '') || 0);
        rowData.cd = parseFloat(String(row[getHeaderIndex("cpd_-attempted_&_marked_cd")]).replace(/,/g, '') || 0);
        
        rowData.date = row[getHeaderIndex("date")] || "";
        rowData.hours = row[getHeaderIndex("hour")] || "";
        return rowData;
      });
      
      setAllData(parsedData);

    const headersDayStart = dayStartData[0].map(h => String(h).trim().toLowerCase().replace(/ /g, "_"));
      
    const getHeaderIndexOfDayStart = (name) => headersDayStart.indexOf(name.trim().toLowerCase().replace(/ /g, "_"));
      
    const rowsOfDayStart = dayStartData.slice(1);
      
      const parsedDataOfDayStart = rowsOfDayStart.map((row) => {
        const rowData = {};
        rowData.zone = row[getHeaderIndexOfDayStart("zone")] || "";
        rowData.gm = row[getHeaderIndexOfDayStart("gm")] || "";
        
        rowData.overall_daystart = parseFloat(String(row[getHeaderIndexOfDayStart("overall_daystart")]).replace(/,/g, '') || 0);
        rowData.day_start_cpd = parseFloat(String(row[getHeaderIndexOfDayStart("day_start-cpd")]).replace(/,/g, '') || 0);
        rowData.day_start_eob = parseFloat(String(row[getHeaderIndexOfDayStart("day_start-eob")]).replace(/,/g, '') || 0);
        rowData.day_start_ipd3 = parseFloat(String(row[getHeaderIndexOfDayStart("day_start-ipd3")]).replace(/,/g, '') || 0);
        rowData.day_start_ipd3plus = parseFloat(String(row[getHeaderIndexOfDayStart("day_start-ipd3+")]).replace(/,/g, '') || 0);
        rowData.day_start_fpd = parseFloat(String(row[getHeaderIndexOfDayStart("daystart-fpd")]).replace(/,/g, '') || 0);
        
        rowData.date = row[getHeaderIndexOfDayStart("date")] || "";
        rowData.hours = row[getHeaderIndexOfDayStart("hour")] || "";
        return rowData;
      });
      
      setDayStartData(parsedDataOfDayStart);

    const headersPromises = promisesData[0].map(h => String(h).trim().toLowerCase().replace(/ /g, "_"));
      
    const getHeaderIndexPromises = (name) => headersPromises.indexOf(name.trim().toLowerCase().replace(/ /g, "_"));
      
    const rowsPromises = promisesData.slice(1);
      
      const parsedDataPromises = rowsPromises.map((row) => {
        const rowData = {};
        rowData.zone = row[getHeaderIndexPromises("zone")] || "";
        rowData.gm = row[getHeaderIndexPromises("gm")] || "";
        
        rowData.promises = parseFloat(String(row[getHeaderIndexPromises("promises")]).replace(/,/g, '') || 0);
        
        rowData.date = row[getHeaderIndexPromises("date")] || "";
        return rowData;
      });
      
      setPromisesData(parsedDataPromises);



        
      setIsLoading(false);
    } catch (e) {
      setError("Failed to load Google Sheet data. Ensure the backend server is running.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!allData || allData.length === 0 || !date) {
      setZones([]);
      setGms(["All"]);
      setHours(["All"]);
      setSelectedGm("All");
      setSelectedHour("All");
      return;
    }
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const selectedDate = formatDate(date);

    const selectedDateData = allData.filter(item => item.date === selectedDate);
    
    // Update available zones based on selected date data
    const uniqueZones = [...new Set(selectedDateData.map(item => String(item.zone).trim()))]
      .filter(zone => ALLOWED_ZONES.map(z => z.toLowerCase()).includes(zone.toLowerCase()) && zone !== "");
    setZones(["All", ...uniqueZones.sort()]);

    const filteredDataByZone = selectedZones === "All"
      ? selectedDateData
      : selectedDateData.filter(item => item.zone === selectedZones);

    const gmsForZone = [...new Set(filteredDataByZone.map(item => item.gm))].filter(Boolean).sort();
    setGms(["All", ...gmsForZone]);

    const hoursForZone = [...new Set(filteredDataByZone.map(item => {
      const hourString = String(item.hours).trim();
      const parts = hourString.split(' ')[0];
      return parseInt(parts, 10);
    }))]
      .filter(hour => hour && !isNaN(hour))
      .sort((a, b) => a - b);
    setHours(["All", ...hoursForZone]);
    
    // Reset selected GM and Hour if the current selection is no longer valid for the new filters
    if (selectedGm !== "All" && !gmsForZone.includes(selectedGm)) {
      setSelectedGm("All");
    }
    if (selectedHour !== "All" && !hoursForZone.includes(parseInt(selectedHour, 10))) {
      setSelectedHour("All");
    }
  }, [date, allData, selectedZones]);

  const handleZoneChange = (zone) => {
    setSelectedZones(zone);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top" style={{fontFamily: "'Roboto', sans-serif"}}>
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
            {/* Zone Dropdown */}
            <div className="btn-group me-3">
              <button
                type="button"
                className="btn btn-light dropdown-toggle rounded"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Zone: {isLoading ? "Loading Zones..." : selectedZones}
              </button>
              <ul className="dropdown-menu rounded">
                {zones.map((zone, idx) => (
                  <li key={idx}>
                    <a className="dropdown-item" href="#" onClick={() => handleZoneChange(zone)}>
                      {zone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* GM Dropdown */}
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
            {/* Hour Dropdown */}
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
      {isLoading || allData == undefined || dayStartData ==undefined || promisesData == undefined ? (
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
        <Dashboard
          selectedZones={selectedZones === "All" ? ["All"] : [selectedZones]}
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