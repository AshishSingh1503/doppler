import React from 'react';
import './ProjectList.css';

function ProjectList({ projects, onSelect, selectedId }) {
  return (
    <div className="project-list">
      <h3>Your Projects</h3>
      {projects.length === 0 ? (
        <p className="no-projects">No projects yet</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li
              key={project.id}
              className={selectedId === project.id ? 'active' : ''}
              onClick={() => onSelect(project)}
            >
              <div className="project-name">{project.name}</div>
              <div className="project-id">{project.projectId}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectList;
