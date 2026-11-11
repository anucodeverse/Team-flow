
const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

// All project routes require authentication
router.use(protect);

// Create a new project
router.post("/", createProject);

// Get all projects belonging to the logged-in user
router.get("/", getProjects);

// Get one project by ID
router.get("/:id", getProjectById);

// Update a project
router.put("/:id", updateProject);

// Delete a project
router.delete("/:id", deleteProject);

module.exports = router;
