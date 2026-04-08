
import React, { useState, useMemo, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, addDoc, query, orderBy, where, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from './firebase';
import Header from './components/Header';
import Hero from './components/Hero';
import ListingCard from './components/ListingCard';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import ListingDetailPage from './pages/ListingDetailPage';
import ChatPage from './pages/ChatPage';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import Recommendations from './components/Recommendations';
import { Listing, ListingType, UserProfile, RequestStatus, ListingRequest } from './types';
import FeaturesSection from './components/FeaturesSection';
import { AnimatePresence, motion } from 'motion/react';

export type FilterType = ListingType | 'ALL';
export type ViewType = 'marketplace' | 'profile' | 'listingDetail' | 'chat';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId || undefined,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const App: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [view, setView] = useState<ViewType>('marketplace');
  
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [chatUser, setChatUser] = useState<{id: string, name: string} | null>(null);
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const [incomingRequests, setIncomingRequests] = useState<ListingRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ListingRequest[]>([]);
  
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let unsubscribeIncoming: () => void;
    let unsubscribeOutgoing: () => void;
    let unsubscribeListings: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }

        const incomingQuery = query(collection(db, 'requests'), where('ownerId', '==', user.uid));
        unsubscribeIncoming = onSnapshot(incomingQuery, (snapshot) => {
          setIncomingRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ListingRequest)));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'requests');
        });

        const outgoingQuery = query(collection(db, 'requests'), where('requesterId', '==', user.uid));
        unsubscribeOutgoing = onSnapshot(outgoingQuery, (snapshot) => {
          setOutgoingRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ListingRequest)));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'requests');
        });

        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        unsubscribeListings = onSnapshot(q, (snapshot) => {
          const listingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
          setAllListings(listingsData);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'listings');
        });

      } else {
        setCurrentUser(null);
        setIncomingRequests([]);
        setOutgoingRequests([]);
        setAllListings([]);
        if (unsubscribeIncoming) unsubscribeIncoming();
        if (unsubscribeOutgoing) unsubscribeOutgoing();
        if (unsubscribeListings) unsubscribeListings();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeIncoming) unsubscribeIncoming();
      if (unsubscribeOutgoing) unsubscribeOutgoing();
      if (unsubscribeListings) unsubscribeListings();
    };
  }, []);

  const fetchUser = async (id: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        return userData;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    }
    return null;
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setLoginModalOpen(false);
  };
  
  const handleSignUp = (user: any) => {
    setCurrentUser(user);
    setSignUpModalOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    if (selectedProfileId === currentUser?.uid) {
      setView('marketplace');
      setSelectedProfileId(null);
    }
    setCurrentUser(null);
  };

  const handleMyAccount = async () => {
    if (currentUser) {
      const userProfile = await fetchUser(currentUser.uid);
      if (userProfile) {
        setSelectedUser(userProfile);
        setSelectedProfileId(currentUser.uid);
        setSelectedListing(null);
        setView('profile');
        window.scrollTo(0, 0);
      }
    }
  };

  const handleAddNewListing = async (newListingData: Omit<Listing, 'id' | 'userId' | 'userName' | 'userAvatarUrl' | 'imageUrl' | 'createdAt'>) => {
    if (!currentUser) return;
    
    try {
      const listingToAdd = {
        ...newListingData,
        userId: currentUser.uid,
        userName: currentUser.name,
        userAvatarUrl: currentUser.avatarUrl,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
        createdAt: new Date().toISOString()
      };

      // Remove undefined fields to prevent Firebase errors
      Object.keys(listingToAdd).forEach(key => {
        if (listingToAdd[key as keyof typeof listingToAdd] === undefined) {
          delete listingToAdd[key as keyof typeof listingToAdd];
        }
      });

      await addDoc(collection(db, 'listings'), listingToAdd);
      
      // We don't need to manually update state because onSnapshot will handle it
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'listings');
    }
  };

  const handleUserSelect = async (userId: string) => {
    const userProfile = await fetchUser(userId);
    if (userProfile) {
      setSelectedUser(userProfile);
      setSelectedProfileId(userId);
      setSelectedListing(null);
      setView('profile');
      window.scrollTo(0, 0);
    }
  };

  const handleListingSelect = (listing: Listing) => {
    setSelectedListing(listing);
    setView('listingDetail');
    window.scrollTo(0, 0);
  }
  
  const handleBackToMarketplace = () => {
    setView('marketplace');
    setSelectedProfileId(null);
    setSelectedListing(null);
    setChatUser(null);
  };
  
  const handleStartChat = (userId: string, userName: string) => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }
    setChatUser({ id: userId, name: userName });
    setView('chat');
  };
  
  const handleGoHome = () => {
    setActiveFilter('ALL');
    setSearchQuery('');
    setSubmittedQuery('');
    handleBackToMarketplace();
    window.scrollTo(0, 0);
  };

  const handleFilterSelect = (filter: FilterType) => {
    setActiveFilter(filter);
    handleBackToMarketplace();
  };
  
  const handleSearchSubmit = () => {
    setSubmittedQuery(searchQuery);
    handleBackToMarketplace();
  };
  
  const handlePurchaseListing = async (listingId: string) => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }

    const listingToBuy = allListings.find(l => l.id === listingId);
    if (!listingToBuy) return;

    if (listingToBuy.userId === currentUser.uid) {
      showToast("You can't request your own item!");
      return;
    }

    try {
      const requestData = {
        listingId: listingToBuy.id,
        listingTitle: listingToBuy.title,
        requesterId: currentUser.uid,
        requesterName: currentUser.name,
        ownerId: listingToBuy.userId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'requests'), requestData);
      showToast(`Request sent to ${listingToBuy.userName} for "${listingToBuy.title}"!`);
      handleBackToMarketplace();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'requests');
    }
  };

  const handleAddPoints = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        points: increment(100)
      });
      showToast('Added 100 points to your account!');
      
      // Update local state for immediate feedback
      const updatedUser = { ...currentUser, points: (currentUser.points || 0) + 100 };
      setCurrentUser(updatedUser);
      if (selectedUser?.uid === currentUser.uid) {
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const recommendedListings = useMemo(() => {
    return allListings.slice(0, 5);
  }, [allListings]);

  const filteredListings = useMemo(() => {
    const byCategory = activeFilter === 'ALL'
      ? allListings
      : allListings.filter(listing => listing.listingType === activeFilter);

    if (!submittedQuery.trim()) {
      return byCategory;
    }

    const lowercasedQuery = submittedQuery.toLowerCase();
    return byCategory.filter(listing => 
      listing.title.toLowerCase().includes(lowercasedQuery)
    );
  }, [activeFilter, submittedQuery, allListings]);
  
  const ListingsGrid = ({ listings }: { listings: Listing[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {listings.length > 0 ? (
        listings.map(listing => (
          <ListingCard 
            key={listing.id} 
            listing={listing} 
            onUserSelect={handleUserSelect}
            onListingSelect={handleListingSelect}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <h3 className="text-xl font-semibold">No listings found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: action
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'requests');
    }
  };

  const renderContent = () => {
    switch(view) {
      case 'profile':
        return selectedUser && (
          <ProfilePage 
            user={selectedUser} 
            listings={allListings.filter(l => l.userId === selectedUser.uid)}
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            onRequestAction={handleRequestAction}
            onBack={handleBackToMarketplace}
            isCurrentUser={selectedUser.uid === currentUser?.uid}
            onAddNewListing={handleAddNewListing}
            onListingSelect={handleListingSelect}
            onAddPoints={handleAddPoints}
            onStartChat={() => handleStartChat(selectedUser.uid, selectedUser.name)}
          />
        );
      case 'listingDetail': {
        const hasAcceptedRequest = outgoingRequests.some(
          req => req.listingId === selectedListing?.id && req.status === RequestStatus.ACCEPTED
        );
        return selectedListing && (
            <ListingDetailPage
                listing={selectedListing}
                currentUser={currentUser}
                hasAcceptedRequest={hasAcceptedRequest}
                onBack={handleBackToMarketplace}
                onUserSelect={handleUserSelect}
                onPurchase={handlePurchaseListing}
                onStartChat={() => handleStartChat(selectedListing.userId, selectedListing.userName)}
            />
        );
      }
      case 'chat':
        return currentUser && chatUser && (
          <ChatPage
            currentUser={currentUser}
            otherUserId={chatUser.id}
            otherUserName={chatUser.name}
            onBack={() => {
              if (selectedListing) setView('listingDetail');
              else if (selectedUser) setView('profile');
              else setView('marketplace');
            }}
          />
        );
      case 'marketplace':
      default:
        if (currentUser) {
           return (
             <>
               <Recommendations listings={recommendedListings} onListingSelect={handleListingSelect} />
               <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <h2 className="text-3xl font-bold text-gray-800 mb-8">All Listings</h2>
                 <ListingsGrid listings={filteredListings} />
               </div>
             </>
           );
        } else {
            const FilterButton = ({ filter, label }: { filter: FilterType; label: string }) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              );
            };

            return (
              <>
                <Hero onGetStarted={() => setSignUpModalOpen(true)} />
                <FeaturesSection />
                <div className="bg-white">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
                      Explore the Marketplace
                    </h2>
                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
                      Find what you need or offer your skills. Filter by category to get started.
                    </p>
                    
                    <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-10 p-2 bg-gray-100 rounded-full max-w-md mx-auto">
                      <FilterButton filter="ALL" label="All" />
                      <FilterButton filter={ListingType.SALE} label="Buy" />
                      <FilterButton filter={ListingType.RENTAL} label="Rent" />
                      <FilterButton filter={ListingType.SKILL} label="Skills" />
                    </div>

                    <ListingsGrid listings={filteredListings} />
                  </div>
                </div>
              </>
            );
        }
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        currentUser={currentUser}
        onLogin={() => setLoginModalOpen(true)}
        onSignUp={() => setSignUpModalOpen(true)}
        onLogout={handleLogout}
        onMyAccount={handleMyAccount}
        onFilterSelect={handleFilterSelect}
        onGoHome={handleGoHome}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer />
      {isLoginModalOpen && (
        <LoginModal 
          onLogin={handleLogin}
          onClose={() => setLoginModalOpen(false)}
        />
      )}
      {isSignUpModalOpen && (
        <SignUpModal 
          onSignUp={handleSignUp}
          onClose={() => setSignUpModalOpen(false)}
        />
      )}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-3"
          >
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white">
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
