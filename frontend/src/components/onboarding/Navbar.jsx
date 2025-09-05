import React from 'react'
import { ModeToggle } from "../mode-toggle";
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
  return (
    <nav className='w-full h-[64px] inset-0 fixed z-100 bg-background'>
        <div className='flex flex-row justify-between items-center gap-5 h-full lg:px-0 px-5 container mx-auto'>

            {/* Logo  */}
            <div className='font-goldman text-xl font-medium'>
                Aram AI
            </div>
            <div className='flex items-center space-x-12 '>
                <ModeToggle />
                <button onClick={(e)=>{
                        navigate('/login')
                    }}><div className='group px-4 py-2 shadow shadow-foreground/10 border-1 relative hover:scale-102 rounded  font-medium  overflow-hidden cursor-pointer'>
                    <div className='w-full rotate-30 h-5  absolute left-0 translate-x-[100%] group-hover:translate-x-0 transition-all duration-300 bg-foreground/5'>
                        
                    </div>
                    Get Started
                </div>
                </button>
            </div>
        </div>
        

    </nav>
  )
}

export default Navbar