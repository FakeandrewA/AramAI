import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "ai"], required: true },
      searchInfo: {
            stages: [String],
            query: String,
            urls: [String],
      },
      content: { type: String, required: true }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
