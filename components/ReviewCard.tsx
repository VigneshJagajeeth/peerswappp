import React from 'react';
import { Review } from '../types';
import StarIcon from './icons/StarIcon';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} className="w-5 h-5 text-yellow-400" filled={i < rating} />
    ));
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex space-x-4">
      <div className="flex-shrink-0">
        <img 
          className="h-12 w-12 rounded-full object-cover" 
          src={review.authorAvatarUrl} 
          alt={review.authorName} 
        />
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
            <div>
                <p className="font-semibold text-gray-800">{review.authorName}</p>
                <div className="flex items-center mt-1">
                    {renderStars(review.rating)}
                </div>
            </div>
            <p className="text-sm text-gray-500">{review.date}</p>
        </div>
        <p className="text-gray-700 mt-3">{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
