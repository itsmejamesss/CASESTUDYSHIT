import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav, Container, Button, Table, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaList } from 'react-icons/fa';
import axios from 'axios';
import './TeamMemberDashboard.css';

const TeamMemberDashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchProjectsAndTasks = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError('No authentication token found.');
                    return;
                }

                // Fetch projects assigned to the team member
                const projectResponse = await axios.get('http://localhost:8000/api/team/projects', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProjects(projectResponse.data.projects);

                // Fetch tasks assigned to the team member
                const taskResponse = await axios.get('http://localhost:8000/api/team/tasks', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTasks(taskResponse.data.tasks);
            } catch (err) {
                console.error(err.response?.data || err.message);
                setError('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchProjectsAndTasks();

        // Optional polling every 30 seconds to refresh data automatically
        const intervalId = setInterval(fetchProjectsAndTasks, 30000);

        return () => clearInterval(intervalId);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate('/login');
    };

    return (
        <div className="d-flex">
            <div className="sidebar">
                <h4 className="text-center">Team Member Dashboard</h4>
                <Nav className="flex-column">
                    <Nav.Link className="text-white" onClick={() => navigate('/task-list')}>
                        <FaList /> Task List
                    </Nav.Link>
                    <Nav.Link className="text-white" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </Nav.Link>
                </Nav>
            </div>

            <div className="flex-grow-1 p-4">
                <div className="topbar">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="greeting-text"
                    >
                        <h4 className="m-0 text-white">👋 Welcome, Team Member!</h4>
                    </motion.div>
                </div>

                <Container className="mt-4">
                    {loading && <Spinner animation="border" />}
                    {error && <Alert variant="danger">{error}</Alert>}

                    {/* Projects Section (Table Only) */}
                    <div className="mt-4">
                        <h4>Your Projects</h4>
                        
                        {/* Table Layout for Projects */}
                        <Table striped bordered hover responsive className="project-table">
                            <thead>
                                <tr>
                                    <th>Project Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center">No projects assigned to you.</td>
                                    </tr>
                                ) : (
                                    projects.map((project) => (
                                        <tr key={project.id}>
                                            <td>{project.name}</td>
                                            <td>{project.description}</td>
                                            <td>
                                                <Button variant="primary" onClick={() => navigate(`/project/${project.id}`)}>View Project</Button>
                                                <Button variant="success" className="ms-2">Done</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Tasks Section (Table Only) */}
                    <div className="mt-4">
                        <h4>Your Tasks</h4>
                        
                        {/* Table Layout for Tasks */}
                        <Table striped bordered hover responsive className="task-table">
                            <thead>
                                <tr>
                                    <th>Task Title</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center">No tasks assigned to you.</td>
                                    </tr>
                                ) : (
                                    tasks.map((task) => (
                                        <tr key={task.id}>
                                            <td>{task.title}</td>
                                            <td>{task.description}</td>
                                            <td>
                                                <span className={`badge bg-${task.status === 'Completed' ? 'success' : 'warning'}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Button variant="info" onClick={() => navigate(`/task/${task.id}`)}>View Task</Button>
                                                <Button variant="success" className="ms-2">Done</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default TeamMemberDashboard;
