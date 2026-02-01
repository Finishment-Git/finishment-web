"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Define the shape of a single FAQ item
interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Do you accept LVP, WPC, SPC?",
    answer: "Yes, any floating floor product that has flexibility end to end and a non-wood-based core (like laminate or engineered hardwoods)."
  },
  {
    question: "Do you accept Laminate / Wood?",
    answer: "Unfortunately no. Our products are produced through a very specific heat-controlled process and only works on products with a core that can be heated and reshaped. Laminate (MDF core) and Wood (engineered wood core) don't flex and therefore aren't candidates for the work we do."
  },
  {
    question: "How much material should I send?",
    answer: "We ask for pilot pieces to periodically mic and measure for accuracy. For an average staircase (usually around 17 stairs) we ask for at least one or two extra pieces. For Large orders, we ask for 1 extra piece for every 20 stairs. We will gladly return, untouched, any pieces that don't get used as a pilot / test piece."
  },
  {
    question: "What if a piece arrives damaged?",
    answer: "Photograph packaging and piece within 48 hours for replacement."
  },
  {
    question: "Can you ship nationwide?",
    answer: "Yes."
  },
  {
    question: "Do you provide dealer pricing?",
    answer: "Yes, simply click the \"dealer registration\" button above to open an dealer account, follow a short training introduction and you'll be all set to enjoy dealer pricing and support."
  },
  {
    question: "What is the maximum length of material you're able to bend?",
    answer: "Our equipment can accommodate bends up to 60 inches in length."
  }
];

const FAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" style={{ 
      position: 'relative', 
      padding: '100px 20px', 
      backgroundColor: '#09090b', 
      color: 'white', 
      overflow: 'hidden' 
    }}>
      {/* Decorative Blur Element */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        borderRadius: '100%',
        filter: 'blur(100px)',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '42px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Frequently Asked <span style={{ color: '#ea580c' }}>Questions</span>
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to know about our custom fabrication process.
          </p>
        </div>
        
        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqData.map((item, index) => {
            const isOpen = activeIndex === index;
            
            return (
              <div 
                key={index} 
                style={{
                  backgroundColor: '#18181b',
                  borderRadius: '12px',
                  border: `1px solid ${isOpen ? '#ea580c' : '#27272a'}`,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: isOpen ? '0 4px 12px rgba(234, 88, 12, 0.15)' : 'none'
                }}
              >
                {/* Question Header Button */}
                <button 
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '24px 32px',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: 'white',
                    paddingLeft: '24px',
                    margin: 0
                  }}>
                    {item.question}
                  </h3>
                  
                  {/* Orange Chevron Icon */}
                  <div style={{ 
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'transform 0.3s ease'
                  }}>
                    {isOpen ? (
                      <ChevronUp size={24} color="#ea580c" />
                    ) : (
                      <ChevronDown size={24} color="#ea580c" />
                    )}
                  </div>
                </button>

                {/* Answer Content */}
                <div 
                  style={{
                    maxHeight: isOpen ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.5s ease-in-out, opacity 0.3s ease',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  <p style={{ 
                    padding: '0 32px 24px 56px',
                    color: '#a1a1aa',
                    lineHeight: '1.7',
                    fontSize: '16px',
                    margin: 0
                  }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;