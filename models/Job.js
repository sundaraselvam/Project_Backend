import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  requirements: [{ type: String }],
  location: { type: String },
  salary: { type: String },
  skills: [{ type: String }],
  employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  published: { type: Boolean, default: true },
}, { timestamps: true });

const Job = mongoose.model("Job", JobSchema);
export default Job;
