import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Inventory from "../models/Inventory.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Purchase from "../models/Purchase.js";
import StockTransaction from "../models/StockTransaction.js";
import Supplier from "../models/Supplier.js";
import User from "../models/User.js";

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidPhone(phoneNormalized) {
  return /^\d{10,15}$/.test(phoneNormalized);
}

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    company: user.company,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
  };
}

export async function registerUser(req, res, next) {
  try {
    const { name, email, company, phone, password } = req.body;

    if (!name || !email || !company || !password) {
      return res.status(400).json({ message: "Name, email, company, and password are required" });
    }

    if (phone) {
      const phoneNormalized = normalizePhone(phone);
      if (!isValidPhone(phoneNormalized)) {
        return res.status(400).json({ message: "Phone number must contain 10 to 15 digits" });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      company,
      phone: phone || undefined,
      password: hashed,
      role: "admin"
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: userPayload(user)
    });
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: userPayload(user)
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    let resetUrl;

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
      resetUrl = `${frontendBase}/reset-password/${resetToken}`;

      console.log(`Password reset link for ${user.email}: ${resetUrl}`);
    }

    const requestOrigin = String(req.get("origin") || "");
    const isLocalRequest =
      requestOrigin.includes("localhost") ||
      requestOrigin.includes("127.0.0.1");
    const includeResetUrl =
      process.env.RETURN_RESET_URL === "true" ||
      (isLocalRequest && String(req.query.includeResetUrl || "").toLowerCase() === "true");

    res.json({
      message: "If this email exists, a reset link has been generated.",
      resetLinkPreviewEnabled: includeResetUrl,
      ...(includeResetUrl ? { resetUrl } : {})
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
}

export async function recoverPasswordByIdentity(req, res, next) {
  try {
    const { email, name, company, password, confirmPassword } = req.body;

    if (!email || !name || !company || !password || !confirmPassword) {
      return res.status(400).json({ message: "Email, name, company, password, and confirm password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();
    const normalizedCompany = company.trim();

    const user = await User.findOne({
      email: normalizedEmail,
      name: normalizedName,
      company: normalizedCompany
    });

    if (!user) {
      return res.status(404).json({ message: "No account matched the provided details" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("_id name email company phone role createdAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: userPayload(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email, company, phone, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existing) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }

    if (name) {
      user.name = name;
    }

    if (company) {
      user.company = company;
    }

    if (phone) {
      const nextPhoneNormalized = normalizePhone(phone);
      if (!isValidPhone(nextPhoneNormalized)) {
        return res.status(400).json({ message: "Phone number must contain 10 to 15 digits" });
      }
      user.phone = phone;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: "Profile updated successfully",
      token,
      user: userPayload(user)
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    const userId = user._id;

    await Promise.all([
      Inventory.deleteMany({ userId }),
      Order.deleteMany({ userId }),
      Product.deleteMany({ userId }),
      Purchase.deleteMany({ userId }),
      StockTransaction.deleteMany({ userId }),
      Supplier.deleteMany({ userId }),
      User.deleteOne({ _id: userId })
    ]);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
}
