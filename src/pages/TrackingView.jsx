import React, { useState } from "react";
import logo from '../assets/img/eklogo.png';

/* ------------------ Tracking Info Search Component ------------------ */
export const TrackingInfoSearch = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3001";

    const apiUrl = apiURL + "/api/tracking-data";

    const handleSearch = async () => {
        if (searchTerm.trim() === "") {
            alert("Please enter a tracking ID to search.");
            setFilteredData([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const searchUrl = `${apiUrl}?tracking_id=${encodeURIComponent(
                searchTerm.trim()
            )}`;
            const response = await fetch(searchUrl);
            const rawData = await response.json();

            if (!rawData || !rawData.values || rawData.values.length < 2) {
                setFilteredData([]);
                alert("No records found for the specified tracking ID.");
                return;
            }

            const headersFromApi = rawData.values[0].map((h) => h.trim());
            const valuesFromApi = rawData.values[1];

            const formattedData = [
                headersFromApi.reduce((acc, header, index) => {
                    acc[header] = valuesFromApi[index];
                    return acc;
                }, {}),
            ];

            setHeaders(headersFromApi);
            setFilteredData(formattedData);
        } catch (err) {
            setError("Error fetching data: " + err.message);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tracking-container">
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Enter tracking ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {loading && <p className="status-message">Searching for data...</p>}
            {error && (
                <p className="status-message" style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {filteredData.length > 0 && (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {headers.map((header, colIndex) => (
                                        <td key={colIndex}>{row[header]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

/* ------------------ Page Layout with Navbar ------------------ */
export default function TrackingDash() {
    return (
        <>
            <nav className="navbar">
                <div className="navbar-content">
                    <a href="#" className="navbar-brand">
                        <img
                            src={logo}
                            alt="eKart Logo"
                            className="logo"
                        />
                        
                    </a>
                </div>
            </nav>

            <main className="main-content tracker-container">
                <TrackingInfoSearch />
            </main>

            <style>{`
                

                /* Navbar */
                .navbar {
                    background: #0d6efd;
                    padding: 14px 20px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
                .navbar-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .navbar-brand {
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    color: white;
                    gap: 10px;
                }
                .logo {
                    height: 40px;
                }
                .brand-text {
                    font-weight: 600;
                    font-size: 18px;
                }

                /* Main content */
               

                /* Search box */
                .tracking-container {
                    background: #ffffff;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .search-section {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .search-section input {
                    flex: 1;
                    min-width: 220px;
                    padding: 12px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .search-section input:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 2px rgba(13,110,253,0.2);
                }
                .search-section button {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    background: #0d6efd;
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                .search-section button:hover {
                    background: #0b5ed7;
                }

                /* Table styling */
                .table-wrapper {
                    overflow-x: auto;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 700px;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #eaeaea;
                    font-size: 14px;
                    white-space: nowrap;
                }
                th {
                    background-color: #f1f4f9;
                    font-weight: 600;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                tr:nth-child(even) {
                    background: #fafafa;
                }
                tr:hover {
                    background: #f5faff;
                }

                .status-message {
                    text-align: center;
                    margin-top: 15px;
                    font-size: 14px;
                    color: #666;
                }
            `}</style>
        </>
    );
}
