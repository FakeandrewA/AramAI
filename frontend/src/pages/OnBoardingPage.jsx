import Navbar from '@/components/onboarding/Navbar'
import Hero from '@/components/onboarding/Hero'
import ScrollSection from '@/components/onboarding/ScrollSection'
import React from 'react'

const OnBoardingPage = () => {
  return (
    <div className='w-full h-full '>
        <Navbar/>
        <Hero/>
        <ScrollSection/>
        <div className='h-screen w-screen'></div>
    </div>
  )
}

export default OnBoardingPage