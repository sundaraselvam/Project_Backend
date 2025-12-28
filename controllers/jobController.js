import Job from "../models/Job.js";
import Company from "../models/Company.js";
import Application from "../models/Application.js";

export const createJob = async (req, res) => {
  try {
    console.log('createJob called, req.user:', req.user);
    const { title, description, requirements, location, salary, skills, companyId } = req.body;
    console.log('Request body:', { title, description, location, salary });
    if (!req.user) {
      console.log('No user in request');
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.role !== "employer") {
      console.log('User role:', req.user.role, 'expected: employer');
      return res.status(403).json({ message: "Only employers can post jobs" });
    }
    const job = await Job.create({
      title,
      description,
      requirements: requirements || [],
      location,
      salary,
      skills: skills || [],
      employer: req.user.userID,
      company: companyId,
    });
    if (companyId) {
      await Company.findByIdAndUpdate(companyId, { $set: {} });
    }
    res.status(201).json(job);
  } catch (error) {
    console.error("createJob error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const listJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("company employer", "name email");
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const recommendJobs = async (req, res) => {
  try {
    const { skills, location } = req.query;
    const filter = {};
    if (location) filter.location = { $regex: location, $options: "i" };
    if (skills) {
      const skillsArr = skills.split(",").map(s => s.trim());
      filter.skills = { $in: skillsArr };
    }
    const jobs = await Job.find(filter).limit(50);
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("company employer");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (String(job.employer) !== req.user.userID) return res.status(403).json({ message: "Not authorized" });
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    console.log("Delete job request:", req.params.id);
    console.log("User:", req.user);
    const job = await Job.findById(req.params.id);
    if (!job) {
      console.log("Job not found");
      return res.status(404).json({ message: "Job not found" });
    }
    console.log("Job employer:", job.employer, "User ID:", req.user.userID);
    if (String(job.employer) !== req.user.userID) {
      console.log("Not authorized");
      return res.status(403).json({ message: "Not authorized" });
    }
    // Delete all applications for this job
    await Application.deleteMany({ job: req.params.id });
    await Job.deleteOne({ _id: req.params.id });
    console.log("Job and associated applications deleted successfully");
    res.json({ message: "Job removed" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
