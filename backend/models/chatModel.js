import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  name: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "ai"], required: true },
      searchInfo: {
        stages: [String],
        query: String,
        urls: [String],
        internalQuery: String,
        internalUrls: [String],
        ragQuery: String,
        ragContext: String,
        error: String
      },
      content: { type: String, required: true },
      messageid: { type: Number }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
