import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

export const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    const existing = await Application.findOne({ job: jobId, applicant: req.user.userID });
    if (existing) return res.status(400).json({ message: "Already applied" });
    const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : undefined;
    const application = await Application.create({
      job: jobId,
      applicant: req.user.userID,
      resume: resumePath,
      coverLetter: req.body.coverLetter,
    });
    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getApplicationsForEmployer = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.userID }).select("_id");
    const jobIds = jobs.map(j => j._id);
    const apps = await Application.find({ job: { $in: jobIds } }).populate("applicant job", "name email profilePicture resume bio location skills experience education");
    res.json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate("job");
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (String(app.job.employer) !== req.user.userID) return res.status(403).json({ message: "Not authorized" });
    const { status, notes } = req.body;
    if (status) app.status = status;
    if (notes) app.notes = notes;
    await app.save();
    res.json(app);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    console.log("Getting application by ID:", req.params.id);
    console.log("User ID:", req.user.userID);
    const app = await Application.findById(req.params.id).populate("applicant job", "name email profilePicture bio location skills title location salary company employer");
    console.log("Found application:", app);
    if (!app) {
      console.log("Application not found");
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user is authorized to view this application
    const userId = req.user.userID;
    console.log("Job employer:", app.job?.employer);
    console.log("Applicant ID:", app.applicant?._id);
    const isEmployer = String(app.job.employer) === userId;
    const isApplicant = String(app.applicant._id) === userId;
    console.log("Is employer:", isEmployer, "Is applicant:", isApplicant);

    if (!isEmployer && !isApplicant) {
      console.log("Not authorized");
      return res.status(403).json({ message: "Not authorized" });
    }

    console.log("Returning application data");
    res.json(app);
  } catch (error) {
    console.error("Error in getApplicationById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getApplicationsForJobSeeker = async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user.userID }).populate("job", "title location salary company");
    // Filter out applications where the job no longer exists (was deleted)
    const validApps = apps.filter(app => app.job !== null);

    // Clean up any orphaned applications (applications with null job references)
    const orphanedApps = apps.filter(app => app.job === null);
    if (orphanedApps.length > 0) {
      const orphanedIds = orphanedApps.map(app => app._id);
      await Application.deleteMany({ _id: { $in: orphanedIds } });
      console.log(`Cleaned up ${orphanedApps.length} orphaned applications`);
    }

    res.json(validApps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
