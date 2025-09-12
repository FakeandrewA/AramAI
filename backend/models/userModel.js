import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, minlength: 2, maxlength: 30, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    mobile: { type: String, required: true, unique: true, trim: true },
    age: { type: Number, required: true, min: 18, max: 100 },
    profilePic: {
        type: String,
        trim: true,
        default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    },

    role: {
        type: String,
        enum: ['user', 'lawyer', 'admin'],
        default: 'user',
        required: true,
        trim: true
    },

    chats: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }
    ],

    // Lawyer-specific fields
    field: [{ type: String, maxlength: 50 }],
    description: { type: String, maxlength: 500 },
    experience: { type: Number },
    rating: {
        count: { type: Number, default: 0 },
        reviews: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                rate: { type: Number, min: 0, max: 5 },
                comment: { type: String, maxlength: 100 }
            }
        ]
    },

    // 📍 GeoJSON location
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: "2dsphere"
        }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ensure geospatial index
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
