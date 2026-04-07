import React, { useState } from 'react';
import { UserProfile, Listing, ListingRequest, RequestStatus } from '../types';
import ListingCard from '../components/ListingCard';
import ReviewCard from '../components/ReviewCard';
import VerifiedIcon from '../components/icons/VerifiedIcon';
import StarIcon from '../components/icons/StarIcon';
import AddListingModal from '../components/AddListingModal';

interface ProfilePageProps {
  user: UserProfile;
  listings: Listing[];
  incomingRequests?: ListingRequest[];
  outgoingRequests?: ListingRequest[];
  onRequestAction?: (requestId: string, action: 'accepted' | 'rejected') => void;
  onBack: () => void;
  isCurrentUser: boolean;
  onAddNewListing: (listing: Omit<Listing, 'id' | 'userId' | 'userName' | 'userAvatarUrl' | 'imageUrl' | 'createdAt'>) => void;
  onListingSelect: (listing: Listing) => void;
  onAddPoints: () => void;
  onStartChat?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  user, 
  listings, 
  incomingRequests = [], 
  outgoingRequests = [], 
  onRequestAction, 
  onBack, 
  isCurrentUser, 
  onAddNewListing, 
  onListingSelect, 
  onAddPoints,
  onStartChat
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalReviews = user.totalReviews || 0;
  const averageRating = user.averageRating || 0;

  const handleAddListing = (listingData: Omit<Listing, 'id' | 'userId' | 'userName' | 'userAvatarUrl' | 'imageUrl' | 'createdAt'>) => {
    onAddNewListing(listingData);
    setIsModalOpen(false);
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} className="w-5 h-5 text-yellow-400" filled={i < Math.round(rating)} />
    ));
  };

  const handleUserSelectOnCard = (userId: string) => {
      // Clicking on the user card from their own profile page should not navigate.
      if (isCurrentUser) return;
  }

  return (
    <>
      {isModalOpen && <AddListingModal onAdd={handleAddListing} onClose={() => setIsModalOpen(false)} />}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button onClick={onBack} className="text-primary hover:underline font-semibold">
              &larr; Back to Marketplace
            </button>
          </div>
          
          {/* Profile Header */}
          <div className="bg-white p-8 rounded-xl shadow-md mb-8 md:flex md:items-center md:space-x-8">
            <div className="md:flex-shrink-0 text-center md:text-left">
              <img 
                className="h-32 w-32 rounded-full object-cover mx-auto md:mx-0" 
                src={user.avatarUrl} 
                alt={user.name} 
              />
            </div>
            <div className="mt-4 md:mt-0 flex-grow">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                {user.isAccountVerified && <VerifiedIcon className="w-7 h-7 text-primary" title="Verified Account" />}
              </div>
              <p className="text-gray-500 mt-1">Joined {user.joinedDate}</p>
              <div className="flex items-center mt-2 justify-center md:justify-start">
                <span className="font-bold text-green-600 mr-4 bg-green-100 px-3 py-1 rounded-full">{user.points || 0} Points</span>
                {renderStars(averageRating)}
                {totalReviews > 0 ? (
                  <>
                    <span className="ml-2 text-gray-600 font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="ml-1 text-gray-500">({totalReviews} reviews)</span>
                  </>
                ) : (
                  <span className="ml-2 text-gray-500">No reviews yet</span>
                )}
              </div>
              <p className="text-gray-700 mt-4 max-w-xl text-center md:text-left">{user.bio}</p>
              <div className="mt-4 text-center md:text-left flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
                {isCurrentUser ? (
                  <>
                    <button onClick={() => setIsModalOpen(true)} className="bg-secondary text-white font-semibold px-6 py-2 rounded-md shadow-md hover:bg-secondary/90 transition-transform transform hover:scale-105">
                      + Add New Listing
                    </button>
                    <button onClick={onAddPoints} className="bg-green-500 text-white font-semibold px-6 py-2 rounded-md shadow-md hover:bg-green-600 transition-transform transform hover:scale-105">
                      Add Points
                    </button>
                  </>
                ) : (
                  <button onClick={onStartChat} className="bg-primary text-white font-semibold px-6 py-2 rounded-md shadow-md hover:bg-primary/90 transition-transform transform hover:scale-105">
                    Chat with {user.name.split(' ')[0]}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="space-y-12">
            
            {/* Requests Section (Only for current user) */}
            {isCurrentUser && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Incoming Requests */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Incoming Requests</h2>
                  {incomingRequests.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {incomingRequests.map(req => (
                        <li key={req.id} className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {req.requesterName} requested "{req.listingTitle}"
                              </p>
                              <p className="text-sm text-gray-500">Status: <span className="font-semibold capitalize">{req.status}</span></p>
                            </div>
                            {req.status === RequestStatus.PENDING && onRequestAction && (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => onRequestAction(req.id, 'accepted')}
                                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => onRequestAction(req.id, 'rejected')}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No incoming requests.</p>
                  )}
                </div>

                {/* Outgoing Requests */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Outgoing Requests</h2>
                  {outgoingRequests.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {outgoingRequests.map(req => (
                        <li key={req.id} className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                You requested "{req.listingTitle}"
                              </p>
                              <p className="text-sm text-gray-500">Status: <span className="font-semibold capitalize">{req.status}</span></p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No outgoing requests.</p>
                  )}
                </div>
              </div>
            )}

            {/* Listings Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Listings ({listings.length})</h2>
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {listings.map(listing => (
                    <ListingCard 
                        key={listing.id} 
                        listing={listing} 
                        onUserSelect={handleUserSelectOnCard}
                        onListingSelect={onListingSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold">No Listings Yet</h3>
                  <p className="mt-2">{isCurrentUser ? "Time to add your first item or skill!" : "This user hasn't listed any items or skills."}</p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews ({totalReviews})</h2>
              <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">No Reviews Yet</h3>
                <p className="mt-2">This user hasn't received any reviews.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;