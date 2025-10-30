import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
      }
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    }
  },
  { timestamps: true }
);

const Contact = mongoose.model("contact", contactSchema);
export default Contact;
