import React from 'react'
import MessageBubble from './MessageBubble'
import InputMessage from './InputMessage'
import { Info, MoreHorizontal } from 'lucide-react'

const ChatContainer = () => {
    return (
        <div className="flex flex-col w-2/3">
            {/* Header 💬 */}
            <div className="py-3 px-4 flex justify-between items-center border-b-1  border-overlay">

                <div className="flex gap-3 sm:gap-4 items-center"> 

                    <div className="h-10 w-10 border-1 border-emerald-400 rounded-xl"></div>

                    <div className="flex flex-col justify-evenly">
                        <div className="font-semibold text-sm sm:text-base">Peter Parker</div> 
                        <div className="text-[10px] text-foreground/70">last seen 10.41pm</div>
                    </div>
                </div>

                {/* Right Side Icons */}
                <div className="flex gap-4 sm:gap-6 h-full items-center">
                    <Info className="size-5" /> {/* Adjusted icon size */}
                    <MoreHorizontal className="size-5" /> {/* Adjusted icon size */}
                </div>
            </div>

            {/* Message Area 🚀 */}
            <div className="flex-1 w-full overflow-y-auto flex flex-col p-4 gap-2">
                <MessageBubble message="hi main erse dfsd vdsgv dvsdf vdfvsdf dfsef dvsd" isOwnMessage={true} />
                <MessageBubble message="message" isOwnMessage={false} />
                <MessageBubble message="message" isOwnMessage={true} />
                <MessageBubble message="message" isOwnMessage={true} />
                <MessageBubble message="message" isOwnMessage={false} />
                <MessageBubble message="message" isOwnMessage={true} />
                <MessageBubble message="message" isOwnMessage={false} />
                <MessageBubble message="message" isOwnMessage={false} />
                {/* Add more messages for scroll testing */}
                <MessageBubble message="This is a test message to ensure scrolling works well on small screens." isOwnMessage={true} />
                <MessageBubble message="Final message for responsiveness check." isOwnMessage={false} />
            </div>


            {/* Text Input ⌨️ */}
            <div className="w-full">
                <InputMessage />
            </div>
        </div>
    )
}

export default ChatContainer