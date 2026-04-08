import React, { useState } from 'react';
import { UserProfile, Listing, ListingRequest, RequestStatus, Review } from '../types';
import { MessageSquare, ExternalLink, X, Check, XCircle, Play, Upload, Clock, CheckCircle2, History as HistoryIcon, Edit } from 'lucide-react';
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
  reviews?: Review[];
  onRequestAction?: (requestId: string, action: 'accepted' | 'rejected') => void;
  onRevokeRequest?: (requestId: string) => void;
  onResumeListing?: (listingId: string) => void;
  onSkillSwapAction?: (requestId: string, action: 'START' | 'SUBMIT' | 'ACCEPT' | 'REJECT', isOwner: boolean) => void;
  onLeaveReview?: (rating: number, comment: string) => void;
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
  reviews = [],
  onRequestAction, 
  onRevokeRequest,
  onResumeListing,
  onSkillSwapAction,
  onLeaveReview,
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
  
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

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
  
  const handleLeaveReview = () => {
    setReviewRating(0);
    setReviewComment("");
    setIsReviewOpen(true);
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
        <button onClick={() => onSkillSwapAction(req.id, 'START', isOwner)} title="Start Process" className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition shadow-sm">
          <Play className="w-4 h-4" />
        </button>
      );
    }
    
    if (req.status === 'in_progress') {
      const myCompletion = isOwner ? req.completedByOwner : req.completedByRequester;
      const theirCompletion = isOwner ? req.completedByRequester : req.completedByOwner;
      
      if (!myCompletion) {
        return (
          <button onClick={() => onSkillSwapAction(req.id, 'SUBMIT', isOwner)} title="Submit Work" className="p-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-full transition shadow-sm">
            <Upload className="w-4 h-4" />
          </button>
        );
      } else if (!theirCompletion) {
        return <span className="flex items-center text-xs text-primary/70 italic px-2 py-1"><Clock className="w-3 h-3 mr-1" /> Waiting...</span>;
      } else {
        // Both submitted!
        const myAcceptance = isOwner ? req.acceptedByOwner : req.acceptedByRequester;
        if (myAcceptance) {
          return <span className="text-xs text-green-500 font-semibold px-2 py-1 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Accepted</span>;
        }
        return (
          <div className="flex gap-2">
            <button onClick={() => onSkillSwapAction(req.id, 'ACCEPT', isOwner)} title="Accept Work" className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow-sm">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => onSkillSwapAction(req.id, 'REJECT', isOwner)} title="Not Satisfied" className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-sm">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
    
    if (req.status === 'completed') {
      return null; // Will show as a badge elsewhere or in History
    }
    return null;
  };

  const visibleListings = isCurrentUser ? listings : listings.filter(l => !l.status || l.status === 'active');

  const activeIncoming = incomingRequests.filter(r => r.status && !['completed', 'rejected', 'revoked'].includes(r.status.toLowerCase()));
  const historyIncoming = incomingRequests.filter(r => r.status && ['completed', 'rejected', 'revoked'].includes(r.status.toLowerCase()));
  
  const activeOutgoing = outgoingRequests.filter(r => r.status && !['completed', 'rejected', 'revoked'].includes(r.status.toLowerCase()));
  const historyOutgoing = outgoingRequests.filter(r => r.status && ['completed', 'rejected', 'revoked'].includes(r.status.toLowerCase()));

  return (
    <>
      {isModalOpen && <AddListingModal onAdd={handleAddListing} onClose={() => setIsModalOpen(false)} />}
      
      {isReviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 relative border border-gray-100 dark:border-gray-800 animate-slide-up">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-center">Review {user.name.split(' ')[0]}</h2>
            <div className="flex space-x-2 mb-6 justify-center">
               {[1, 2, 3, 4, 5].map(star => (
                 <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                    <StarIcon className={`w-10 h-10 ${reviewRating >= star ? 'text-yellow-400 drop-shadow-md' : 'text-gray-300 dark:text-gray-700'}`} filled={reviewRating >= star} />
                 </button>
               ))}
            </div>
            <textarea
               value={reviewComment}
               onChange={e => setReviewComment(e.target.value)}
               placeholder="Leave a comment (optional)..."
               className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 focus:ring-2 focus:outline-none focus:ring-primary dark:text-white text-sm"
               rows={3}
            />
            <div className="flex gap-3 justify-end">
               <button onClick={() => setIsReviewOpen(false)} className="px-5 py-2.5 font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel</button>
               <button 
                  onClick={() => {
                     if (onLeaveReview) {
                        onLeaveReview(reviewRating, reviewComment);
                     }
                     setIsReviewOpen(false);
                  }}
                  disabled={reviewRating === 0}
                  className="px-6 py-2.5 font-bold bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
               >
                 Submit
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-transparent min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button onClick={onBack} className="text-primary hover:text-primary/80 font-bold transition-colors">
              &larr; Back to Marketplace
            </button>
          </div>
          
          {/* Profile Header */}
          <div className="bg-white/90 dark:bg-[#0B0B1A]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 mb-8 md:flex md:items-center md:space-x-8 relative overflow-hidden group">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            <div className="md:flex-shrink-0 text-center md:text-left relative z-10">
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
                    {isCurrentUser && <span className="font-bold text-primary mr-4 bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full">{user.points || 0} Points</span>}
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
              <div className="mt-4 text-center md:text-left flex flex-row items-center justify-center md:justify-start gap-3">
                {isCurrentUser && !isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} title="Edit Profile" className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                {isCurrentUser ? (
                  <>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full shadow hover:bg-primary/90 transition transform hover:scale-105">
                       <span className="mr-1.5 text-lg leading-none">+</span> Listing
                    </button>
                    <button onClick={onAddPoints} className="flex items-center px-5 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-full shadow border border-green-400 hover:bg-green-600 transition transform hover:scale-105">
                       <span className="mr-1.5 text-lg leading-none">+</span> Points
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={onStartChat} title={`Chat with ${user.name}`} className="p-3 bg-primary text-white rounded-full shadow hover:bg-primary/90 transition transform hover:scale-105 border border-primary">
                       <MessageSquare className="w-5 h-5" />
                    </button>
                    <button onClick={handleLeaveReview} title="Leave Review" className="p-3 bg-white dark:bg-gray-800 text-yellow-500 border border-gray-200 dark:border-gray-700 rounded-full shadow hover:bg-yellow-50 dark:hover:bg-gray-700 transition transform hover:scale-105">
                       <StarIcon className="w-5 h-5" filled={true} />
                    </button>
                  </>
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
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Incoming Requests</h2>
                  {activeIncoming.length > 0 ? (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {activeIncoming.map(req => (
                        <li key={req.id} className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {req.requesterName} requested "{req.listingTitle}"
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <span className={`w-2 h-2 rounded-full mr-2 ${req.status === 'pending' ? 'bg-yellow-400' : 'bg-blue-400'}`}></span>
                                <span className="capitalize">{req.status}</span>
                              </p>
                            </div>
                            <div className="flex space-x-2 mt-2 sm:mt-0 flex-nowrap items-center">
                              {req.status?.toLowerCase() === 'pending' && onRequestAction && (
                                <>
                                  <button onClick={() => onRequestAction(req.id, 'accepted')} title="Accept" className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition">
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => onRequestAction(req.id, 'rejected')} title="Reject" className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition">
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {req.status?.toLowerCase() === 'accepted' && onStartChatWithUser && (
                                <button onClick={() => onStartChatWithUser(req.requesterId)} title="Chat with Requester" className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition">
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              )}
                              {onViewListing && (
                                <button onClick={() => onViewListing(req.listingId)} title="View Listing" className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              )}
                              {renderSkillSwapButtons(req, true)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No active incoming requests.</p>
                  )}
                </div>

                {/* Outgoing Requests */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Outgoing Requests</h2>
                  {activeOutgoing.length > 0 ? (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {activeOutgoing.map(req => (
                        <li key={req.id} className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                You requested "{req.listingTitle}"
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <span className={`w-2 h-2 rounded-full mr-2 ${req.status === 'pending' ? 'bg-yellow-400' : 'bg-purple-400'}`}></span>
                                <span className="capitalize">{req.status}</span>
                              </p>
                            </div>
                            <div className="flex space-x-2 mt-2 sm:mt-0 flex-nowrap items-center">
                              {req.status?.toLowerCase() === 'accepted' && onStartChatWithUser && (
                                <button onClick={() => onStartChatWithUser(req.ownerId)} title="Chat with Owner" className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition">
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              )}
                              {onViewListing && (
                                <button onClick={() => onViewListing(req.listingId)} title="View Listing" className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              )}
                              {req.status === 'pending' && onRevokeRequest && (
                                <button onClick={() => {
                                  if (window.confirm('Are you sure you want to revoke this request?')) {
                                      onRevokeRequest(req.id);
                                  }
                                }} title="Revoke Request" className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition">
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              {renderSkillSwapButtons(req, false)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No active outgoing requests.</p>
                  )}
                </div>
                
                {/* History Block */}
                <div className="lg:col-span-2 bg-gray-100/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl">
                  <h2 className="text-lg font-bold text-gray-600 dark:text-gray-400 flex items-center mb-4"><HistoryIcon className="w-5 h-5 mr-2" /> Transaction History</h2>
                  <div className="flex gap-4 flex-wrap">
                    {historyIncoming.map(req => (
                       <div key={req.id} className="bg-white/60 dark:bg-gray-800/60 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-gray-700">
                         {req.requesterName} &rarr; "{req.listingTitle}" <span className="font-semibold text-gray-700 dark:text-gray-300 ml-1">({req.status})</span>
                       </div>
                    ))}
                    {historyOutgoing.map(req => (
                       <div key={req.id} className="bg-white/60 dark:bg-gray-800/60 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-gray-700">
                         Requested "{req.listingTitle}" <span className="font-semibold text-gray-700 dark:text-gray-300 ml-1">({req.status})</span>
                       </div>
                    ))}
                    {(historyIncoming.length === 0 && historyOutgoing.length === 0) && (
                       <p className="text-sm text-gray-500 italic">No past transactions yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Listings Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Listings ({visibleListings.length})</h2>
              {visibleListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {visibleListings.map(listing => (
                    <div key={listing.id} className="relative flex flex-col group">
                      <ListingCard 
                          listing={listing}  
                          onUserSelect={handleUserSelectOnCard}
                          onListingSelect={onListingSelect}
                      />
                      {(listing.status === 'rented' || listing.status === 'in_progress' || listing.status === 'draft') && isCurrentUser && onResumeListing && (
                        <div className="absolute top-2 right-2 z-10 w-[calc(100%-16px)] flex justify-end">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onResumeListing(listing.id); }} 
                              className="bg-primary/90 backdrop-blur text-white text-sm font-bold py-2 px-4 rounded-full shadow-md hover:bg-primary hover:scale-105 transition-all w-full text-center"
                            >
                              {listing.status === 'draft' ? 'Relist Item' : 'Resume Listing'}
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Reviews ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.map(review => (
                     <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-lg transition">
                       <div className="flex items-center mb-4">
                         <img src={review.authorAvatarUrl} alt={review.authorName} className="w-12 h-12 rounded-full mr-4 border border-gray-200 dark:border-gray-600 shadow-sm" />
                         <div>
                           <h4 className="font-bold text-gray-900 dark:text-white">{review.authorName}</h4>
                           <div className="flex text-yellow-400">
                             {Array.from({ length: 5 }, (_, i) => (
                               <StarIcon key={i} className="w-4 h-4" filled={i < review.rating} />
                             ))}
                           </div>
                         </div>
                       </div>
                       {review.comment && <p className="text-gray-600 dark:text-gray-300 italic mb-4 flex-grow">"{review.comment}"</p>}
                       <div className="text-xs text-gray-400 dark:text-gray-500 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                         {new Date(review.date).toLocaleDateString()}
                       </div>
                     </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold dark:text-gray-300">No Reviews Yet</h3>
                  <p className="mt-2 text-gray-400">This user hasn't received any reviews.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;