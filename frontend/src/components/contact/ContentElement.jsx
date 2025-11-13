import React from 'react';

const ContentElement = ({ contact, onClick, isActive }) => {
    const contactUser = contact.contactUser || {};
    const lastMessage = contact.lastMessage.content || '';

    return (
        <div
            className={`p-4 w-full flex gap-2 items-center relative  
                  border-y border-muted cursor-pointer transition-colors
                  ${isActive ? 'bg-emerald-500/20' : 'hover:bg-emerald-500/10'}`}
            onClick={() => onClick(contact)}
        >
            <div className="border size-12 rounded-xl flex-shrink-0 relative non-selectable-text">
                <img
                    src={contactUser.profilePic || '/images/user.jpg'}
                    className="size-12 rounded-xl object-cover"
                    draggable={false}
                    alt={contactUser.name || 'User'}
                />
                <div className="size-2 rounded-full absolute bg-green-500 right-0 -bottom-0.5"></div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-evenly overflow-hidden non-selectable-text">
                <h4 className="font-medium text-[16px] truncate">
                    {contactUser.firstName + " " + contactUser.lastName || 'Unknown User'}
                </h4>
                <p className="text-sm opacity-80 text-[12px] w-[90%] truncate">
                    {lastMessage || 'No messages yet'}
                </p>
            </div>

            <div className="absolute text-[11px] right-4 opacity-70 top-4">
                <div>
                    {new Date(contact.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
                <div>
                    {
                        contact.lastMessage && !contact.lastMessage.read
                            ? <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">New</span>
                            : null
                    }
                </div>

            </div>
        </div>
    );
};

export default ContentElement;
