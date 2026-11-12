
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/user");

// ==================================
// 1. Create Task
// ==================================
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required.",
      });
    }

    if (!project || !mongoose.isValidObjectId(project)) {
      return res.status(400).json({
        success: false,
        message: "Valid project ID is required.",
      });
    }

    const projectExists = await Project.findOne({
      _id: project,
      owner: req.user._id,
    });

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    if (assignedTo) {
      if (!mongoose.isValidObjectId(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assigned user ID.",
        });
      }

      const userExists = await User.findById(assignedTo);

      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found.",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      assignedBy: req.user._id,
      status,
      priority,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(
      error.name === "ValidationError" || error.name === "CastError"
        ? 400
        : 500
    ).json({
      success: false,
      message: error.message || "Failed to create task.",
    });
  }
};

// ==================================
// 2. Get All Project Tasks
// ==================================
const getTasks = async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.user._id,
    }).select("_id");

    const projectIds = projects.map((project) => project._id);

    const tasks = await Task.find({
      project: { $in: projectIds },
    })
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks.",
    });
  }
};

// ==================================
// 3. Get Single Task
// ==================================
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findById(id)
      .populate("project", "title owner")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");

    if (!task || !task.project.owner.equals(req.user._id)) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch task.",
    });
  }
};

// ==================================
// 4. Update Task
// ==================================
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const projectExists = await Project.findOne({
      _id: task.project,
      owner: req.user._id,
    });

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Task not found or access denied.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.assignedTo !== undefined) {
      if (req.body.assignedTo === null || req.body.assignedTo === "") {
        updateData.assignedTo = null;
      } else {
        if (!mongoose.isValidObjectId(req.body.assignedTo)) {
          return res.status(400).json({
            success: false,
            message: "Invalid assigned user ID.",
          });
        }

        const userExists = await User.findById(req.body.assignedTo);

        if (!userExists) {
          return res.status(404).json({
            success: false,
            message: "Assigned user not found.",
          });
        }

        updateData.assignedTo = req.body.assignedTo;
      }
    }

    if (req.body.project !== undefined) {
      if (!mongoose.isValidObjectId(req.body.project)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      const newProject = await Project.findOne({
        _id: req.body.project,
        owner: req.user._id,
      });

      if (!newProject) {
        return res.status(404).json({
          success: false,
          message: "Project not found or access denied.",
        });
      }

      updateData.project = req.body.project;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide fields to update.",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(
      error.name === "ValidationError" || error.name === "CastError"
        ? 400
        : 500
    ).json({
      success: false,
      message: error.message || "Failed to update task.",
    });
  }
};

// ==================================
// 5. Update Task Status
// ==================================
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    if (!["Todo", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status.",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const projectExists = await Project.findOne({
      _id: task.project,
      owner: req.user._id,
    });

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Task not found or access denied.",
      });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
      task,
    });
  } catch (error) {
    console.error("Update task status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task status.",
    });
  }
};

// ==================================
// 6. Delete Task
// ==================================
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const projectExists = await Project.findOne({
      _id: task.project,
      owner: req.user._id,
    });

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Task not found or access denied.",
      });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete task.",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
