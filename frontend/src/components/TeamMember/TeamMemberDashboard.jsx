import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav, Container, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
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
                <Container className="text-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h2 className="fw-bold text-dark">Welcome, Team Member!</h2>
                        <p className="text-muted">View your assigned projects and tasks.</p>
                    </motion.div>

                    {loading && <Spinner animation="border" />}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <div className="mt-4">
                        <h4>Your Projects</h4>
                        {projects.length === 0 ? (
                            <p className="text-muted">No projects assigned to you.</p>
                        ) : (
                            <ListGroup>
                                {projects.map((project) => (
                                    <ListGroup.Item key={project.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{project.name}</strong>
                                            <p className="mb-0 text-muted">{project.description}</p>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>

                    <div className="mt-4">
                        <h4>Your Tasks</h4>
                        {tasks.length === 0 ? (
                            <p className="text-muted">No tasks assigned to you.</p>
                        ) : (
                            <ListGroup>
                                {tasks.map((task) => (
                                    <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{task.title}</strong>
                                            <p className="mb-0 text-muted">{task.description}</p>
                                        </div>
                                        <span className="badge bg-info">{task.status}</span>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default TeamMemberDashboard;
