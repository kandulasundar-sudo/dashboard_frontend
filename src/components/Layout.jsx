import React from "react";
//import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div
      style={{
        maxHeight: "100vh",
      }}
      className="min-vh-100 bg-light d-flex flex-column"
    >
      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Main content area with sidebar + content */}
      <div className="flex-grow-1 d-flex">
        {/* Sidebar */}
        <aside
          className="d-flex flex-column p-0 border-end"
          style={{
            background: "#0d1a2e",
            minWidth: "220px", // adjust as per your need
            maxWidth: "260px",
          }}
        >
          <Sidebar />
        </aside>

        {/* Content area */}
        <main className="flex-grow-1">{children}</main>
      </div>
    </div>
  );
}
