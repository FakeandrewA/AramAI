import React, { useState } from 'react'
import ContentElement from './ContentElement'
import { Search } from 'lucide-react'

const ContactList = () => {
    const [searchUser , setSearchUser] = useState("");
  return (
    <div className='w-full h-full flex flex-col  border-r-1 border-muted rounded-none md:rounded-lg'>
        <div className='py-6 border-b-1 border-muted  rounded-t-lg flex flex-col justify-center px-4 gap-4 '>
            <h1 className='font-heading font-bold text-xl  tracking-tight opacity-80'>
                Aram AI
            </h1>
            <div className='dark:bg-foreground/4 bg-foreground/2 text-sm flex gap-2 p-2 rounded-lg items-center'>
                    <Search className='size-4'/>
                    <input type="text" className='w-full outline-0' placeholder='Search..' value={searchUser} onChange={(e)=>{setSearchUser(e.target.value)}} />
            </div>
            
        </div>
        {/* Contact List  */}
        <div className='flex flex-col overflow-auto flex-1 non-selectable-text '>
            <ContentElement/>
            <ContentElement/>
            <ContentElement/>
            <ContentElement/>
            <ContentElement/>
            <ContentElement/>
        </div>
        
    </div>
  )
}

export default ContactList