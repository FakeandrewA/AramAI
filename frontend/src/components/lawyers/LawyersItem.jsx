import React from 'react'

const LawyersItem = ({ lawyer }) => {
  if (!lawyer) return null;

  return (
    <div className='bg-muted/30 rounded-lg flex flex-col gap-4 px-6 py-6'>
      {/* Top Section */}
      <div className='flex gap-6'>
        <div className='p-1 border-2 border-emerald-500 h-fit rounded-full'>
          <img 
            src={lawyer.profilePic || "./images/user.jpg"} 
            alt={`${lawyer.firstName} ${lawyer.lastName}`} 
            className='size-14 rounded-full object-cover' 
          />
        </div>
        {/* Description  */}
        <div>
            <i>
                
            {'"' + "Jon Snow, Esq. – Corporate & Business Law. Provides expert guidance on contracts, compliance, mergers, and strategic legal solutions." + '"    '}
            </i>
        </div>
        <div className='flex gap-2 items-center'>
            Rating :
            <p className='text-sm'> ⭐⭐⭐⭐</p>
        </div>
        <div className='flex justify-end w-full'>
            <button className='px-4 hover:scale-103 text-white border border-border transition-all duration-150 py-2 bg-gradient-to-r  from-emerald-500 to-green-700 rounded'>
                Contact
            </button>
        <div className='flex flex-col justify-around'>
          {/* Name */}
          <h2 className='text-lg font-semibold opacity-80'>
            {lawyer.firstName} {lawyer.lastName}
          </h2>
          {/* Field */}
          <p className='text-sm -mt-4'>
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
          {lawyer.rating ? "⭐".repeat(lawyer.rating) : "None"}
        </p>
      </div>

      {/* Contact Button */}
      <div className='flex justify-end w-full'>
        <button className='px-4 hover:scale-103 transition-all duration-150 py-2 bg-gradient-to-r from-emerald-500 to-green-700 rounded'>
          Contact
        </button>
      </div>
    </div>
    </div>
  )
}

export default LawyersItem
