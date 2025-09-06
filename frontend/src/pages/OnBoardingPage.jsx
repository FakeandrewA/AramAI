import Navbar from '@/components/onboarding/Navbar'
import Hero from '@/components/onboarding/Hero'
import ScrollSection from '@/components/onboarding/ScrollSection'
import React from 'react'
import Background from '@/components/onboarding/Background'
import OnboardingCTA from '@/components/onboarding/OnboardingCTA'

const OnBoardingPage = () => {
  return (
    <div className='w-full h-full '>
        <Background/>
        <Navbar/>
        <Hero/>
        <ScrollSection/>
        <OnboardingCTA/>
    </div>
  )
}

export default OnBoardingPage