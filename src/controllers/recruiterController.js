const pool = require("../config/db");
const postJob = async (req, res) => {
  try {
    const { title, description } = req.body;
    const recruiterId = req.user.id;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can post jobs" });
    }

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO jobs (title, description, recruiter_id) VALUES (?, ?, ?)",
      [title, description, recruiterId]
    );

    res.status(201).json({ message: "Job posted successfully", jobId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user.id;

    const [job] = await pool.query("SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?", [jobId, recruiterId]);
    if (job.length === 0) {
      return res.status(404).json({ message: "Job not found or unauthorized access" });
    }

    const [applicants] = await pool.query(
      `SELECT users.id, users.name, users.email FROM applications
       JOIN users ON applications.candidate_id = users.id
       WHERE applications.job_id = ?`,
      [jobId]
    );

    res.status(200).json(applicants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { postJob, getApplicants, logout };
