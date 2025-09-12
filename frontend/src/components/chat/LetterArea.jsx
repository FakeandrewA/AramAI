import { useAuthStore } from '@/store/useAuthStore'
import React from 'react'

const LetterArea = () => {
  const { showLetter } = useAuthStore()

  return (
    <div className={` h-full w-full md:w-[80%] xl:w-200 bg-foreground/10 absolute top-0  z-200 ${showLetter?"right-0":"-right-[100%]"} transition-all duration-150`}>
        <div className='h-full w-full bg-background/10'></div>
    </div>
  )
}

export default LetterArea