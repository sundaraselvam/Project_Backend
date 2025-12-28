import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendResetEmail } from "../utils/mail.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_later";

export const register = async(req, res) => {
    try {
        const {email, password, role} = req.body;
        if(!email || !password || !role){
            return res.status(400).json({ message: "Email, password, role required" });
        }
        const existiing = await User.findOne({email});
        if(existiing){
            return res.status(409).json({ message: "Email already in use" });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: passwordHash,
            role
        });
        const token = jwt.sign({
            userID: user._id,
            role: user.role
        }, JWT_SECRET, {
            expiresIn: "1h"
        })
        res.status(201).json({
            message: "User registered",
            user: { id: user._id, email: user.email, role: user.role },
            token,
        })
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const login = async (req, res) => {
    try {
        const {email, password, role} = req.body;
        if(!email || !password){
            return res.status(400).json({ message: "Email and password required" });
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({
            userID: user._id,
            role: user.role
        }, JWT_SECRET, {
            expiresIn: "1h"
        })
        res.json({
            message: "Logged In",
            user: { id: user._id, email: user.email, role: user.role },
            token,
        })
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const requestPasswordReset = async (req, res) => {
    console.log('Forgot password request received for email:', req.body.email);
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(200).json({ message: "If that email exists, a reset link has been sent" });
        }
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 1000 * 60 * 60;
        await user.save();
        await sendResetEmail(email, token);
        return res.json({ message: 'Password Reset', token });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userID);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ message: 'Current password incorrect' });
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password changed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userID);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const fields = ['name','bio','location','skills','experience','education'];
        fields.forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
        await user.save();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const user = await User.findById(req.user.userID);
        user.profilePicture = `/uploads/images/${req.file.filename}`;
        await user.save();
        res.json({ message: 'Profile picture uploaded', path: user.profilePicture });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userID).select('-password -resetPasswordToken -resetPasswordExpires');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export default { register, login };
