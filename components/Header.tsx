
import React, { useState, useEffect } from 'react';
import { UserProfile, ListingType } from '../types';
import SearchIcon from './icons/SearchIcon';
import { FilterType } from '../App';
import { ArrowRightLeft, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  currentUser: UserProfile | null;
  onLogin: () => void;
  onSignUp: () => void;
  onLogout: () => void;
  onMyAccount: () => void;
  onFilterSelect: (filter: FilterType) => void;
  onGoHome: () => void;
}

// Helper Components (defined outside the main component to prevent re-creation on render)

const SearchBarInput: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}> = ({ searchQuery, onSearchChange, onSearchSubmit }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSearchSubmit(); }} className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <SearchIcon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="search"
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search by title..."
      className="block w-full bg-gray-100 border border-transparent rounded-full py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition"
      aria-label="Search"
    />
    <div className="absolute inset-y-0 right-0 pr-1 flex items-center">
      <button type="submit" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Submit search">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  </form>
);

const AuthButtons: React.FC<{ 
  isMobile?: boolean; 
  currentUser: UserProfile | null;
  onLogin: () => void;
  onSignUp: () => void;
  onLogout: () => void;
  onMyAccount: () => void;
}> = ({ isMobile = false, currentUser, onLogin, onSignUp, onLogout, onMyAccount }) => {
  if (currentUser) {
    return (
      <div className={`flex items-center ${isMobile ? 'w-full space-x-2' : 'space-x-2'}`}>
        <button onClick={onMyAccount} className={`${isMobile ? 'w-full text-center ' : ''}text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium`}>My Account</button>
        <button onClick={onLogout} className={`${isMobile ? 'w-full text-center ' : ''}bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors`}>Log Out</button>
      </div>
    );
  }
  return (
    <div className={`flex items-center ${isMobile ? 'w-full space-x-2' : 'space-x-2'}`}>
      <button onClick={onLogin} className={`${isMobile ? 'w-full text-center ' : ''}text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium`}>Log In</button>
      <button onClick={onSignUp} className={`${isMobile ? 'w-full text-center ' : ''}bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors`}>Sign Up</button>
    </div>
  );
};

const NavLink: React.FC<{ 
  filter: FilterType; 
  label: string; 
  isMobile?: boolean; 
  onClick: (filter: FilterType) => void;
}> = ({ filter, label, isMobile = false, onClick }) => (
  <button
    onClick={() => onClick(filter)}
    className={isMobile
      ? "text-gray-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
      : "text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
    }
  >
    {label}
  </button>
);

const Header: React.FC<HeaderProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onSearchSubmit,
  currentUser, 
  onLogin, 
  onSignUp,
  onLogout, 
  onMyAccount, 
  onFilterSelect,
  onGoHome,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const handleNavClick = (filter: FilterType) => {
    onFilterSelect(filter);
    setIsMenuOpen(false); // Close mobile menu on navigation
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left Group: Logo & Nav */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button onClick={onGoHome} className="flex items-center space-x-2 group">
                <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                  <ArrowRightLeft className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">PeerSwap</span>
              </button>
            </div>
            <div className="hidden md:block">
              {currentUser && (
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink filter={ListingType.SALE} label="Buy" onClick={handleNavClick} />
                  <NavLink filter={ListingType.RENTAL} label="Rent" onClick={handleNavClick} />
                  <NavLink filter={ListingType.SKILL} label="Skills" onClick={handleNavClick} />
                </div>
              )}
            </div>
          </div>
          
          {/* Center Group (Desktop Search) */}
          <div className="hidden md:flex flex-1 items-center min-w-0">
            <div className="w-full max-w-xl mx-auto">
                <SearchBarInput 
                  searchQuery={searchQuery} 
                  onSearchChange={onSearchChange} 
                  onSearchSubmit={onSearchSubmit} 
                />
            </div>
          </div>

          {/* Right Group: Auth & Mobile Menu */}
          <div className="flex items-center justify-end space-x-4">
            <button 
              onClick={toggleDarkMode} 
              className="p-2.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="hidden md:block">
                <AuthButtons 
                    currentUser={currentUser} 
                    onLogin={onLogin} 
                    onSignUp={onSignUp} 
                    onLogout={onLogout} 
                    onMyAccount={onMyAccount}
                />
            </div>
            <div className="flex items-center md:hidden">
                <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-primary"
                aria-controls="mobile-menu"
                aria-expanded="false"
                >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
                </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-4 pb-3 space-y-2 sm:px-3">
            <SearchBarInput 
              searchQuery={searchQuery} 
              onSearchChange={onSearchChange} 
              onSearchSubmit={onSearchSubmit} 
            />
          </div>
          {currentUser && (
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <NavLink filter={ListingType.SALE} label="Buy" isMobile={true} onClick={handleNavClick} />
              <NavLink filter={ListingType.RENTAL} label="Rent" isMobile={true} onClick={handleNavClick} />
              <NavLink filter={ListingType.SKILL} label="Skills" isMobile={true} onClick={handleNavClick} />
            </div>
          )}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
               <AuthButtons 
                  isMobile={true} 
                  currentUser={currentUser} 
                  onLogin={onLogin} 
                  onSignUp={onSignUp} 
                  onLogout={onLogout} 
                  onMyAccount={onMyAccount}
                />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
