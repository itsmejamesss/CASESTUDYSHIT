import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Forms/Login';
import Register from './components/Forms/Register';
import TeamMemberDashboard from './components/TeamMember/TeamMemberDashboard';
import ProjectManagerDashboard from './components/ProjectManager/ProjectManagerDashboard';
import ProjectList from "./components/ProjectManager/components/ProjectList";


// Protected Route Wrapper
const ProtectedRoute = ({ element, role }) => {
    const userRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role && userRole !== role) {
        return <Navigate to="/login" />;
    }

    return element;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/team-member-dashboard" element={<ProtectedRoute element={<TeamMemberDashboard />} role="team_member" />} />
                <Route path="/project-manager-dashboard" element={<ProtectedRoute element={<ProjectManagerDashboard />} role="project_manager" />} />
                <Route path="/project-list" element={<ProjectList />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
