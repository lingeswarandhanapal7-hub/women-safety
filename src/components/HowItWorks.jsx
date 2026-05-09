import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { id: 'detect', title: 'Detect', desc: 'AI sensors monitor environment and biometrics.' },
  { id: 'analyze', title: 'Analyze', desc: 'Neural engines identify patterns of distress.' },
  { id: 'score', title: 'Score', desc: 'Real-time calculation of local safety risks.' },
  { id: 'shield', title: 'Shield', desc: 'Automatic activation of protective measures.' },
  { id: 'protect', title: 'Protect', desc: 'Instant connection to emergency responders.' },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section bg-navy relative">
      <div className="container">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-syne font-bold mb-4 text-ivory">Engineered for Instant Response</h2>
          <p className="text-ivory/60">From detection to protection in under 3 seconds.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-teal/20 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: 'spring', stiffness: 100 }}
                className={`relative flex items-center justify-between ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col gap-8 md:gap-0`}
              >
                {/* Content */}
                <div className="w-full md:w-[42%]">
                  <div className={`p-8 glass ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center`}>
                    <span className="text-teal font-syne font-bold text-sm tracking-widest uppercase mb-2 block">
                      Step 0{index + 1}
                    </span>
                    <h3 className="text-2xl font-syne font-bold text-ivory mb-3">{step.title}</h3>
                    <p className="text-ivory/60 leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                {/* Dot on line */}
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-navy border-2 border-teal rounded-full z-10 hidden md:block shadow-[0_0_10px_rgba(46,196,182,0.5)]" />

                {/* Spacer for other side */}
                <div className="w-full md:w-[42%] hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
