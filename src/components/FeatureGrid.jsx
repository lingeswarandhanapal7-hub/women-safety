import React from 'react';
import { motion } from 'framer-motion';
import { FEATURES } from '../constants/features';

const FeatureGrid = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        once: true
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
  };

  return (
    <section id="features" className="section bg-navy">
      <div className="container">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-syne font-bold mb-4"
          >
            12 ways SHEild protects you
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-ivory/60 text-lg"
          >
            Silent. Automatic. Always on.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              variants={item}
              whileHover={{ 
                scale: 1.04, 
                y: -6,
              }}
              className="glass p-6 flex flex-col group relative overflow-hidden"
            >
              {/* Gradient border effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute inset-0 p-[1px] bg-gradient-to-br from-teal via-navy to-red rounded-2xl" />
                <div className="absolute inset-[1px] bg-navy rounded-2xl" />
              </div>

              <div className="relative z-10">
                <div className="w-10 h-10 flex items-center justify-center bg-teal/10 rounded-lg mb-4 text-teal">
                  <feature.icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-syne font-bold text-lg mb-2 text-ivory">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-ivory/70 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="mt-auto flex">
                  <span className="px-2.5 py-1 rounded-md bg-teal/10 text-teal text-[10px] font-bold uppercase tracking-wider">
                    {feature.tag}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;
