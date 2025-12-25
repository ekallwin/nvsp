import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    const [applications, setApplications] = useState([]);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [acs, setAcs] = useState([]);

    const [filterState, setFilterState] = useState("");
    const [filterDistrict, setFilterDistrict] = useState("");
    const [filterAc, setFilterAc] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
    const [showNotReviewedOnly, setShowNotReviewedOnly] = useState(false);

    const navigate = useNavigate();

    const [selectedApp, setSelectedApp] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("adminToken")) {
            navigate("/login");
        }
        fetchApplications();
        fetchStates();
    }, []);

    useEffect(() => {
        if (filterState) fetchDistricts(filterState);
    }, [filterState]);

    useEffect(() => {
        fetchApplications();
    }, [filterState, filterDistrict, filterAc, showDuplicatesOnly, showNotReviewedOnly, searchTerm]);

    const fetchApplications = () => {
        let url = `${import.meta.env.VITE_API_BASE}/api/applications?`;

        // Map Codes/IDs to Names for backend filtering
        const selectedState = states.find(s => s.stateCd === filterState);
        const selectedDistrict = districts.find(d => d.districtCd === filterDistrict);
        const selectedAc = acs.find(a => String(a.asmblyNo) === String(filterAc));

        if (selectedState) url += `state=${encodeURIComponent(selectedState.stateName)}&`;
        if (selectedDistrict) url += `district=${encodeURIComponent(selectedDistrict.districtValue)}&`;
        if (selectedAc) url += `ac=${encodeURIComponent(selectedAc.asmblyName)}`;

        fetch(url)
            .then(res => res.json())
            .then(setApplications)
            .catch(err => console.error(err));
    };

    const fetchStates = () => {
        fetch(`${import.meta.env.VITE_API_BASE}/api/states`)
            .then(res => res.json())
            .then(data => setStates(Array.isArray(data) ? data : []));
    };

    const fetchDistricts = (stateCd) => {
        fetch(`${import.meta.env.VITE_API_BASE}/api/districts/${stateCd}`)
            .then(res => res.json())
            .then(data => setDistricts(Array.isArray(data) ? data : []));
    };

    const fetchAcs = (districtCd) => {
        fetch(`${import.meta.env.VITE_API_BASE}/api/acs/${districtCd}`)
            .then(res => res.json())
            .then(data => setAcs(Array.isArray(data) ? data : []));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to DELETE this application? This action cannot be undone.")) return;
        try {
            await fetch(`${import.meta.env.VITE_API_BASE}/api/applications/${id}`, { method: "DELETE" });
            fetchApplications();
            setSelectedApp(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id, status, reason = null) => {
        if (status === "Accepted" && !window.confirm(`Are you sure you want to ACCEPT this application?`)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/applications/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, rejectionReason: reason })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Application ${status} Successfully!`);
                fetchApplications();
                setSelectedApp(null);
                setIsRejecting(false);
                setRejectionReason("");
            } else {
                alert(`Failed: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error updating status: " + err.message);
        }
    };

    const getStatusColor = (status) => {
        if (status === "Submitted") return "orange";
        if (status === "Accepted") return "green";
        if (status === "Rejected") return "red";
        return "black";
    };

    const calculateAge = (dob) => {
        if (!dob) return "";
        const date = moment(dob, ["YYYY-MM-DD", "DD-MM-YYYY", moment.ISO_8601]);
        if (!date.isValid()) return "N/A";
        return moment().diff(date, 'years');
    };

    const formatGender = (gender) => {
        if (!gender) return "";
        return gender.charAt(0).toUpperCase();
    };

    const filteredApps = applications.filter(app => {
        if (showDuplicatesOnly && !app.isDuplicate) return false;
        if (showNotReviewedOnly && (app.status && app.status !== "Submitted")) return false;
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (
            app.refNo.toLowerCase().includes(lowerSearch) ||
            (app.epicNo && app.epicNo.toLowerCase().includes(lowerSearch)) ||
            app.formData.firstName.toLowerCase().includes(lowerSearch) ||
            (app.formData.surname && app.formData.surname.toLowerCase().includes(lowerSearch))
        );
    });

    const totalElectors = filteredApps.length;
    const maleCount = filteredApps.filter(app => app.formData.gender === "Male").length;
    const femaleCount = filteredApps.filter(app => app.formData.gender === "Female").length;
    const otherCount = filteredApps.filter(app => app.formData.gender !== "Male" && app.formData.gender !== "Female").length;

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/login");
    };

    return (
        <div className="admin-dashboard-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Admin Dashboard</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Logout
                </button>
            </div>

            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Name, Ref No, or EPIC"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <select
                    onChange={e => {
                        setFilterState(e.target.value);
                        setFilterDistrict("");
                        setFilterAc("");
                        setDistricts([]);
                        setAcs([]);
                    }}
                    className="filter-select"
                >
                    <option value="">Filter by State</option>
                    {states.map(s => <option key={s.stateCd} value={s.stateCd}>{s.stateName}</option>)}
                </select>

                <select
                    onChange={e => {
                        setFilterDistrict(e.target.value);
                        setFilterAc("");
                        setAcs([]);
                    }}
                    className="filter-select"
                >
                    <option value="">Filter by District</option>
                    {districts.map(d => <option key={d.districtCd} value={d.districtCd}>{d.districtValue}</option>)}
                </select>

                <select onChange={e => setFilterAc(e.target.value)} className="filter-select">
                    <option value="">Filter by Assembly</option>
                    {acs.map(a => <option key={a.acId} value={a.asmblyNo}>{a.asmblyNo} - {a.asmblyName}</option>)}
                </select>

                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                    <input
                        type="checkbox"
                        checked={showDuplicatesOnly}
                        onChange={e => setShowDuplicatesOnly(e.target.checked)}
                    />
                    Duplicates
                </label>

                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                    <input
                        type="checkbox"
                        checked={showNotReviewedOnly}
                        onChange={e => setShowNotReviewedOnly(e.target.checked)}
                    />
                    Not Reviewed
                </label>

                {/* <button onClick={fetchApplications} className="apply-btn">Apply Filters</button> */}
            </div>

            <table className="applications-table">
                <thead>
                    <tr className="table-header">
                        <th>Ref No / EPIC</th>
                        <th>Name</th>
                        <th>Age & DOB</th>
                        <th>Gender</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredApps.map(app => (
                        <tr key={app.id}>
                            <td style={{ display: 'flex', flexDirection: 'column' }}>
                                <span> {app.isDuplicate && app.status !== 'Accepted' && <div className="duplicate-badge">Duplicate</div>}</span>


                                <strong className="ref-text">{app.refNo}</strong>
                                {app.epicNo && <div className="epic-subtext">EPIC: {app.epicNo}</div>}

                            </td>
                            <td>{app.formData.firstName} {app.formData.surname}</td>
                            <td>{calculateAge(app.formData.dob)} years old & {app.formData.dob}</td>
                            <td>{formatGender(app.formData.gender)}</td>
                            <td className="status-cell" style={{ color: getStatusColor(app.status) }}>
                                {app.status || "Submitted"}
                            </td>
                            <td>
                                <button
                                    onClick={() => { setSelectedApp(app); setIsRejecting(false); }}
                                    className={`action-btn ${app.status === "Accepted" || app.status === "Rejected" ? "btn-info" : "btn-blue"}`}
                                >
                                    {app.status === "Accepted" || app.status === "Rejected" ? "View Details" : "Review"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="stats-footer" style={{ marginTop: "20px", display: "flex", gap: "20px", justifyContent: "center", fontWeight: "bold" }}>
                <span>Total Electors: {totalElectors}</span>
                <span>Male: {maleCount}</span>
                <span>Female: {femaleCount}</span>
                <span>Other: {otherCount}</span>
            </div>

            {selectedApp && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={() => setSelectedApp(null)} className="close-btn">❌</button>

                        <h2 className="modal-title">Application Details</h2>

                        <div className="details-grid">
                            <div>
                                <h3 className="section-title">Personal Details</h3>
                                <p><strong>Name:</strong> {selectedApp.formData.firstName} {selectedApp.formData.surname}</p>
                                <p><strong>Gender:</strong> {selectedApp.formData.gender}</p>
                                <p><strong>DOB:</strong> {selectedApp.formData.dob}</p>
                                <p><strong>Mobile:</strong> {selectedApp.formData.mobile}</p>
                                <p><strong>Email:</strong> {selectedApp.formData.email}</p>
                                <p><strong>Aadhaar:</strong> {selectedApp.formData.aadhaar || "Not Submitted"}</p>
                                <p><strong>Relative:</strong> {selectedApp.formData.relativeName} ({selectedApp.formData.relationType})</p>

                                <h3 className="section-title">Address</h3>
                                <p>{selectedApp.formData.houseNo}, {selectedApp.formData.street}</p>
                                <p>{selectedApp.formData.village}, {selectedApp.formData.postOffice}</p>
                                <p>{selectedApp.formData.tehsil}, {selectedApp.formData.district}, {selectedApp.formData.state} - {selectedApp.formData.pinCode}</p>

                                <h3 className="section-title">Family</h3>
                                <p><strong>Name:</strong> {selectedApp.formData.familyMemberName || "N/A"}</p>
                                <p><strong>Relation:</strong> {selectedApp.formData.familyRelation || "N/A"}</p>
                                <p><strong>EPIC:</strong> {selectedApp.formData.familyEpic || "N/A"}</p>

                                <h3 className="section-title">Disability</h3>
                                <p><strong>Category:</strong> {selectedApp.formData.disabilityCat || "None"}</p>
                                <p><strong>%:</strong> {selectedApp.formData.disabilityPerc || "N/A"}</p>
                            </div>

                            <div>
                                <h3 className="section-title">Photo</h3>
                                {selectedApp.formData.photo ? (
                                    <img src={`${import.meta.env.VITE_API_BASE}/api/applications/${selectedApp.id}/photo`} className="photo-preview" />
                                ) : "No Photo"}

                                <h3 className="section-title">Documents</h3>
                                <ul style={{ paddingLeft: "20px" }}>
                                    <li><strong>DOB Proof:</strong> {selectedApp.formData.dobDocType} - {selectedApp.formData.dobProof ? <a href={`${import.meta.env.VITE_API_BASE}/api/applications/${selectedApp.id}/dobProof`} target="_blank" rel="noreferrer">View</a> : "None"}</li>
                                    <li><strong>Addr Proof:</strong> {selectedApp.formData.addressDocType} - {selectedApp.formData.addressProof ? <a href={`${import.meta.env.VITE_API_BASE}/api/applications/${selectedApp.id}/addressProof`} target="_blank" rel="noreferrer">View</a> : "None"}</li>
                                    <li><strong>Disability Cert:</strong> {selectedApp.formData.disabilityCert ? <a href={`${import.meta.env.VITE_API_BASE}/api/applications/${selectedApp.id}/disabilityCert`} target="_blank" rel="noreferrer">View</a> : "N/A"}</li>
                                </ul>

                                <h3 className="section-title">Declaration</h3>
                                <p><strong>Place:</strong> {selectedApp.formData.declPlace}</p>
                                <p><strong>Date:</strong> {selectedApp.formData.declDate}</p>
                                <p><strong>Resident Since:</strong> {selectedApp.formData.residentSince}</p>

                                <div className="submitted-info-box">
                                    <p><strong>Submitted To:</strong> {selectedApp.formData.state} - {selectedApp.formData.district} - {selectedApp.formData.ac}</p>
                                    <p><strong>Ref No:</strong> {selectedApp.refNo}</p>
                                    <p><strong>EPIC No:</strong> {selectedApp.epicNo}</p>
                                    <p><strong>Current Status:</strong> <span style={{ fontWeight: "bold", color: getStatusColor(selectedApp.status) }}>{selectedApp.status}</span></p>
                                    <p><strong>Rejection Reason:</strong> {selectedApp.rejectionReason}</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            {selectedApp.status === "Submitted" && (
                                <>
                                    {!isRejecting ? (
                                        <>
                                            <button onClick={() => handleStatusUpdate(selectedApp.id, "Accepted")} className="btn-accept">Accept</button>
                                            <button onClick={() => setIsRejecting(true)} className="btn-reject">Reject</button>
                                        </>
                                    ) : (
                                        <div className="rejection-box">
                                            <h4 className="rejection-title">Select Rejection Reason</h4>
                                            <select
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="rejection-select"
                                            >
                                                <option value="">-- Select Reason --</option>
                                                <option value="Age/date-of-birth discrepancy">Age/date-of-birth discrepancy</option>
                                                <option value="Death">Death</option>
                                                <option value="Duplicate entry">Duplicate entry</option>
                                                <option value="Elector not present in address">Elector not present in address</option>
                                                <option value="Incorrect/Insufficient documents">Incorrect/Insufficient documents</option>
                                                <option value="Mismatched name or address">Mismatched name or address</option>
                                                <option value="Photograph or signature issues">Photograph or signature issues</option>
                                            </select>
                                            <div>
                                                <button
                                                    onClick={() => {
                                                        if (!rejectionReason) return alert("Please select a reason");
                                                        handleStatusUpdate(selectedApp.id, "Rejected", rejectionReason);
                                                    }}
                                                    className="btn-confirm-reject"
                                                >
                                                    Confirm Rejection
                                                </button>
                                                <button onClick={() => { setIsRejecting(false); setRejectionReason(""); }} className="btn-cancel">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {selectedApp.status === "Accepted" && (
                                <button onClick={() => handleDelete(selectedApp.id)} className="btn-delete">Delete Elector</button>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
