import React, { useRef } from 'react'
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const ScrollSection = () => {
  const containerRef = useRef(null);
  const sectionsRef = useRef(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const sections = sectionsRef.current;

      if (!container || !sections) return;

      const getScrollWidth = () =>
        sections.scrollWidth - window.innerWidth;

      // Reset any previous x before refresh
      ScrollTrigger.addEventListener("refreshInit", () => {
        gsap.set(sections, { x: 0 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${getScrollWidth()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });

      tl.to(sections, {
        x: () => -getScrollWidth(),
        ease: "none"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="h-screen overflow-hidden" id='howItWorks'>
      <div
        ref={sectionsRef}
        className="flex h-full"
        style={{ width: "max-content", willChange: "transform" }}
      >
        <section className="w-screen h-full flex items-center justify-center flex-shrink-0 
        ">
            <div className="text-center px-6">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                Core Features
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                
                {/* Feature 1 */}
                <div className="flex flex-col items-center bg-gray-200">
                    <span className="text-5xl">📄</span>
                    <h3 className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-200">
                    Document Review in Seconds
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Instantly analyze legal documents with AI-powered insights.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center">
                    <span className="text-5xl">🧑‍⚖️</span>
                    <h3 className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-200">
                    AI-driven Legal Q&amp;A
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Ask legal questions and receive accurate, contextual answers.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center">
                    <span className="text-5xl">📝</span>
                    <h3 className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-200">
                    Smart Contract Drafting
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Generate error-free contracts tailored to your needs.
                    </p>
                </div>

                </div>
            </div>  
        </section>


        <section className="w-screen h-full flex items-center justify-center bg-gradient-to-br from-pink-600 to-red-600 flex-shrink-0">
          <h2 className="text-5xl font-bold text-white">Section 2</h2>
        </section>

        <section className="w-screen h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600 flex-shrink-0">
          <h2 className="text-5xl font-bold text-white">Section 3</h2>
        </section>

        <section className="w-screen h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-teal-600 flex-shrink-0">
          <h2 className="text-5xl font-bold text-white">Section 4</h2>
        </section>
      </div>
    </div>
  );
};

export default ScrollSection;

