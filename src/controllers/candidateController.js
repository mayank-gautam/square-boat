const pool = require("../config/db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

const getJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query("SELECT * FROM jobs");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const [job] = await pool.query("SELECT * FROM jobs WHERE id = ?", [jobId]);

    if (job.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user.id;

    const [existingApplication] = await pool.query(
      "SELECT * FROM applications WHERE job_id = ? AND candidate_id = ?",
      [jobId, candidateId]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    await pool.query("INSERT INTO applications (job_id, candidate_id) VALUES (?, ?)", [jobId, candidateId]);

    const [jobDetails] = await pool.query(
      "SELECT jobs.title, users.email AS recruiter_email FROM jobs INNER JOIN users ON jobs.recruiter_id = users.id WHERE jobs.id = ?",
      [jobId]
    );

    if (jobDetails.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    const job = jobDetails[0];
    const [candidateDetails] = await pool.query("SELECT email FROM users WHERE id = ?", [candidateId]);

    if (candidateDetails.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidateEmail = candidateDetails[0].email;
    const recruiterEmail = job.recruiter_email;

    await sendEmail(candidateEmail, "Job Application Submitted", `You applied for: ${job.title}`);
    await sendEmail(recruiterEmail, "New Job Application", `A candidate applied for: ${job.title}`);

    res.status(201).json({ message: "Job application submitted and emails sent." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAppliedJobs = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const [applications] = await pool.query(
      "SELECT jobs.* FROM jobs INNER JOIN applications ON jobs.id = applications.job_id WHERE applications.candidate_id = ?",
      [candidateId]
    );

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getJobs, getJobById, applyJob, getAppliedJobs };