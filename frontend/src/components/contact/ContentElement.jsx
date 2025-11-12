import React from 'react';


const ContentElement = ({ 
    name = "Jon Snow", 
    lastMessage = "Can we met tomorrow at office hjvh jhfj jf jgfvjh hvk kjbk,  kjbk", 
    onClick 
}) => {
    return (
        <div 
            className='p-4 w-full flex gap-2 items-center relative  
                       border-y border-muted cursor-pointer hover:bg-emerald-500/10 transition-colors'
            onClick={onClick}
        >
            <div className=' border size-12 rounded-xl flex-shrink-0  relative non-selectable-text '>
                <img src="/images/user.jpg" className="size-12 rounded-xl" draggable={false} alt="" />
                <div className='size-2 rounded-full absolute bg-green-500 right-0 -bottom-0.5'></div>
            </div>

            {/* Details Container */}
            <div className='flex flex-col h-full justify-evenly  overflow-hidden non-selectable-text '>
                <h4 className='font-medium text-[16px] truncate'>{name}</h4>
                
                <p className='text-sm opacity-80 text-[12px] w-[90%] truncate'>{lastMessage}</p>
            </div>
            <div className='absolute text-[11px] right-4 opacity-70 top-4'>20:18</div>
        </div>
    );
}

export default ContentElement;