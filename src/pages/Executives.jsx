import React, { useMemo,useState,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from '../assets/img/eklogo.png';

const columnNames = [
  "ZONE",
  "GM",
  "Daystart_cpd",
  "RSPS_Pendency",
  "Promises",
  "Pendency_pe",
  "OFD",
  "Delivered",
  "Conversion",
  "Availability",
  "Landing",
];

const sum = (arr) => arr.reduce((a, b) => a + (parseFloat(b) || 0), 0);

export function Executives({
  date,
  selectedZones,
  selectedGm,
  selectedHour,
  allData,
  dayStartData,
  promisesData,
  reliabilityData,
}) {
  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };
  const selectedDate = formatDate(date);

  // ---------- 1. Filter each sheet ----------
  const filterSheet = (sheet) =>
    sheet.filter((row) => {
      if (row.date !== selectedDate) return false;
      if (selectedZones[0] !== "All" && !selectedZones.includes(row.zone))
        return false;
      if (selectedGm !== "All" && row.gm !== selectedGm) return false;
      if (selectedHour !== "All" && String(row.hours).split(" ")[0] !== String(selectedHour))
        return false;
      return true;
    });

    const filterSheetWithOutHour = (sheet) =>
    sheet.filter((row) => {
      if (row.date !== selectedDate) return false;
      if (selectedZones[0] !== "All" && !selectedZones.includes(row.zone))
        return false;
      if (selectedGm !== "All" && row.gm !== selectedGm) return false;
      
      return true;
    });

  const dayStartFiltered = filterSheetWithOutHour(dayStartData);
  const rspsFiltered = filterSheet(allData);
  const promisesFiltered = filterSheetWithOutHour(promisesData);
  const reliabilityFiltered = filterSheet(reliabilityData);

  // ---------- 2. Merge by Zone + GM ----------
  const mergedRows = useMemo(() => {
    const keySet = new Set();
    const allKeys = [
      ...dayStartFiltered,
      ...rspsFiltered,
      ...promisesFiltered,
      ...reliabilityFiltered,
    ].map((r) => `${r.zone}__${r.gm}`);
    allKeys.forEach((k) => keySet.add(k));

    return Array.from(keySet).map((key) => {
      const [zone, gm] = key.split("__");
      const d1 = dayStartFiltered.find((r) => r.zone === zone && r.gm === gm) || {};
      const d2 = rspsFiltered.find((r) => r.zone === zone && r.gm === gm) || {};
      const d3 = promisesFiltered.find((r) => r.zone === zone && r.gm === gm) || {};
      const d4 = reliabilityFiltered.find((r) => r.zone === zone && r.gm === gm) || {};

      const Daystart_cpd = d1.day_start_cpd || 0;
      const RSPS_Pendency = d2.cpd_pendency || 0;
      const Promises = d3.promises || 0;
      const OFD = d4.ofd || 0;
      const Delivered = d4.delivered || 0;
      const Availability = d4.availability || 0;
      const Landing = d4.landing || 0;

      const PendencyPct = Promises ? (RSPS_Pendency / Promises) * 100 : 0;
      const Conversion = OFD ? (Delivered / OFD) * 100 : 0;

      return {
        zone,
        gm,
        Daystart_cpd,
        RSPS_Pendency,
        Promises,
        Pendency_pe: PendencyPct,
        OFD,
        Delivered,
        Conversion,
        Availability,
        Landing,
      };
    });
  }, [
    dayStartFiltered,
    rspsFiltered,
    promisesFiltered,
    reliabilityFiltered,
  ]);

  // ---------- 3. Totals ----------
  const zones = [...new Set(mergedRows.map((r) => r.zone))];

  const zoneTotals = zones.map((z) => {
    const rows = mergedRows.filter((r) => r.zone === z);
    return {
      zone: z,
      gm: "TOTAL",
      Daystart_cpd: sum(rows.map((r) => r.Daystart_cpd)),
      RSPS_Pendency: sum(rows.map((r) => r.RSPS_Pendency)),
      Promises: sum(rows.map((r) => r.Promises)),
      OFD: sum(rows.map((r) => r.OFD)),
      Delivered: sum(rows.map((r) => r.Delivered)),
      Availability: sum(rows.map((r) => r.Availability)),
      Landing: sum(rows.map((r) => r.Landing)),
    };
  });


  zoneTotals.forEach((t) => {
    t.Pendency_pe = t.Promises ? (t.RSPS_Pendency / t.Promises) * 100 : 0;
    t.Conversion = t.OFD ? (t.Delivered / t.OFD) * 100 : 0;
  });

  const grandTotal = {
    zone: "GRAND TOTAL",
    gm: "",
    Daystart_cpd: sum(zoneTotals.map((r) => r.Daystart_cpd)),
    RSPS_Pendency: sum(zoneTotals.map((r) => r.RSPS_Pendency)),
    Promises: sum(zoneTotals.map((r) => r.Promises)),
    OFD: sum(zoneTotals.map((r) => r.OFD)),
    Delivered: sum(zoneTotals.map((r) => r.Delivered)),
    Availability: sum(zoneTotals.map((r) => r.Availability)),
    Landing: sum(zoneTotals.map((r) => r.Landing)),
  };

  grandTotal.Pendency_pe = grandTotal.Promises
    ? (grandTotal.RSPS_Pendency / grandTotal.Promises) * 100
    : 0;
  grandTotal.Conversion = grandTotal.OFD
    ? (grandTotal.Delivered / grandTotal.OFD) * 100
    : 0;


    const renderZoneSummaryCard = (t) => (
  <div key={t.zone} className="total-card">
    <div>{t.zone} TOTAL</div>
    <div>
      Daystart: {t.Daystart_cpd}, RSPS: {t.RSPS_Pendency}, Promises: {t.Promises}
    </div>
    <div>
      <span>Pend%: {t.Pendency_pe.toFixed(1)}%</span>{" "}
      <span>Conv%: {t.Conversion.toFixed(1)}%</span>
    </div>
  </div>
);


  // ---------- 4. Render ----------
  const renderRow = (row, isTotal = false) => (
  <tr key={row.zone + row.gm} className={isTotal ? "total-row" : ""}>
    <td>{row.zone}</td>
    <td>{row.gm}</td>
    <td>{row.Daystart_cpd}</td>
    <td>{row.RSPS_Pendency}</td>
    <td>{row.Promises}</td>
    <td>
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${Math.min(row.Pendency_pe || 0, 100)}%`,
            backgroundColor: row.Pendency_pe > 80 ? "#ef4444" : "#3b82f6",
          }}
        />
      </div>
      <span style={{ marginLeft: '5px', fontSize: '0.75rem' }}>{row.Pendency_pe?.toFixed(1)}%</span>
    </td>
    <td>{row.OFD}</td>
    <td>{row.Delivered}</td>
    <td>
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${Math.min(row.Conversion || 0, 100)}%`,
            backgroundColor: row.Conversion > 80 ? "#10b981" : "#f59e0b",
          }}
        />
      </div>
      <span style={{ marginLeft: '5px', fontSize: '0.75rem' }}>{row.Conversion?.toFixed(1)}%</span>
    </td>
    <td>{row.Availability}</td>
    <td>{row.Landing}</td>
  </tr>
);




  return (<>
    <div className="container-fluid py-3" style={{ backgroundColor: "#f8f9fa" }}>
  <div className="dashboard-card">
  <div className="table-scroll">
    <table className="table table-bordered table-sm dashboard-table">
      <thead>
        <tr>
          {columnNames.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {zones.map((z) => (
          <React.Fragment key={z}>
            {mergedRows
              .filter((r) => r.zone === z)
              .map((r) => renderRow(r))}
            {renderRow(zoneTotals.find((t) => t.zone === z), true)}
          </React.Fragment>
        ))}
        {renderRow(grandTotal, true)}
      </tbody>
    </table>
  </div>
</div>


</div>

</>
  );
}


export default function Executives_Dash() {
    const ALLOWED_ZONES = ['East', 'West', 'North', 'South'];
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [allData, setAllData] = useState([]);
  const [zones, setZones] = useState(ALLOWED_ZONES);
  const [gms, setGms] = useState([]);
  const [hours, setHours] = useState([]);
  const [selectedZones, setSelectedZones] = useState("All");
  const [selectedGm, setSelectedGm] = useState("All");
  const [selectedHour, setSelectedHour] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
const [dayStartData,setDayStartData] = useState([]);
const [promisesData,setPromisesData] = useState([]);
const [reliabilityData,setReliabilityData] = useState([]);
const [rspsSelectedData,setRspsSelectedData] = useState([]);
const [dayStartSelectedData,setDayStartSelectedData] = useState([]);
const [promisesSelectedData,setPromisesSelectedData] = useState([]);
const [reliabilitySelectedData,setReliabilitySelectedData] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const API_URL = apiUrl+"/api/executives-data";

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

    const reliabilitySheetData = data['Reliability']?.values;




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
        
        rowData.cpd_pendency = parseFloat(String(row[getHeaderIndex("cpd-pendency")]).replace(/,/g, '') || 0);
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
        
        rowData.day_start_cpd = parseFloat(String(row[getHeaderIndexOfDayStart("day_start-cpd")]).replace(/,/g, '') || 0);
        
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
        rowData.gm = row[getHeaderIndexPromises("gm_name")] || "";
        
        rowData.promises = parseFloat(String(row[getHeaderIndexPromises("promises")]).replace(/,/g, '') || 0);
        
        rowData.date = row[getHeaderIndexPromises("date")] || "";
        return rowData;
      });
      
      setPromisesData(parsedDataPromises);

    const headersReliability = reliabilitySheetData[0].map(h => String(h).trim().toLowerCase().replace(/ /g, "_"));
      
    const getHeaderIndexReliability = (name) => headersReliability.indexOf(name.trim().toLowerCase().replace(/ /g, "_"));
      
    const rowsReliability = reliabilitySheetData.slice(1);
      
      const parsedDataReliability = rowsReliability.map((row) => {
        const rowData = {};
        rowData.zone = row[getHeaderIndexReliability("zone")] || "";
        rowData.gm = row[getHeaderIndexReliability("gm")] || "";
        
        rowData.ofd = parseFloat(String(row[getHeaderIndexReliability("ofd")]).replace(/,/g, '') || 0);
              rowData.delivered = parseFloat(String(row[getHeaderIndexReliability("delivered")]).replace(/,/g, '') || 0);
              rowData.availability = parseFloat(String(row[getHeaderIndexReliability("availability")]).replace(/,/g, '') || 0);
              rowData.landing = parseFloat(String(row[getHeaderIndexReliability("landing")]).replace(/,/g, '') || 0);
        
        rowData.date = row[getHeaderIndexReliability("date")] || "";
     rowData.hours = row[getHeaderIndexReliability("hour")] || "";
        return rowData;
      });
      
      setReliabilityData(parsedDataReliability);



        
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

    const selectedDateDataRsps = allData.filter(item => item.date === selectedDate);
    const selectedDateDataDayStart = dayStartData.filter(item => item.date === selectedDate);
    const selectedDateDataPromises = promisesData.filter(item => item.date === selectedDate);
    const selectedDateDataReliability = reliabilityData.filter(item => item.date === selectedDate);

    setRspsSelectedData(selectedDateDataRsps);
    setDayStartSelectedData(selectedDateDataDayStart);
    setPromisesSelectedData(selectedDateDataPromises);
    setReliabilitySelectedData(selectedDateDataReliability);
    
    // Update available zones based on selected date data
    const uniqueZones = [...new Set(selectedDateDataRsps.map(item => String(item.zone).trim()))]
      .filter(zone => ALLOWED_ZONES.map(z => z.toLowerCase()).includes(zone.toLowerCase()) && zone !== "");
    setZones(["All", ...uniqueZones.sort()]);

    const filteredDataByZone = selectedZones === "All"
      ? selectedDateDataRsps
      : selectedDateDataRsps.filter(item => item.zone === selectedZones);

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
  }, [date, allData, selectedZones,date]);

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
        <Executives
          selectedZones={selectedZones === "All" ? ["All"] : [selectedZones]}
          selectedGm={selectedGm}
          selectedHour={selectedHour}
          date={date}
          allData={rspsSelectedData}
        dayStartData={dayStartSelectedData}
        promisesData={promisesSelectedData}
        reliabilityData={reliabilitySelectedData}
        />
      )}
    </>
  );
}
