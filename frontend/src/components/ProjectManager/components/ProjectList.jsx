import React, { useEffect, useState } from "react";
import { Container, Row, Col, ListGroup, Alert, Spinner, Card, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './ProjectList.css'; // Ensure to import your CSS file

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found.");
          return;
        }
        const response = await axios.get("http://localhost:8000/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data.projects);
      } catch (err) {
        setError("Failed to fetch projects.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handler para i-set ang active project
  const handleProjectClick = (projectId) => {
    setActiveProjectId(prevId => (prevId === projectId ? null : projectId));
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar">
        <h4>Projects</h4>
        <Nav className="flex-column">
          <Nav.Link onClick={() => navigate("/dashboard")}>Dashboard</Nav.Link>
          <Nav.Link onClick={() => navigate("/project-list")}>Project List</Nav.Link>
          <Nav.Link onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}>Logout</Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 project-list-content">
        <Container>
          <Row>
            <Col>
              <h2>My Projects</h2>
              {loading && <Spinner animation="border" />}
              {error && <Alert variant="danger">{error}</Alert>}
              {projects.length > 0 && (
                <ListGroup variant="flush">
                  {projects.map((project) => (
                    <ListGroup.Item 
                      key={project.id} 
                      className={`project-item ${activeProjectId === project.id ? "active" : ""}`}
                      onClick={() => handleProjectClick(project.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <Card className="shadow-sm mb-3">
                        <Card.Body>
                          <Card.Title>{project.name}</Card.Title>
                          <Card.Text>{project.description}</Card.Text>
                          {activeProjectId === project.id && (
                            <div className="project-details">
                              {/* Maaari mong idagdag pa ang karagdagang detalye ng project dito */}
                              <small>Project ID: {project.id}</small>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              {projects.length === 0 && !loading && (
                <p className="text-muted">No projects available. Create one now!</p>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default ProjectList;
