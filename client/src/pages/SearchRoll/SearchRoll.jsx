import React, { useState } from "react";
import "./SearchRoll.css";
import moment from "moment";

export default function SearchRoll() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleSearch = async (e) => {
        e.preventDefault();
        setResult(null);
        setError("");

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/search?query=${query}&type=epic`);
            const json = await res.json();
            if (json.success) {
                setResult(json.data);
            } else {
                setError("Record not found");
            }
        } catch (err) {
            setError("Search failed");
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return "";
        const birthDate = moment(dob, "DD-MM-YYYY");
        if (!birthDate.isValid()) return "N/A";
        return moment().diff(birthDate, 'years');
    };

    return (
        <div className="search-roll-page">
            <div className="search-container">
                <h1 className="search-title">Search Electoral Roll</h1>
                <p className="search-subtitle">Verify your name in the voter list by EPIC Number.</p>

                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Enter EPIC No (e.g. ABC1234567)"
                        value={query}
                        onChange={e => setQuery(e.target.value.toUpperCase())}
                        className="search-input-2"
                    />
                    <button type="submit" className="search-btn">Search</button>
                </form>

                {error && <div className="search-error">{error}</div>}

                {result && (
                    <div className="result-container">
                        <h3 className="result-title">Elector Details</h3>

                        <div className="details-grid">
                            <div>
                                <strong>Name:</strong> <br />
                                {result.formData.firstName} {result.formData.surname}
                            </div>

                            <div>
                                <strong>Age:</strong> <br />
                                {calculateAge(result.formData.dob)} Years
                            </div>

                            <div>
                                <strong>Gender:</strong> <br />
                                {result.formData.gender}
                            </div>

                            <div>
                                <strong>Relative Name:</strong> <br />
                                {result.formData.relativeName}
                            </div>

                            <div>
                                <strong>Type of Relative:</strong> <br />
                                {result.formData.relationType}
                            </div>
                            <br />

                            <div>
                                <strong>State:</strong> <br />
                                {result.formData.state}
                            </div>

                            <div>
                                <strong>District:</strong> <br />
                                {result.formData.district}
                            </div>

                            <div>
                                <strong>Assembly Constituency:</strong> <br />
                                {result.formData.ac}
                            </div>

                        </div>

                        <hr className="divider" />
                        <div className="success-message">
                            Found in Electoral Roll
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
