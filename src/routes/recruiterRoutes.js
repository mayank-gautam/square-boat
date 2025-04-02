const express = require("express");
const {
  postJob,
  getApplicants,
} = require("../controllers/recruiterController");
const { authenticateUser, authorizeRecruiter } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/jobs", authenticateUser, authorizeRecruiter, postJob);
router.get("/jobs/:jobId/applicants", authenticateUser, authorizeRecruiter, getApplicants);

module.exports = router;
