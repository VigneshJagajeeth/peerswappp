
import React, { useState, useEffect } from 'react';
import { Listing } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface RecommendationsProps {
  listings: Listing[];
  onListingSelect: (listing: Listing) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ listings, onListingSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (listings.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % listings.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer); // Cleanup
  }, [listings.length]);

  if (listings.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + listings.length) % listings.length);
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % listings.length);
  };
  
  const currentListing = listings[currentIndex];

  return (
    <section aria-label="Featured Items Carousel" className="relative w-full h-80 md:h-96 bg-gray-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
         {listings.map((listing, index) => (
            <img 
              key={listing.id}
              src={listing.imageUrl} 
              alt={listing.title} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentIndex ? 'opacity-40' : 'opacity-0'}`}
              aria-hidden={index !== currentIndex}
            />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
        <span className="bg-primary/80 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          Featured
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-2" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>{currentListing.title}</h2>
        <p className="max-w-xl mb-6 text-gray-200" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{currentListing.description.substring(0, 80)}...</p>
        <button 
          onClick={() => onListingSelect(currentListing)}
          className="bg-secondary text-white font-semibold px-8 py-3 rounded-md shadow-lg hover:bg-secondary/90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-secondary"
        >
          View Details
        </button>
      </div>

      {/* Navigation */}
      <button 
        onClick={goToPrevious} 
        className="absolute top-1/2 left-4 -translate-y-1/2 z-20 p-2 bg-black/30 rounded-full hover:bg-black/50 transition focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </button>
      <button 
        onClick={goToNext} 
        className="absolute top-1/2 right-4 -translate-y-1/2 z-20 p-2 bg-black/30 rounded-full hover:bg-black/50 transition focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-6 h-6 text-white" />
      </button>
      
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {listings.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition ${currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Recommendations;
