import { protect } from "../middlewares/authmiddleware.js";
import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile
} from "../controllers/userController.js";

import upload from '../multer.js';

const router = express.Router();


router.post('/register', upload.single("profilePic"), registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

export default router;