import React from 'react'

const LawersItem = () => {
  return (
    <div className='  bg-muted/30 rounded-lg flex flex-col gap-4 px-6 py-6'>
        <div className='flex gap-6'>
            <div className='p-1 border-2 border-emerald-500 h-fit rounded-full'>
                <img src="./images/user.jpg" alt="" className='size-14 rounded-full' />
            </div>
            <div className='flex flex-col justify-around'>
                {/* Name  */}
                <h2 className='text-lg font-semibold opacity-80'>Jon Snow</h2>
                {/* Field  */}
                <p className='text-sm -mt-4'>Corporate & Business Law</p>
            </div>

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
            <button className='px-4 hover:scale-103 transition-all duration-150 py-2 bg-gradient-to-r  from-emerald-500 to-green-700 rounded'>
                Contact
            </button>
        </div>
    </div>
  )
}

export default LawersItem