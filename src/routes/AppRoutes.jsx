import React from "react";
import { Routes, Route,Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Reliabilityweekly from "../pages/Reliabilityweekly";
import Attainment from "../pages/Attainment";
import Reliability from "../pages/Reliability";
import EagleEye from "../pages/EagleEye";
import FDP_view from "../pages/FDP_view";
import RSPS_view from "../pages/RSPS_view";
import Executives_Dash from "../pages/Executives";
import TrackingDash from "../pages/TrackingView";

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/Executives" />} />
        <Route path="/Reliabilityweekly" element={<Reliabilityweekly />} />
        <Route path="/Attainment" element={<Attainment />}/>
        <Route path="/Reliability" element={<Reliability />} />
        <Route path="/EagleEye" element={<EagleEye />} />
        <Route path="/FDP_view" element={<FDP_view />} />
        <Route path="/RSPS_view" element={<RSPS_view />} />
        <Route path="/Executives" element={<Executives_Dash />} />
        <Route path="/TrackingView" element={<TrackingDash />} />
       

      </Routes>
    </Layout>
  );
}