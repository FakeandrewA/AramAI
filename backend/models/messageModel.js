import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'contact',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    content: {
      type: String,
      default: "", 
    },
    read: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    fileUrl: [
      {
        type: String,
      }
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
