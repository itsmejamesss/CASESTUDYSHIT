import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api";
import axios from "axios";
import './Login.css';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const { token, user } = await login(credentials); // returns only data now

            if (!token || !user) {
                throw new Error("Invalid login response.");
            }

            // Save token and role to localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role);

            // Set default auth header for future requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // Redirect based on role
            if (user.role === "project_manager") {
                navigate("/project-manager-dashboard");
            } else if (user.role === "team_member") {
                navigate("/team-member-dashboard");
            } else {
                throw new Error("Unexpected user role: " + user.role);
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <FaEnvelope className="icon" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-container">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="button-container">
                    <p>Don't have an account?</p>
                    <a onClick={() => navigate("/register")} className="register-a"> Register Here</a>
                </div>

                <button type="submit"><FaSignInAlt /> Login</button>
            </form>

            
        </div>
    );
};

export default Login;
