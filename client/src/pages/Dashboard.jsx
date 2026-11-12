 
import { useEffect, useState } from "react";
import axios from "axios";
import Tasks from "./Tasks";
import Projects from "./Projects";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  FolderKanban,
  ListTodo,
  CheckCircle,
  Clock,
} from "lucide-react";

function Dashboard({ user, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTasks, setShowTasks] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your dashboard.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDashboard(response.data.dashboard);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <h2>Loading dashboard...</h2>;
  if (error) return <h2>{error}</h2>;
  if (!dashboard) return <h2>No dashboard data available.</h2>;

  const statusData = [
    { name: "To Do", value: dashboard.statusAnalytics.Todo },
    { name: "In Progress", value: dashboard.statusAnalytics.InProgress },
    { name: "Completed", value: dashboard.statusAnalytics.Completed },
  ];

  const priorityData = [
    { name: "High", value: dashboard.priorityAnalytics.High },
    { name: "Medium", value: dashboard.priorityAnalytics.Medium },
    { name: "Low", value: dashboard.priorityAnalytics.Low },
  ];

  const cards = [
    {
      title: "Total Projects",
      value: dashboard.totalProjects,
      icon: <FolderKanban />,
    },
    {
      title: "Total Tasks",
      value: dashboard.totalTasks,
      icon: <ListTodo />,
    },
    {
      title: "Completed Tasks",
      value: dashboard.completedTasks,
      icon: <CheckCircle />,
    },
    {
      title: "In Progress",
      value: dashboard.inProgressTasks,
      icon: <Clock />,
    },
  ];

  return (
    <div className="dashboard">
      <h1>Team-flow Dashboard</h1>

      <p>
        Welcome{user?.name ? `, ${user.name}` : ""}! Here is your project overview.
      </p>

      <div className="dashboard-navigation">
        <button
          className="tasks-navigation"
          onClick={() => {
            setShowTasks(false);
            setShowProjects(false);
          }}
        >
          Dashboard
        </button>

        <button
          className="tasks-navigation"
          onClick={() => {
            setShowTasks(true);
            setShowProjects(false);
          }}
        >
          Manage Tasks
        </button>

        <button
          className="tasks-navigation"
          onClick={() => {
            setShowProjects(true);
            setShowTasks(false);
          }}
        >
          Manage Projects
        </button>

        <button
          className="tasks-navigation"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {showTasks ? (
        <Tasks />
      ) : showProjects ? (
        <Projects />
      ) : (
        <>
          <div className="dashboard-cards">
            {cards.map((card) => (
              <div className="dashboard-card" key={card.title}>
                <div>{card.icon}</div>
                <h3>{card.title}</h3>
                <h2>{card.value}</h2>
              </div>
            ))}
          </div>

          <div className="dashboard-summary">
            <h2>Task Completion</h2>
            <h1>{dashboard.completionPercentage}%</h1>
            <p>Overdue Tasks: {dashboard.overdueTasks}</p>
          </div>

          <div className="dashboard-charts">
            <div className="chart-card">
              <h2>Tasks by Status</h2>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={["#f59e0b", "#3b82f6", "#22c55e"][index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Tasks by Priority</h2>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
