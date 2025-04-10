import React, { useEffect, useState } from "react";
import axios from "axios";

const ProjectList = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        axios.get("/api/projects", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
            .then(response => setProjects(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h2>My Projects</h2>
            <ul>
                {projects.map(project => (
                    <li key={project.id}>
                        {project.name} - {project.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProjectList;
