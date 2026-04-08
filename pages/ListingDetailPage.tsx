
import React from 'react';
import { Listing, ListingType, PaymentType, UserProfile } from '../types';
import CashIcon from '../components/icons/CashIcon';
import SkillIcon from '../components/icons/SkillIcon';
import VerifiedIcon from '../components/icons/VerifiedIcon';
import { ArrowRightLeft } from 'lucide-react';

interface ListingDetailPageProps {
  listing: Listing;
  currentUser: UserProfile | null;
  hasAcceptedRequest: boolean;
  hasExistingRequest?: boolean;
  onBack: () => void;
  onUserSelect: (userId: string) => void;
  onPurchase: (listingId: string) => void;
  onStartChat?: () => void;
  onDelete?: (listingId: string) => void;
}

const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ listing, currentUser, hasAcceptedRequest, hasExistingRequest, onBack, onUserSelect, onPurchase, onStartChat, onDelete }) => {
  const { id, title, description, imageUrl, listingType, category, location, tradePreferences, isVerified, paymentType, pointsPrice, skillPrice, userId, userName, userAvatarUrl } = listing;

  const typeColors: { [key in ListingType]: { bg: string; text: string; border: string; } } = {
    [ListingType.SALE]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
    [ListingType.RENTAL]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
    [ListingType.SKILL]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-500' },
  };
  
  const isOwner = currentUser?.uid === userId;

  const getActionButton = () => {
    if (isOwner) {
      return (
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this listing?')) {
              onDelete && onDelete(id);
            }
          }}
          className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
        >
          Delete Listing
        </button>
      );
    }
    
    let text = '';
    let priceText = pointsPrice ? `${pointsPrice} Points` : '';
    switch (listingType) {
      case ListingType.SALE:
        text = 'Buy Now';
        break;
      case ListingType.RENTAL:
        text = 'Rent Now';
        break;
      case ListingType.SKILL:
        text = 'Request Skill Swap';
        priceText = ''; // No price for skill swap button
        break;
    }
    
    if (hasExistingRequest) {
      return (
        <button 
          disabled
          className="w-full bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow cursor-not-allowed"
        >
          Already Requested
        </button>
      );
    }

    return (
      <button 
        onClick={() => onPurchase(id)}
        className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
      >
        {text} {priceText && <span className="font-normal opacity-90">{priceText}</span>}
      </button>
    );
  };
  
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button onClick={onBack} className="text-primary hover:underline font-semibold">
            &larr; Back to Marketplace
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-full">
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-full object-cover min-h-[300px] md:min-h-[100%]" />
              ) : (
                <div className="w-full h-full min-h-[300px] bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <ArrowRightLeft className="h-32 w-32 text-gray-300 dark:text-gray-600 opacity-50" strokeWidth={1.5} />
                </div>
              )}
              {isVerified && listingType === ListingType.SKILL && (
                <div className="absolute top-4 left-4" title="Verified Skill">
                    <VerifiedIcon className="w-8 h-8 text-white bg-primary rounded-full p-1 shadow-lg" />
                </div>
              )}
            </div>
            
            {/* Details Section */}
            <div className="p-8 flex flex-col">
              <div className={`self-start text-sm font-bold px-3 py-1 rounded-full mb-3 ${typeColors[listingType].bg} ${typeColors[listingType].text}`}>
                {listingType}
              </div>
              
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{title}</h1>
              {category && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-semibold uppercase tracking-wider">{category}</p>}
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">{description}</p>
              
              {/* Pricing Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-3">
                 <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Payment Options</h3>
                 {(paymentType === PaymentType.POINTS || paymentType === PaymentType.BOTH) && pointsPrice != null && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <CashIcon className="w-6 h-6 mr-3 text-secondary"/>
                        <div>
                            <span className="font-semibold text-xl">{pointsPrice}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                               {listingType === ListingType.RENTAL && listing.pointsPriceDuration ? ` Points / ${listing.pointsPriceDuration}` : ' Points'}
                            </span>
                        </div>
                    </div>
                )}
                {(paymentType === PaymentType.SKILL || paymentType === PaymentType.BOTH) && skillPrice && (
                    <div className="flex items-start text-gray-700 dark:text-gray-300">
                        <SkillIcon className="w-6 h-6 mr-3 text-accent flex-shrink-0 mt-1"/>
                        <div>
                            <span className="font-semibold text-md not-italic">{skillPrice}</span>
                             <span className="text-sm text-gray-500 dark:text-gray-400"> (Skill Swap)</span>
                        </div>
                    </div>
                )}
                {tradePreferences && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold">Also accepts:</span> {tradePreferences}</p>
                    </div>
                )}
              </div>

              {/* Location Section */}
              {(isOwner || hasAcceptedRequest) && location && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm uppercase mb-1">Location</h3>
                  <p className="text-blue-900 dark:text-blue-200">{location}</p>
                </div>
              )}
              {!isOwner && !hasAcceptedRequest && location && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">Location is hidden until your request is accepted.</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mb-6 flex flex-col space-y-3">
                {getActionButton()}
                {!isOwner && (
                  <button 
                    onClick={onStartChat}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    Chat with {userName.split(' ')[0]}
                  </button>
                )}
              </div>

              {/* User Info Section */}
              <div className="mt-auto pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-500 text-sm uppercase mb-3">Listed By</h3>
                <button onClick={() => onUserSelect(userId)} className="flex items-center text-left p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors w-full group">
                  <img className="h-14 w-14 rounded-full object-cover" src={userAvatarUrl} alt={userName} />
                  <div className="ml-4">
                    <p className="text-lg font-bold text-gray-800 group-hover:text-primary">{userName}</p>
                    <p className="text-sm text-primary font-semibold">View Profile &rarr;</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
