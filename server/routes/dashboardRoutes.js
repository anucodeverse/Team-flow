
const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

const router = express.Router();

// Dashboard requires authentication
router.use(protect);

// Get dashboard statistics
router.get("/", getDashboardStats);

module.exports = router;
