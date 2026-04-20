
import bcrypt from "bcryptjs";
import usermodel from "../models/usermodel.js";
import { getToken } from "../utils/token.js";


import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";


export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    let user = await usermodel.findOne({ email });

    if (!user) {
      user = await usermodel.create({ name, email });
    }

    let token = await getToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ message: `googleSignup Error ${error}` });
  }
};



export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await usermodel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await usermodel.create({
      name,
      email,
      password: hashedPassword,
      credits: 300,
      isCreditAvailable: true
    });

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ message: "Auth failed" });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usermodel.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    let token = await getToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ message: "Auth failed" });
  }
};



export const logout = async (req, res) => {
  try {
    await res.clearCookie("token");
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout Error ${error}` });
  }
};



export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await usermodel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "OTP for Password Reset",
      html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`,
    });

    res.json({ message: "OTP sent" });

  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};



export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await usermodel.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.otpVerified = true;
    await user.save();

    res.json({ message: "OTP verified" });

  } catch {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};



export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await usermodel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otpVerified) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    
    user.otp = null;
    user.otpExpiry = null;
    user.otpVerified = false;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch {
    res.status(500).json({ message: "Error resetting password" });
  }
};



export const getCurrentUser = async (req, res) => {
  try {
    const user = await usermodel
      .findById(req.userId)
      .select("-password");

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};
