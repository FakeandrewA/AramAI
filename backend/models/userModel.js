import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minlength: 2,
        maxlength: 30,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 100
    },
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
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

    //lawyer
    
});

export default mongoose.model('User', userSchema);