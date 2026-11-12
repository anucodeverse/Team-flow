 
import { useEffect, useState } from "react";
import axios from "axios";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchData = async () => {
    try {
      const [taskResponse, projectResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/tasks", { headers }),
        axios.get("http://localhost:5000/api/projects", { headers }),
      ]);

      setTasks(taskResponse.data.tasks || []);
      setProjects(projectResponse.data.projects || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load tasks and projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/tasks",
        {
          title,
          description,
          project,
          priority,
          dueDate: dueDate || null,
        },
        { headers }
      );

      setTitle("");
      setDescription("");
      setProject("");
      setPriority("Medium");
      setDueDate("");

      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create task.");
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}/status`,
        { status },
        { headers }
      );

      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update task status.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers,
      });

      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete task.");
    }
  };

  if (loading) return <h2>Loading tasks...</h2>;

  return (
    <div className="tasks-page">
      <h1>Task Management</h1>
      <p>Create and manage your project tasks.</p>

      {error && <p className="task-error">{error}</p>}

      <div className="tasks-layout">
        <form className="task-form" onSubmit={handleCreateTask}>
          <h2>Create New Task</h2>

          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            required
          >
            <option value="">Select Project</option>
            {projects.map((item) => (
              <option key={item._id} value={item._id}>
                {item.title}
              </option>
            ))}
          </select>

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

          <button type="submit" disabled={projects.length === 0}>
            Create Task
          </button>

          {projects.length === 0 && (
            <p>Create a project first before adding tasks.</p>
          )}
        </form>

        <div className="task-list">
          <h2>Your Tasks ({tasks.length})</h2>

          {tasks.length === 0 ? (
            <p>No tasks available yet.</p>
          ) : (
            tasks.map((task) => (
              <div className="task-item" key={task._id}>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p>Project: {task.project?.title || "Project"}</p>
                  <p>Priority: {task.priority}</p>
                  <p>Status: {task.status}</p>
                </div>

                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task._id, e.target.value)
                  }
                >
                  <option value="Todo">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Tasks;
