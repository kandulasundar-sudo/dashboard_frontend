import React, { useEffect, useState } from "react";
import logo from '../assets/img/eklogo.png';

const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const regionColors = {
  East: { region: "#78adff", gm: "#bfd8ff" },
  West: { region: "#78adff", gm: "#bfd8ff" },
  North: { region: "#78adff", gm: "#bfd8ff" },
  South: { region: "#78adff", gm: "#bfd8ff" },
  Middle: { region: "#78adff", gm: "#bfd8ff" },
};

const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
};

const SheetTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
        const response = await fetch(apiUrl+"/api/eagle-data");
        const result = await response.json();
        if (result.values) {
          setData(result.values);
        } else {
          console.error("No data found from backend", result);
        }
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-3">Loading data...</p>;
  if (!data.length) return <p className="p-3">No data available</p>;

  const rows = data.slice(1);

  const regionIndex = 0;
  const gmIndex = 1;
  const dateIndex = 2;
  const hourStartIndex = 3;
  const hourEndIndex = 27;

  const filteredRows = rows.filter((row) => {
    const rowDate = row[dateIndex]?.trim();
    const formattedSelectedDate = formatDate(selectedDate);
    // Include all rows if no date is selected, or if the date matches
    return !selectedDate || rowDate === formattedSelectedDate;
  });

  const getCellStyle = (value, gmName,index) => {
    const num = parseFloat(String(value).replace("%", "")) || 0;
    
    if (
      gmName.toLowerCase() === "total" 
    ) {
      
      return { backgroundColor: "yellow", color: "black" , fontWeight: "bold" };
    } else if(gmName.toLowerCase() === "grand total"){
      return { backgroundColor: "#305496", color: "white" , fontWeight: "bold" };
    }else if(index == 7 && num>=80){
      return { backgroundColor: "#7cff41", color: "black" , fontWeight: "bold" };
    }
    else if(index == 7 && num>=60){
      return { backgroundColor: "#feffa2", color: "black" , fontWeight: "bold" };
    }
    else if(index == 7 && num<60){
      return { backgroundColor: "#ff0404", color: "black" , fontWeight: "bold" };
    }
    else {
     
      return { backgroundColor: "white" };
    }

    
  };

  const getRegionRowSpan = (startIdx) => {
    if (startIdx < 0 || startIdx >= filteredRows.length) return 0;
    const currentRegion = filteredRows[startIdx][regionIndex];
    let span = 0;
    let foundCurrentRegion = false;
    for (let i = startIdx; i < filteredRows.length; i++) {
      if (filteredRows[i] && filteredRows[i][regionIndex] === currentRegion) {
        foundCurrentRegion = true;
        span++;
      } else if(foundCurrentRegion && filteredRows[i][regionIndex] == "" || filteredRows[i][regionIndex] == null || filteredRows[i][regionIndex] === currentRegion ) {
        span++;
      }else{
        break;
      }
    }
    return currentRegion.toLowerCase() === "west" ? span - 1 : span;
  };

  let lastRegion = null;

  return (
    <>
    <nav
        className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top"
        style={{
          backgroundColor: "#072c62",
          color: "white",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img
            src={logo}
            alt="eKart Logo"
            height="40"
            className="me-2"
          />
        </a>
      </nav>
    
    <div className="cswrap eagleye">
      

      <div style={{ padding: "10px" }}>
        <label style={{ marginRight: "10px" }}>Select Date: </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ marginBottom: "20px", padding: "5px" }}
        />

        <div style={{ maxHeight: "75vh", overflow: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    background: "#2f5597",
                    color: "white",
                    padding: "8px",
                    position: "sticky",
                    left: 0,
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  ZONE
                </th>
                <th
                  style={{
                    background: "#2f5597",
                    color: "white",
                    padding: "8px",
                    position: "sticky",
                    left: "60px",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  GM
                </th>
                {hours.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      background: "#2f5597",
                      color: "white",
                      padding: "8px",
                      position: "sticky",
                      top: 0,
                      zIndex: 5,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, i) => {
                const regionName = row[regionIndex];
                const gmName = row[gmIndex];
                const hourData = row.slice(hourStartIndex, hourEndIndex + 1);

                const renderRegionCell = regionName!="" && lastRegion !== regionName;
                if (renderRegionCell) {
                  lastRegion = regionName;
                }
                const regionRowSpan = renderRegionCell
                  ? getRegionRowSpan(i)
                  : 0;

                return (
                  <tr key={i}>
                    {renderRegionCell && (
                      <td
                        rowSpan={regionRowSpan}
                        style={{
                          padding: "6px",
                          border: "1px solid #ddd",
                          fontWeight: "bold",
                          backgroundColor:
                            regionColors[regionName]?.region || "#ccc",
                          verticalAlign: "middle",
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                        }}
                      >
                        {regionName}
                      </td>
                    )}

                    {
                      gmName?.trim().toLowerCase() === "grand total" && (
                        <td
                        style={{
                          backgroundColor: "#305496",
                        }}
                      ></td>
                      )
                    }

                    <td
                      style={{
                        padding: "6px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                        backgroundColor:
                          gmName?.trim().toLowerCase() === "total" 
                            ? "yellow"
                            : gmName?.trim().toLowerCase() === "grand total" 
                            ? "#305496"
                            : "#bfd8ff",
                        whiteSpace: "nowrap",
                        position: "sticky",
                        left: "60px",
                        zIndex: 1,
                      }}
                    >
                      {gmName}
                    </td>

                    {hourData.map((val, hIndex) => (
                      <td
                        key={hIndex}
                        style={{
                          ...getCellStyle(val, gmName,hIndex),
                          padding: "6px",
                          border: "1px solid #ddd",
                        }}
                      >
                        {val || "0.00%"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default SheetTable;
