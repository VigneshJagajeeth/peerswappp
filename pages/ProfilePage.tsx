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
  allListings?: Listing[];
  incomingRequests?: ListingRequest[];
  outgoingRequests?: ListingRequest[];
  onRequestAction?: (requestId: string, action: 'accepted' | 'rejected') => void;
  onRevokeRequest?: (requestId: string) => void;
  onResumeListing?: (listingId: string) => void;
  onSkillSwapAction?: (requestId: string, action: 'START' | 'SUBMIT' | 'ACCEPT' | 'REJECT', isOwner: boolean) => void;
  onBack: () => void;
  isCurrentUser: boolean;
  onAddNewListing: (listing: Omit<Listing, 'id' | 'userId' | 'userName' | 'userAvatarUrl' | 'imageUrl' | 'createdAt'>) => void;
  onListingSelect: (listing: Listing) => void;
  onAddPoints: () => void;
  onStartChat?: () => void;
  onUpdateProfile?: (data: { name: string; bio: string; avatarUrl: string }) => void;
  onStartChatWithUser?: (userId: string) => void;
  onViewListing?: (listingId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  user, 
  listings, 
  allListings = [],
  incomingRequests = [], 
  outgoingRequests = [], 
  onRequestAction, 
  onRevokeRequest,
  onResumeListing,
  onSkillSwapAction,
  onBack, 
  isCurrentUser, 
  onAddNewListing, 
  onListingSelect, 
  onAddPoints,
  onStartChat,
  onUpdateProfile,
  onStartChatWithUser,
  onViewListing
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl);

  const totalReviews = user.totalReviews || 0;
  const averageRating = user.averageRating || 0;

  const handleAddListing = (listingData: Omit<Listing, 'id' | 'userId' | 'userName' | 'userAvatarUrl' | 'imageUrl' | 'createdAt'>) => {
    onAddNewListing(listingData);
    setIsModalOpen(false);
  };
  
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
       onUpdateProfile({ name: editName, bio: editBio, avatarUrl: editAvatarUrl });
       setIsEditingProfile(false);
    }
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} className="w-5 h-5 text-yellow-400" filled={i < Math.round(rating)} />
    ));
  };

  const handleUserSelectOnCard = (userId: string) => {
      if (isCurrentUser) return;
  }

  const renderSkillSwapButtons = (req: ListingRequest, isOwner: boolean) => {
    if (!onSkillSwapAction) return null;
    const listing = allListings.find(l => l.id === req.listingId);
    if (!listing || listing.listingType !== 'Skill Exchange') return null;

    if (req.status === 'accepted') {
      return (
        <button onClick={() => onSkillSwapAction(req.id, 'START', isOwner)} className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition shadow">
          Start Process
        </button>
      );
    }
    
    if (req.status === 'in_progress') {
      const myCompletion = isOwner ? req.completedByOwner : req.completedByRequester;
      const theirCompletion = isOwner ? req.completedByRequester : req.completedByOwner;
      
      if (!myCompletion) {
        return (
          <button onClick={() => onSkillSwapAction(req.id, 'SUBMIT', isOwner)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition shadow">
            Submit Work
          </button>
        );
      } else if (!theirCompletion) {
        return <span className="text-sm text-gray-500 italic px-2 py-1">Waiting for other party to submit...</span>;
      } else {
        // Both submitted!
        const myAcceptance = isOwner ? req.acceptedByOwner : req.acceptedByRequester;
        if (myAcceptance) {
          return <span className="text-sm text-green-500 font-semibold px-2 py-1">You accepted. Waiting for other...</span>;
        }
        return (
          <div className="flex gap-2">
            <button onClick={() => onSkillSwapAction(req.id, 'ACCEPT', isOwner)} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition shadow">
              Accept Work
            </button>
            <button onClick={() => onSkillSwapAction(req.id, 'REJECT', isOwner)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition shadow">
              Not Satisfied
            </button>
          </div>
        );
      }
    }
    
    if (req.status === 'completed') {
      return <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Transaction Complete</span>;
    }
    return null;
  };

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
              {isEditingProfile ? (
                 <form onSubmit={handleProfileSave} className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                      <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary" rows={2}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar URL</label>
                        <input type="url" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary/90">Save</button>
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    </div>
                 </form>
              ) : (
                <>
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
                </>
              )}
              <div className="mt-4 text-center md:text-left flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
                {isCurrentUser && !isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="bg-gray-100 text-gray-800 font-semibold px-6 py-2 rounded-md shadow hover:bg-gray-200 transition-transform transform hover:scale-105">
                    Edit Profile
                  </button>
                )}
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
                            <div className="flex space-x-2 mt-2 sm:mt-0 flex-wrap gap-y-2">
                              {req.status?.toLowerCase() === 'pending' && onRequestAction && (
                                <>
                                  <button 
                                    onClick={() => onRequestAction(req.id, 'accepted')}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => onRequestAction(req.id, 'rejected')}
                                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {req.status?.toLowerCase() === 'accepted' && onStartChatWithUser && (
                                <button 
                                  onClick={() => onStartChatWithUser(req.requesterId)}
                                  className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                  Chat with Requester
                                </button>
                              )}
                              {onViewListing && (
                                <button 
                                  onClick={() => onViewListing(req.listingId)}
                                  className="bg-gray-100 text-gray-800 border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors shadow-sm"
                                >
                                  View Listing
                                </button>
                              )}
                              {renderSkillSwapButtons(req, true)}
                            </div>
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
                            <div className="flex space-x-2 mt-2 sm:mt-0 flex-wrap gap-y-2">
                              {req.status?.toLowerCase() === 'accepted' && onStartChatWithUser && (
                                <button 
                                  onClick={() => onStartChatWithUser(req.ownerId)}
                                  className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                  Chat with Owner
                                </button>
                              )}
                              {onViewListing && (
                                <button 
                                  onClick={() => onViewListing(req.listingId)}
                                  className="bg-gray-100 text-gray-800 border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors shadow-sm"
                                >
                                  View Listing
                                </button>
                              )}
                              {req.createdAt && (new Date().getTime() - new Date(req.createdAt).getTime() < 24 * 60 * 60 * 1000) && onRevokeRequest && (
                                <button 
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to revoke this request?')) {
                                      onRevokeRequest(req.id);
                                    }
                                  }}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors shadow-sm"
                                >
                                  Revoke
                                </button>
                              )}
                              {renderSkillSwapButtons(req, false)}
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
                    <div key={listing.id} className="relative flex flex-col group">
                      <ListingCard 
                          listing={listing} 
                          onUserSelect={handleUserSelectOnCard}
                          onListingSelect={onListingSelect}
                      />
                      {(listing.status === 'rented' || listing.status === 'in_progress') && isCurrentUser && onResumeListing && (
                        <div className="absolute top-2 right-2 z-10 w-[calc(100%-16px)] flex justify-end">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onResumeListing(listing.id); }} 
                              className="bg-indigo-600/90 backdrop-blur text-white text-sm font-bold py-2 px-4 rounded-full shadow-lg hover:bg-indigo-500 hover:scale-105 transition-all w-full text-center"
                            >
                              Resume Listing
                            </button>
                        </div>
                      )}
                      
                    </div>
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