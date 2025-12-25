import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem("adminToken", data.token);
                navigate("/admin");
            } else {
                alert("Invalid Credentials");
            }
        } catch (err) {
            console.error("Login Error:", err);
            alert("Something went wrong");
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <h2 className="admin-login-title">Official Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="admin-login-input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="admin-login-input"
                    />
                    <button type="submit" className="admin-login-btn">Login</button>
                </form>
            </div>
        </div>
    );
}
