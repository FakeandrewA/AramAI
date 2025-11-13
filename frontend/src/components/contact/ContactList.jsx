import React, { useEffect, useState } from 'react';
import ContentElement from './ContentElement';
import { Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const ContactList = () => {
    const { getContacts, authUser, currentContact, setCurrentContact, contacts } = useAuthStore();
    const [searchUser, setSearchUser] = useState('');

    const onContactClick = (contact) => {
        setCurrentContact(contact);
    };

    // ✔ Fetch contacts ONLY when authUser changes (no infinite loop)
    useEffect(() => {
        const fetchContacts = async () => {
            await getContacts(authUser._id);
        };
        if (authUser?._id) fetchContacts();
    }, [authUser, contacts]);

    const filteredContacts = searchUser.trim()
        ? contacts.filter((c) =>
            c.username?.toLowerCase().includes(searchUser.toLowerCase())
        )
        : contacts;

    return (
        <div className="w-full h-full flex flex-col border-r-1 border-muted rounded-none md:rounded-lg">

            {/* Header */}
            <div className="py-6 border-b-1 border-muted rounded-t-lg flex flex-col justify-center px-4 gap-4">
                <h1 className="font-heading font-bold text-xl tracking-tight opacity-80">
                    Aram AI
                </h1>

                <div className="dark:bg-foreground/4 bg-foreground/2 text-sm flex gap-2 p-2 rounded-lg items-center">
                    <Search className="size-4" />
                    <input
                        type="text"
                        className="w-full outline-0 bg-transparent"
                        placeholder="Search..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                    />
                </div>
            </div>

            {/* Contact List */}
            <div className="flex flex-col overflow-auto flex-1 non-selectable-text">
                {filteredContacts.length === 0 ? (
                    <p className="text-center text-sm opacity-70 py-4">
                        No contacts found
                    </p>
                ) : (
                    filteredContacts.map((contact) => (
                        <ContentElement
                            key={contact._id}
                            contact={contact}
                            onClick={onContactClick}
                            isActive={currentContact?._id === contact._id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ContactList;
