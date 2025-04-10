import React, { useState } from 'react';
import { register } from '../../api';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserShield, FaArrowLeft } from 'react-icons/fa';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact_info: '',
        password: '',
        role: 'team_member'
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            if (err.response?.data?.errors) {
                setError(err.response.data.errors);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed. Please check your inputs.');
            }
        }
    };

    const handleBack = () => {
        navigate(-1); // Navigates to the previous page
    };

    return (
        <div className="register-container">
            <a type="button" className="back-button" onClick={handleBack}>
                <FaArrowLeft /> Back
            </a>
            <h2>Register</h2>
            {error && (
                <div className="error-message">
                    {typeof error === 'string' ? (
                        <p>{error}</p>
                    ) : (
                        Object.entries(error).map(([key, messages]) => (
                            <p key={key}>{messages.join(', ')}</p>
                        ))
                    )}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-container">
                    <FaEnvelope className="icon" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-container">
                    <FaPhone className="icon" />
                    <input
                        type="text"
                        name="contact_info"
                        placeholder="Contact Info"
                        value={formData.contact_info}
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
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-container">
                    <FaUserShield className="icon" />
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="project_manager">Project Manager</option>
                        <option value="team_member">Team Member</option>
                    </select>
                </div>
                <div className="button-container">
                    <button type="submit">Register</button>
                </div>
            </form>
        </div>
    );
}

export default Register;
