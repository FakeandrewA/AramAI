import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerUser = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        const { firstName, lastName, email, password, mobile, age, role, latitude, longitude } = req.body;
        const profilePicUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null;

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ email: 'Email already exists' });
        }
        existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ mobile: 'Mobile no already used' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        if (role === "user") {
            const newUser = new User({
                firstName,
                lastName,
                mobile,
                age,
                profilePic: profilePicUrl,
                email,
                password: hashedPassword,
                role,
                chats: [],
                location: {
                    type: "Point",
                    coordinates: longitude && latitude ? [parseFloat(longitude), parseFloat(latitude)] : [0, 0]
                }
            });
            await newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
            console.log("New user created:", newUser);
        } else {
            const newUser = new User({
                firstName,
                lastName,
                mobile,
                age,
                profilePic: profilePicUrl,
                email,
                password: hashedPassword,
                role,
                chats: [],
                field: [],
                description: "",
                experience: 0,
                rating: {
                    count: 0,
                    reviews: [],   // match schema field
                },
                location: {
                    type: "Point",
                    coordinates: longitude && latitude ? [parseFloat(longitude), parseFloat(latitude)] : [0, 0]
                }
            });
            await newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
            console.log("New user created:", newUser);
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: `Server error` });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password Incorrect' });
        }
        // Create JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );
        let safeUser = await User.findById(user._id).select('-password')
            .populate({
                path: "chats",
                options: { sort: { createdAt: -1 } }, // sorted
            });
        const obj = safeUser.toObject();
        const chats = obj.chats.map(chat => ({
            _id: chat._id,
            name: chat.name,
            createdAt: chat.createdAt,
        }));


        res.status(200).json({ token, user: { ...obj, chats: chats } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password')
            .populate({
                path: "chats",
                options: { sort: { createdAt: -1 } } // sort newest → oldest
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const obj = user.toObject();
        const chats = (obj.chats || []).map((chat) => ({
            _id: chat._id,
            name: chat.name,
            createdAt: chat.createdAt,
        }));
        res.status(200).json({ ...obj, chats: chats });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUserProfile = async (req, res) => {
  try {
    let updates = { ...req.body };
    const file = req.file;

    // Parse JSON fields if they exist
    if (updates.field) {
      try {
        updates.field = JSON.parse(updates.field);
      } catch {
        updates.field = [];
      }
    }

    if (updates.location) {
      try {
        updates.location = JSON.parse(updates.location);
      } catch {
        updates.location = undefined;
      }
    }

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle profilePic
    let profilePicUrl = user.profilePic;
    if (file) {
      // Delete old file if exists
      if (user.profilePic && !user.profilePic.includes("gravatar")) {
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          path.basename(user.profilePic)
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      profilePicUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { ...updates, profilePic: profilePicUrl },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const findLawyers = async (req, res) => {
  try {
    const { field, q, longitude, latitude, maxDistance } = req.body;

    let filters = [{ role: "lawyer" }];

    if (q) {
      filters.push({
        $or: [
          { firstName: { $regex: q, $options: "i" } },
          { lastName: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { field: { $regex: q, $options: "i" } },
        ],
      });
    }

    if (field && field.length > 0) {
      const fields = Array.isArray(field) ? field : field.split(",");
      filters.push({ field: { $in: fields } });
    }

    const query = filters.length > 1 ? { $and: filters } : filters[0];

    let lawyers;
    if (longitude && latitude) {
      lawyers = await User.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            $maxDistance: parseInt(maxDistance) || 5000,
          },
        },
      }).select("-password -chats");
    } else {
      lawyers = await User.find(query).select("-password -chats");
    }

    res.json(lawyers);
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    res.status(500).json({ message: "Server error" });
  }
};


