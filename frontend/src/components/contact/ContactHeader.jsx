import React from "react";

const ContactHeader = ({ contact, isOnline }) => {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
      <img
        src={contact.profilePic || "/default-avatar.png"}
        alt={contact.firstName}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div>
        <h2 className="text-sm font-semibold">{contact.firstName}</h2>
        <span
          className={`text-xs ${
            isOnline ? "text-green-500" : "text-gray-400"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
};

export default ContactHeader;
