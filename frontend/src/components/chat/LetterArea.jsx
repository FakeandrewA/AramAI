import { useAuthStore } from '@/store/useAuthStore'
import { X } from 'lucide-react'
import React from 'react'

const LetterArea = () => {
  const { showLetter , setShowLetter} = useAuthStore();

  return (
    <div className={`px-4 md:px-8 py-6 h-full w-[80%] md:w-[60%] xl:w-200 bg-background/90 border border-border   absolute top-0  z-200 ${showLetter?"right-0":"-right-[100%]"} transition-all duration-150`}>
        <div className='flex justify-end '>
            <button onClick={setShowLetter} className='p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full'>
                <X />
            </button>
        </div>
    </div>
  )
}

export default LetterArea