import React, { useEffect, useRef, ReactNode } from 'react';
import BuyFeatureIcon from './icons/BuyFeatureIcon';
import RentFeatureIcon from './icons/RentFeatureIcon';
import SkillFeatureIcon from './icons/SkillFeatureIcon';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  delay: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, children, delay }) => {
  return (
    <div 
      className="feature-card bg-white p-8 rounded-xl shadow-lg text-center flex flex-col items-center" 
      style={{ transitionDelay: delay }}
    >
      <div className="bg-primary/10 p-4 rounded-full mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.feature-card');
            cards.forEach(card => card.classList.add('is-visible'));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of the section is visible
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-gray-800">
            How PeerSwap Works
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mt-4">
            A flexible marketplace designed for students. Use cash, skills, or a mix of both.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BuyFeatureIcon className="w-10 h-10 text-primary" />} 
            title="Buy with Cash"
            delay="0s"
          >
            Find great deals on textbooks, electronics, and more. Pay directly and securely with cash. Simple, fast, and efficient.
          </FeatureCard>
          <FeatureCard 
            icon={<RentFeatureIcon className="w-10 h-10 text-primary" />} 
            title="Flexible Rentals"
            delay="0.2s"
          >
            Need something short-term? Rent cameras, tools, or even formal wear. Pay with cash or offer a skill in exchange.
          </FeatureCard>
          <FeatureCard 
            icon={<SkillFeatureIcon className="w-10 h-10 text-primary" />} 
            title="Skill Exchange"
            delay="0.4s"
          >
            Your talents are valuable. Trade your skills in tutoring, design, or anything else for items or services you need.
          </FeatureCard>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
