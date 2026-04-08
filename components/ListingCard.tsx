import React from 'react';
import { Listing, ListingType, PaymentType } from '../types';
import CashIcon from './icons/CashIcon';
import SkillIcon from './icons/SkillIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import { ArrowRightLeft } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onUserSelect: (userId: string) => void;
  onListingSelect: (listing: Listing) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onUserSelect, onListingSelect }) => {
  const { title, description, imageUrl, listingType, category, isVerified, paymentType, pointsPrice, skillPrice, userId, userName, userAvatarUrl } = listing;

  const typeColors: { [key in ListingType]: string } = {
    [ListingType.SALE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [ListingType.RENTAL]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [ListingType.SKILL]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col group border border-transparent dark:border-gray-700">
      <div className="relative">
        <button onClick={() => onListingSelect(listing)} className="block w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {imageUrl ? (
              <img className="h-56 w-full object-cover" src={imageUrl} alt={title} />
            ) : (
              <div className="h-56 w-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                <ArrowRightLeft className="h-16 w-16 text-gray-300 dark:text-gray-600 opacity-50" strokeWidth={1.5} />
              </div>
            )}
        </button>
        <div className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[listingType]}`}>
          {listingType}
        </div>
        {isVerified && listingType === ListingType.SKILL && (
          <div className="absolute top-2 left-2" title="Verified Skill">
            <VerifiedIcon className="w-6 h-6 text-white bg-primary rounded-full p-0.5" />
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <button onClick={() => onListingSelect(listing)} className="text-left focus:outline-none">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1 truncate group-hover:text-primary transition-colors">{title}</h3>
            {category && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-semibold">{category}</p>}
        </button>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">{description.substring(0, 100)}{description.length > 100 ? '...' : ''}</p>
        
        <div className="space-y-3 mb-4">
          {(paymentType === PaymentType.POINTS || paymentType === PaymentType.BOTH) && pointsPrice != null && (
             <div className="flex items-center text-gray-700 dark:text-gray-300">
                <CashIcon className="w-5 h-5 mr-2 text-secondary"/>
                <span className="font-semibold text-lg">
                  {pointsPrice} Points {listingType === ListingType.RENTAL && listing.pointsPriceDuration ? `/ ${listing.pointsPriceDuration}` : ''}
                </span>
             </div>
          )}
           {(paymentType === PaymentType.SKILL || paymentType === PaymentType.BOTH) && skillPrice && (
             <div className="flex items-start text-gray-700 dark:text-gray-300">
                <SkillIcon className="w-5 h-5 mr-2 text-accent flex-shrink-0 mt-1"/>
                <span className="text-sm italic">Swap for: <span className="not-italic font-medium">{skillPrice}</span></span>
             </div>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => onUserSelect(userId)} className="w-full text-left group/user flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                 <img className="h-10 w-10 rounded-full object-cover" src={userAvatarUrl} alt={userName} />
                <div className="ml-3">
                    <p className={`text-sm font-medium text-gray-900 dark:text-gray-200 group-hover/user:text-primary transition-colors`}>{userName}</p>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
