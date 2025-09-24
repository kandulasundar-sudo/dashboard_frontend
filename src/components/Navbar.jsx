import React from "react";
import logo from '../assets/img/ekkartlogo.png';

const Navbar = ({
  date,
  setDate,
  showCalendar,
  setShowCalendar,
  selectedZone,
  setSelectedZone,
  zones,
  error,
  isLoading,
  selectedGm,
  setSelectedGm,
  gms,
  selectedHour,
  setSelectedHour,
  hours,
}) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img src={logo} alt="eKart Logo" height="40" className="me-2" />
        </a>
        <div className="d-flex align-items-center">
          {/* Date Picker */}
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

          {/* Zone Selector */}
          <div className="btn-group me-3">
            <button
              type="button"
              className="btn btn-light dropdown-toggle rounded"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Zone: {isLoading ? "Loading Zones..." : selectedZone}
            </button>
            <ul className="dropdown-menu rounded">
              <li>
                <a className="dropdown-item" href="#" onClick={() => setSelectedZone("All")}>
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
                    <a className="dropdown-item" href="#" onClick={() => setSelectedZone(zone)}>
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

          {/* GM Selector */}
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
              <li>
                <a className="dropdown-item" href="#" onClick={() => setSelectedGm("All")}>
                  All - GM
                </a>
              </li>
              {gms.length > 0 ? (
                gms.map((gm, idx) => (
                  <li key={idx}>
                    <a className="dropdown-item" href="#" onClick={() => setSelectedGm(gm)}>
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

          {/* Hour Selector */}
          <div className="btn-group me-3">
            <button
              type="button"
              className="btn btn-light dropdown-toggle rounded"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {isLoading ? "Loading Hours..." : selectedHour || "No data"}
            </button>
            <ul className="dropdown-menu rounded">
              {hours.length > 0 ? (
                hours.map((hr, idx) => (
                  <li key={idx}>
                    <a className="dropdown-item" href="#" onClick={() => setSelectedHour(hr)}>
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

export default Navbar;
