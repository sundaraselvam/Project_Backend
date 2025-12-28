import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["jobseeker", "employer"], required: true },
    bio: { type: String },
    experience: [{ company: String, title: String, from: Date, to: Date, description: String }],
    education: [{ school: String, degree: String, from: Date, to: Date }],
    skills: [{ type: String }],
    location: { type: String },
    profilePicture: { type: String },
    resume: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;