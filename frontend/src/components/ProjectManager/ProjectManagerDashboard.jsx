import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav, Container, Button, Spinner, Alert, Modal, Form, Table, InputGroup, FormControl } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaPlus, FaList } from 'react-icons/fa';
import axios from 'axios';
import './ProjectManagerDashboard.css';

const ProjectManagerDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [projectData, setProjectData] = useState({ name: '', description: '', deadline: '' });
  const [taskData, setTaskData] = useState({ title: '', description: '', priority: 'Medium', due_date: '', assigned_to: '', project_id: '' });
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError('No authentication token found.');
          return;
        }
        const response = await axios.get('http://localhost:8000/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data.projects);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setError('Failed to fetch projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch team members for task assignment.
  const fetchTeamMembers = async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8000/api/users-for-task`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { project_id: projectId }
      });
      setTeamMembers(response.data);
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError("Failed to load team members.");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError('No authentication token found.');
        return;
      }
      const response = await axios.post(
        `http://localhost:8000/api/projects`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setProjects([...projects, response.data.project]);
      setShowModal(false);
      setProjectData({ name: '', description: '', deadline: '' });
    } catch (err) {
      console.error("Error creating project:", err);
      setError('Failed to create project.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError('No authentication token found.');
        return;
      }
      const response = await axios.post(
        `http://localhost:8000/api/projects/${taskData.project_id}/tasks`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      // Update tasks in the corresponding project.
      const updatedProjects = projects.map(project =>
        project.id === taskData.project_id
          ? { ...project, tasks: [...(project.tasks || []), response.data.task] }
          : project
      );
      setProjects(updatedProjects);
      setShowTaskModal(false);
      setTaskData({ title: '', description: '', priority: 'Medium', due_date: '', assigned_to: '', project_id: '' });
    } catch (err) {
      console.error("Error creating task:", err);
      setError('Failed to create task.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(projects.filter((project) => project.id !== id));
      } catch (err) {
        console.error(err.response?.data || err.message);
        setError('Failed to delete project. Please try again.');
      }
    }
  };

  // Filter projects based on filterText (checks title and description)
  const filteredProjects = projects.filter((project) => {
    const search = filterText.toLowerCase();
    return (
      project.name.toLowerCase().includes(search) ||
      project.description.toLowerCase().includes(search)
      // Add project.status if applicable
    );
  });

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-top">
          <h4 className="text-center">Project Manager Dashboard</h4>
          <Nav className="flex-column">
            <Nav.Link className="text-white" onClick={() => setShowModal(true)}>
              <FaPlus /> Create Project
            </Nav.Link>
            <Nav.Link className="text-white" onClick={() => navigate('/project-list')}>
              <FaList /> View Projects
            </Nav.Link>
          </Nav>
        </div>
        <div className="sidebar-bottom">
          <Nav className="flex-column">
            <Nav.Link className="text-white" onClick={() => { localStorage.removeItem("token"); navigate('/login'); }}>
              <FaSignOutAlt /> Logout
            </Nav.Link>
          </Nav>
        </div>
      </div>

      {/* Main Content with Greetings Navbar */}
      <div className="flex-grow-1 content-area">
        <div className="greetings-navbar">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="greeting-info"
          >
            <h2 className="navbar-title">Welcome, Project Manager!</h2>
            <p className="navbar-subtitle">Manage your projects efficiently.</p>
          </motion.div>
        </div>

        <Container className="mt-5">
          {/* Filter Section */}
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Filter projects by title or description..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </InputGroup>

          {loading && <Spinner animation="border" />}
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="mt-4">
            <h4>Project List</h4>
            {filteredProjects.length === 0 && !loading ? (
              <p className="text-muted">No projects available. Create one now!</p>
            ) : (
              <Table striped bordered hover responsive className="projects-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{project.description}</td>
                      <td>{project.status ? project.status : "Active"}</td>
                      <td className="text-end">
                        <Button variant="info" size="sm" onClick={() => navigate(`/projects/${project.id}`)} className="mx-1">
                          View
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteProject(project.id)} className="mx-1">
                          Delete
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            setTaskData({ ...taskData, project_id: project.id });
                            fetchTeamMembers(project.id);
                            setShowTaskModal(true);
                          }}
                          className="mx-1"
                        >
                          Add Task
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Container>

        {/* Create Project Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Project</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateProject}>
            <Modal.Body>
              <Form.Group controlId="formProjectName">
                <Form.Label>Project Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter project name" 
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formProjectDescription" className="mt-2">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter project description" 
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formProjectDeadline" className="mt-2">
                <Form.Label>Deadline</Form.Label>
                <Form.Control 
                  type="date" 
                  value={projectData.deadline}
                  onChange={(e) => setProjectData({ ...projectData, deadline: e.target.value })}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
              <Button variant="primary" type="submit">
                Create Project
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Create Task Modal */}
        <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Task</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateTask}>
            <Modal.Body>
              <Form.Group controlId="formTaskTitle">
                <Form.Label>Task Title</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter task title" 
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formTaskDescription" className="mt-2">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter task description" 
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formTaskPriority" className="mt-2">
                <Form.Label>Priority</Form.Label>
                <Form.Control as="select"
                  value={taskData.priority}
                  onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formTaskDueDate" className="mt-2">
                <Form.Label>Due Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={taskData.due_date}
                  onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formTaskAssignedTo" className="mt-2">
                <Form.Label>Assign To</Form.Label>
                <Form.Control as="select" 
                  value={taskData.assigned_to}
                  onChange={(e) => setTaskData({ ...taskData, assigned_to: e.target.value })}
                  required
                >
                  <option value="">Select Team Member</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowTaskModal(false)}>Close</Button>
              <Button variant="primary" type="submit">
                Create Task
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ProjectManagerDashboard;
