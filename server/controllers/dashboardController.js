
const Project = require("../models/Project");
const Task = require("../models/Task");

// Get Dashboard Statistics and Analytics
const getDashboardStats = async (req, res) => {
  try {
    // Get projects owned by the logged-in user
    const projects = await Project.find({
      owner: req.user._id,
    }).select("_id");

    const projectIds = projects.map((project) => project._id);

    // Get tasks belonging to those projects
    const tasks = await Task.find({
      project: { $in: projectIds },
    });

    const totalProjects = projects.length;
    const totalTasks = tasks.length;

    // Task status statistics
    const completedTasks = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    const todoTasks = tasks.filter(
      (task) => task.status === "Todo"
    ).length;

    // Task priority statistics
    const highPriorityTasks = tasks.filter(
      (task) => task.priority === "High"
    ).length;

    const mediumPriorityTasks = tasks.filter(
      (task) => task.priority === "Medium"
    ).length;

    const lowPriorityTasks = tasks.filter(
      (task) => task.priority === "Low"
    ).length;

    // Overdue tasks (excluding completed tasks)
    const overdueTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "Completed"
    ).length;

    // Calculate completion percentage
    const completionPercentage =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    return res.status(200).json({
      success: true,
      dashboard: {
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        completionPercentage,
        statusAnalytics: {
          Todo: todoTasks,
          InProgress: inProgressTasks,
          Completed: completedTasks,
        },
        priorityAnalytics: {
          High: highPriorityTasks,
          Medium: mediumPriorityTasks,
          Low: lowPriorityTasks,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics.",
    });
  }
};

module.exports = { getDashboardStats };
