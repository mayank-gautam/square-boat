const express = require("express");
const { getJobs, getJobById, applyJob, getAppliedJobs } = require("../controllers/candidateController");
const { authenticateUser, authorizeCandidate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/jobs", authenticateUser, authorizeCandidate, getJobs);
router.get("/jobs/:jobId", authenticateUser, authorizeCandidate, getJobById);
router.post("/apply/:jobId", authenticateUser, authorizeCandidate, applyJob);
router.get("/applied-jobs", authenticateUser, authorizeCandidate, getAppliedJobs);

module.exports = router;
