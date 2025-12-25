import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
    return (
        <div className="home-page">
            <h1 className="title">Voter's Services Portal</h1>

            <div className="home-card-container">

                <Link to="/form-6" className="home-card card-green">
                    <div className="home-card-icon">📝</div>
                    <h3>New Voter Registration</h3>
                    <p>Fill Form 6 to apply for a new Voter ID card.</p>
                </Link>

                <Link to="/track-status" className="home-card card-yellow">
                    <div className="home-card-icon">📊</div>
                    <h3>Track Application Status</h3>
                    <p>Check the status of your submitted application.</p>
                </Link>

                <Link to="/search" className="home-card card-cyan">
                    <div className="home-card-icon">🔍</div>
                    <h3>Search in Electoral Roll</h3>
                    <p>Search by EPIC Number.</p>
                </Link>

                <Link to="/download-epic" className="home-card card-red">
                    <div className="home-card-icon">⬇️</div>
                    <h3>Download e-EPIC</h3>
                    <p>Download digital Voter ID Card.</p>
                </Link>

                <Link to="/login" className="home-card card-gray">
                    <div className="home-card-icon">🏛️</div>
                    <h3>Official Login</h3>
                    <p>For Election Officials Only</p>
                </Link>

            </div>
        </div>
    );
}
