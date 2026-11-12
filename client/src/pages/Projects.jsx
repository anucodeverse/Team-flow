
import { useEffect, useState } from "react";
import axios from "axios";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/projects",
        { headers }
      );

      setProjects(response.data.projects || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.post(
        "http://localhost:5000/api/projects",
        {
          title,
          description,
          priority,
          dueDate: dueDate || null,
        },
        { headers }
      );

      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
      setMessage("Project created successfully!");

      await fetchProjects();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create project."
      );
    }
  };

  if (loading) return <h2>Loading projects...</h2>;

  return (
    <div className="tasks-page">
      <h1>Project Management</h1>
      <p>Create and manage your projects.</p>

      {error && <p className="task-error">{error}</p>}
      {message && <p className="project-success">{message}</p>}

      <div className="tasks-layout">
        <form className="task-form" onSubmit={handleCreateProject}>
          <h2>Create New Project</h2>

          <input
            type="text"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button type="submit">Create Project</button>
        </form>

        <div className="task-list">
          <h2>Your Projects ({projects.length})</h2>

          {projects.length === 0 ? (
            <p>No projects available yet.</p>
          ) : (
            projects.map((item) => (
              <div className="task-item" key={item._id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p>Priority: {item.priority}</p>
                  <p>Status: {item.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Projects;
