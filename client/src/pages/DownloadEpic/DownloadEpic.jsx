import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import "./DownloadEpic.css";

export default function DownloadEpic() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const printRef = useRef();


    const handleSearch = async (e) => {
        e.preventDefault();
        setError("");
        setData(null);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/search?query=${query}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            } else {
                setError(json.message);
            }
        } catch (err) {
            setError("Search failed");
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        const input = printRef.current;
        try {
            const canvas = await html2canvas(input, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${data.epicNo}.pdf`);
        } catch (err) {
            console.error("Download failed", err);
            alert("Failed to download PDF");
        }
        setIsDownloading(false);
    };

    return (
        <div className="download-page">
            <div className="download-container">

                <h1 className="download-title">Download e-EPIC</h1>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Enter Reference No or EPIC No"
                        value={query}
                        onChange={e => setQuery(e.target.value.toUpperCase())}
                        className="search-input-2"
                    />
                    <button type="submit" className="search-btn-2">Search</button>
                </form>

                {error && <p className="error-msg">{error}</p>}

                {data && (
                    <div className="details-view-container">

                        <div className="details-box">
                            <h3 className="details-header">Verify voter details</h3>
                            <div className="details-grid">
                                <p><strong>Name:</strong> {data.formData.firstName} {data.formData.surname}</p>
                                <p><strong>EPIC No:</strong> <span className="epic-highlight">{data.epicNo}</span></p>
                                <p><strong>Gender:</strong> {data.formData.gender}</p>
                                <p><strong>DOB:</strong> {data.formData.dob}</p>
                                <p><strong>Relation:</strong> {data.formData.relationType} - {data.formData.relativeName}</p>
                                <p><strong>State:</strong> {data.formData.state}</p>
                                <p><strong>District:</strong> {data.formData.district}</p>
                                <p><strong>Assembly:</strong> {data.formData.ac}</p>
                            </div>
                        </div>

                        <button onClick={handleDownload} disabled={isDownloading} className="download-btn">
                            {isDownloading ? "Generating PDF..." : "Download EPIC Card"}
                        </button>

                        <div className="hidden-pdf-container">
                            <div ref={printRef} className="pdf-print-container">

                                <h2 className="eci-header">ELECTION COMMISSION OF INDIA</h2>

                                <div className="card-pair-container">
                                    <div className="epic-card">
                                        <div className="card-header-bar">
                                            <h4 className="card-header-title">ELECTION COMMISSION OF INDIA</h4>
                                            <p className="card-header-sub">Elector Identity Card</p>
                                        </div>

                                        <div className="card-body">
                                            <div className="card-photo-box">
                                                {data.hasPhoto ? (
                                                    <img src={`${import.meta.env.VITE_API_BASE}/api/applications/${data.id}/photo`} className="card-photo" />
                                                ) : "No Photo"}
                                            </div>
                                            <div className="card-info">
                                                <h4 className="card-epic-no">{data.epicNo}</h4>
                                                <p className="card-detail-item"><strong>Name:</strong> {data.formData.firstName} {data.formData.surname}</p>
                                                <p className="card-detail-item"><strong>Father's Name:</strong> {data.formData.relativeName}</p>
                                                <p className="card-detail-item"><strong>Gender:</strong> {data.formData.gender}</p>
                                                <p className="card-detail-item"><strong>Date of Birth:</strong> {data.formData.dob}</p>
                                            </div>
                                        </div>
                                        <div className="card-stripe"></div>
                                    </div>

                                    <div className="epic-card">
                                        <div className="card-back-body">
                                            <div>
                                                <p><strong>Address:</strong><br />
                                                    {data.formData.houseNo}, {data.formData.street},<br />
                                                    {data.formData.village}, {data.formData.postOffice},<br />
                                                    {data.formData.district}, {data.formData.state} - {data.formData.pinCode}</p>

                                                <p style={{ marginTop: "10px" }}><strong>Assembly Constituency:</strong><br />
                                                    {data.formData.ac}</p>
                                            </div>

                                            <div className="qr-footer">
                                                <div className="qr-box">
                                                    <QRCodeCanvas value={data.epicNo || "EPIC"} size={60} />
                                                </div>
                                                <div className="officer-sign">
                                                    <p style={{ margin: 0 }}>Electoral Registration Officer</p>
                                                    <p style={{ margin: "5px 0 0 0" }}>Date: {new Date().toLocaleDateString('en-GB')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p>This is a sample project. This is not treated as original Voter ID</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
