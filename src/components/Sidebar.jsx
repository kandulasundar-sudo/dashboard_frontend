import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react"; // Arrow icon

const links = [
   {path: "/Executives", label: "Executive Summary" },
  { path: "/attainment", label: "Attainment" },
  {
    label: "OFD",
    children: [
      { path: "/Reliabilityweekly", label: "Hourly_Comparison" },
      { path: "/Reliability", label: "DOD_Comparison" },
    ],
  },
  { path: "/EagleEye", label: "EagleEye" },
  {
    label: "Pendencies",
    children: [
      { path: "/FDP_view", label: "FDP_View" },
      { path: "/RSPS_view", label: "RSPS_View" },
    ],
  },
  { path: "/TrackingView", label: "Misroute dashboard" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div
      className="d-flex flex-column p-4 h-100"
      style={{ backgroundColor: "#f5f6f8" }}
    >
      <ul className="nav flex-column gap-2">
        {links.map(({ path, label, children }) => {
          if (children) {
            const isOpen = openMenu === label;

            return (
              <li key={label} className="nav-item">
                {/* Parent menu button */}
                <button
                  onClick={() => toggleMenu(label)}
                  className="w-100 d-flex justify-content-between align-items-center border-0 bg-transparent nav-link text-dark fw-bold"
                  style={{
                    borderRadius: "8px",
                    padding: "10px 15px",
                    backgroundColor: isOpen ? "#d6dae0" : "transparent",
                    transition: "all 0.3s ease",
                  }}
                >
                  <span>{label}</span>
                  <ChevronRight
                    size={18}
                    style={{
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </button>

                {/* Submenu with animation */}
                <div
                  style={{
                    maxHeight: isOpen ? "500px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.4s ease",
                  }}
                >
                  <ul className="nav flex-column ms-3 mt-1">
                    {children.map(({ path: childPath, label: childLabel }) => (
                      <li key={childPath} className="nav-item">
                        <Link
                          to={childPath}
                          className={`nav-link ${
                            pathname === childPath
                              ? "active text-white"
                              : "text-dark"
                          }`}
                          style={{
                            borderRadius: "6px",
                            backgroundColor:
                              pathname === childPath ? "#1a2942" : "transparent",
                            padding: "8px 12px",
                            marginBottom: "4px",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              pathname === childPath ? "#1a2942" : "#e2e6ea")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              pathname === childPath ? "#1a2942" : "transparent")
                          }
                        >
                          {childLabel}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          }

          // Single item
          return (
            <li key={path} className="nav-item">
              <Link
                to={path}
                className={`nav-link ${
                  pathname === path ? "active text-white" : "text-dark"
                }`}
                style={{
                  borderRadius: "8px",
                  backgroundColor:
                    pathname === path ? "#1a2942" : "transparent",
                  padding: "10px 15px",
                  transition: "all 0.3s ease",
                  display: "block",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    pathname === path ? "#1a2942" : "#e2e6ea")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    pathname === path ? "#1a2942" : "transparent")
                }
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
