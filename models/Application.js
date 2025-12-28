import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resume: { type: String },
  coverLetter: { type: String },
  status: { type: String, enum: ["applied", "reviewing", "interview", "offered", "rejected"], default: "applied" },
  notes: { type: String },
}, { timestamps: true });

const Application = mongoose.model("Application", ApplicationSchema);
export default Application;
