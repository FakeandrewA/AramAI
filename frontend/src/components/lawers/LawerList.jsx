import { ChevronDown, Search } from 'lucide-react';
import React, { useState } from 'react'
import { motion } from "framer-motion"
import LawersItem from './LawersItem';

const LawerList = () => {
    const [search , setSearch] = useState("");
    const [showLess , setShowLess ] = useState(true)
  return (
    <div className='w-full mt-20 space-y-10'>
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 , delay:0.3, ease: "easeOut" }}
            className="flex items-center gap-4 py-3 px-4 rounded-lg bg-sidebar/40 md:w-[35%] xl:w-[40%] shadow-sm"
            >
            <Search className="size-5 text-muted-foreground" />
            <input
                type="text"
                className="outline-0 w-full bg-transparent text-sm"
                placeholder="Search..."
            />
        </motion.div>
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8 relative"
            >
                <button className={`absolute -bottom-12 right-0 px-3 py-1 bg-foreground/10 rounded ${showLess?"":"rotate-180"}`} onClick={()=>{setShowLess(!showLess)}}>
                    <ChevronDown className='size-4' />
                </button>
            {Array(showLess ? 6 : 12).fill(0).map((_, i) => (
                <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.02 }}
                >
                <LawersItem />
                </motion.div>
            ))}
</motion.div>


        
    </div>
  )
}

export default LawerList