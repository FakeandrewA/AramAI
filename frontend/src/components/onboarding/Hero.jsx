import React from 'react'
import { ChevronDown } from "lucide-react"
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";



gsap.registerPlugin(useGSAP,SplitText);

const Hero = () => {
    useGSAP(()=>{
        document.fonts.ready.then(()=>{
            const heroSplit = new SplitText('.title',{type:'chars, words' , });
            const paragraphSplit = new SplitText('.subtitle',{type:'lines' , })
            const subheadingSplit = new SplitText('.subheading',{type:"lines",})
            subheadingSplit.lines.forEach((line)=>line.classList.add('text-gradient-green-subehading'))
            

            gsap.from(paragraphSplit.lines, {
                yPercent: 100,   // start off-screen below
                opacity: 0,
                clipPath: "inset(100% 0 0 0)",
                duration: 1.8,
                ease: "expo.out",
                delay: 1,
                stagger: 0.06,
            });
            gsap.from(subheadingSplit.lines, {
                yPercent: 100,   // start off-screen below
                opacity: 0,
                clipPath: "inset(100% 0 0 0)",
                duration: 1.8,
                ease: "expo.out",
                delay: 1,
                stagger: 0.06,
            });
            heroSplit.chars.forEach((char)=>char.classList.add('text-gradient-onboarding-light'))
            heroSplit.chars.forEach((char)=>char.classList.add('dark:text-gradient-onboarding-dark'))
            gsap.from(heroSplit.chars ,{yPercent:100,duration:1.8,ease:"expo.out",stagger:0.06})
        })
    },[])
  return (
    <div className='relative z-10 min-h-dvh w-full border border-transparent'>
        <div>
            <h1 className='md:mt-32 mt-40 text-6xl md:text-[11vw] leading-none text-center font-goldman title dark:text-gradient-onboarding-dark text-gradient-onboarding-light'>ARAM AI</h1>
        </div>
        <div className='container mx-auto absolute left-1/2 -translate-x-1/2 lg:bottom-20 bottom-30 md:top-[30vh] flex justify-between items-end px-5 '>
        <div className='space-y-4 hidden md:block'>
            <div className='overflow-hidden'>
                <p className='text-[40px] font-bold text-gradient-green-subehading subheading inline-block overflow-hidden'>Fast. Reliable. Secure <br/>Legal Support</p>
                
            </div>
            <p className=' text-lg subtitle'>
              Trusted legal solutions delivered quickly and <br/>securely.
            </p>
        </div>
        <div className='space-y-6 max-w-[300px]'>
            <p className=' text-lg subtitle'>Discover how our AI-powered legal platform works—step inside to see fast, secure guidance unfold.</p>
            <a href="#howItWorks" className="group flex gap-2 font-medium subheading">
                <p className="group-hover:text-[#059669] transition-all duration-200 group-hover:scale-102 font-bold">HOW IT WORKS</p>
            </a>
        </div>

        </div>
        
    </div>
  )
}

export default Hero