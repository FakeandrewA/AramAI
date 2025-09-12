import { protect } from "../middlewares/authmiddleware.js";
import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    findLawyers
} from "../controllers/userController.js";

import upload from '../multer.js';

const router = express.Router();


router.post('/register', upload.single("profilePic"), registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.patch('/updateProfile', protect,upload.single("profilePic"), updateUserProfile);
router.get('/lawyer/search', protect, findLawyers);

export default router;