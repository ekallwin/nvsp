import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./TrackStatus.css";

export default function TrackStatus() {
    const [refNo, setRefNo] = useState("");
    const [statusData, setStatusData] = useState(null);
    const [error, setError] = useState("");

    const handleTrack = async (e) => {
        e.preventDefault();
        setError("");
        setStatusData(null);

        if (!refNo) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/track/${refNo}`);
            const data = await res.json();

            if (data.success) {
                setStatusData(data);
            } else {
                setError(data.message || "Application not found");
            }
        } catch (err) {
            setError("Failed to track application");
        }
    };

    const getStatusColor = (status) => {
        if (status === "Submitted") return "orange";
        if (status === "Accepted") return "green";
        if (status === "Rejected") return "red";
        return "black";
    };

    return (
        <div className="track-status-page">
            <div className="track-container">
                <h1 className="track-title">Track Application Status</h1>
                <p className="track-subtitle">Enter your Reference Number to check application status.</p>

                <form onSubmit={handleTrack} className="track-form">
                    <input
                        type="text"
                        placeholder="Enter Reference Number (e.g. S123...)"
                        value={refNo}
                        onChange={(e) => setRefNo(e.target.value)}
                        className="track-input"
                    />
                    <button type="submit" className="track-btn">Track Status</button>
                </form>

                {error && <p className="error-msg">{error}</p>}

                {statusData && (
                    <div className="status-box">
                        <p className="status-text"><strong>Current Status:</strong> <span className="status-value" style={{ color: getStatusColor(statusData.status) }}>{statusData.status}</span></p>
                        {statusData.epicNo && (
                            <p className="status-text"><strong>EPIC Number:</strong> <span className="status-value" style={{ color: "blue" }}>{statusData.epicNo}</span></p>
                        )}
                        {statusData.status === "Submitted" && (
                            <p className="submitted-note">Your application is currently under review by the Election Officer.</p>
                        )}
                        {statusData.status === "Accepted" && (
                            <div className="download-link-container">
                                <Link to="/download-epic" className="download-link">Download e-EPIC</Link>
                            </div>
                        )}
                        {statusData.status === "Rejected" && statusData.rejectionReason && (
                            <div className="rejection-box">
                                <strong>Reason for Rejection:</strong> {statusData.rejectionReason}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
