import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ must match your User model name exactly
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ must match your User model name exactly
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // ✅ must match your Message model name
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Capitalized for convention and clarity
const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
