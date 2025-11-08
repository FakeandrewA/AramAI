import Contact from "../models/contactModel.js";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

const createContact = asyncHandler(async (req, res) => {
  const { user1, user2 } = req.body;
    if (!user1 || !user2) {
        res.status(400);
        throw new Error("Please provide both user IDs");
    }   
    const existingContact = await Contact.findOne({
        $or: [
            { user1: mongoose.Types.ObjectId(user1), user2: mongoose.Types.ObjectId(user2) },
            { user1: mongoose.Types.ObjectId(user2), user2: mongoose.Types.ObjectId(user1) },
        ]
    });
    if (existingContact) {
        return res.status(200).json(existingContact);
    }
    const contact = await Contact.create({
        user1: mongoose.Types.ObjectId(user1),
        user2: mongoose.Types.ObjectId(user2),
    });
    if (contact) {
        res.status(201).json(contact);
    } else {
        res.status(400);
        throw new Error("Failed to create contact");
    }
});
const getContacts = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        res.status(400);
        throw new Error("User ID is required");
    }
    const contacts = await Contact.find({
        $or: [
            { user1: mongoose.Types.ObjectId(userId) },
            { user2: mongoose.Types.ObjectId(userId) },
        ]
    }).populate('lastMessage').populate('user1', 'name email').populate('user2', 'name email');
    res.status(200).json(contacts);
});
const deleteContact = asyncHandler(async (req, res) => {
    const { contactId } = req.params;
    if (!contactId) {
        res.status(400);
        throw new Error("Contact ID is required");
    }
    const contact = await Contact.findByIdAndDelete(contactId);
    if (contact) {
        res.status(200).json({ message: "Contact deleted successfully" });
    }
    else {
        res.status(404);
        throw new Error("Contact not found");
    }
});

const updateLastMessage = asyncHandler(async (req, res) => {
    const { contactId } = req.params;
    const { messageId } = req.body;
    if (!contactId || !messageId) {
        res.status(400);
        throw new Error("Contact ID and Message ID are required");
    }
    const contact = await Contact.findById(contactId);
    if (contact) {
        contact.lastMessage = mongoose.Types.ObjectId(messageId);
        const updatedContact = await contact.save();
        res.status(200).json(updatedContact);
    } else {
        res.status(404);
        throw new Error("Contact not found");
    }
});

export { createContact, getContacts, deleteContact, updateLastMessage };