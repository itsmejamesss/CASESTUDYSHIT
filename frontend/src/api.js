import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to get authentication headers
const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
    },
});

// ==========================
// ✅ Authentication
// ==========================

// Register a new user
export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        return response.data;
    } catch (error) {
        console.error("Login API Error:", error.response?.data || error.message);
        throw error;
    }
};

// Logout user
export const logout = async () => {
    try {
        await axios.post(`${API_URL}/logout`, {}, getAuthHeaders());
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.warn('Token expired or invalid, logging out.');
        } else {
            console.error('Logout error:', error.response?.data || error.message);
        }
    } finally {
        // Remove token and role from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        // Remove global authorization header
        delete axios.defaults.headers.common["Authorization"];
    }
};
