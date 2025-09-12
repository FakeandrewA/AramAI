import { AudioWaveform } from 'lucide-react';
import React from 'react'

const LawyersItem = ({ lawyer }) => {
  if (!lawyer) return null;

  return (
    <div className='bg-muted/30 rounded-lg flex flex-col gap-4 px-6 py-6 border-1'>
      {/* Top Section */}
      <div className='flex gap-4 items-center'>
        {/* Profile Picture */}
        <div className='p-1 border-2 border-emerald-500 h-fit rounded-full'>
          <img 
            src={lawyer.profilePic || "./images/user.jpg"} 
            alt={`${lawyer.firstName} ${lawyer.lastName}`} 
            className='size-14 rounded-full object-cover' 
          />
        </div>

        {/* Name + Field */}
        <div className="flex flex-col">
          <h2 className='text-lg font-semibold opacity-80'>
            {lawyer.firstName} {lawyer.lastName}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {lawyer.field?.length > 0 ? lawyer.field.join(", ") : "General Law"}
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <i>
          {'"' + (lawyer.description || "No description available.") + '"'}
        </i>
      </div>

      {/* Rating */}
      <div className='flex gap-2 items-center'>
        Rating :
        <p className='text-sm'>
          {lawyer.rating?.count > 0
            ? "⭐".repeat(Math.round(lawyer.rating.reviews?.reduce((a, b) => a + b, 0) / lawyer.rating.count))
            : "None"}
        </p>
      </div>

      {/* Contact Button */}
      <div className='flex justify-end w-full'>
        <button className='px-4 flex gap-3 items-center text-white border border-border hover:scale-105 transition-all duration-150 py-2 bg-gradient-to-r from-emerald-500 to-green-700 rounded-xl'>
          Contact
          <AudioWaveform className='size-4' />
        </button>
      </div>
    </div>
  )
}

export default LawyersItem
