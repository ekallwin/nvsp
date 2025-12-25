import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Form6 from "./pages/Form6/Form6";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import DownloadEpic from "./pages/DownloadEpic/DownloadEpic";
import SearchRoll from "./pages/SearchRoll/SearchRoll";
import TrackStatus from "./pages/TrackStatus/TrackStatus";
import "./App.css";

import { Toaster } from 'react-hot-toast';

import ProtectedRoute from "./Components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="container">

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form-6" element={<Form6 />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/download-epic" element={<DownloadEpic />} />
          <Route path="/search" element={<SearchRoll />} />
          <Route path="/track-status" element={<TrackStatus />} />
        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App