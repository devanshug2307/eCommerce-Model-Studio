import React, { useEffect, useState } from 'react';
import Button from './Button';
import { getCredits, syncCredits } from '../services/creditsService';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { supabase } from '../lib/supabase';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);


const Header: React.FC = () => {
  const [credits, setCredits] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(typeof window !== 'undefined' ? window.location.pathname : '/');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    
    if (user) {
      // Sync credits from database on mount
      syncCredits().then(() => setCredits(getCredits())).catch(console.error);

      // Refresh credits display every 5 seconds (and sync from DB every 30 seconds)
      let syncCounter = 0;
      const refresh = () => {
        setCredits(getCredits());
        syncCounter++;
        // Sync from database every 30 seconds
        if (syncCounter >= 6) {
          syncCounter = 0;
          syncCredits().then(() => setCredits(getCredits())).catch(console.error);
        }
      };
      
      refresh();
      const id = setInterval(refresh, 5000);
      // Realtime subscription to user_credits for this user
      const channel = supabase
        .channel(`user-credits-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_credits',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // On any change, sync from DB and update UI cache
            syncCredits().then(() => setCredits(getCredits())).catch(console.error);
          }
        )
        .subscribe();

      return () => {
        clearInterval(id);
        supabase.removeChannel(channel);
        window.removeEventListener('popstate', onPop);
      };
    }
    return () => window.removeEventListener('popstate', onPop);
  }, [user]);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const displayName = React.useMemo(() => {
    if (!user) return '';
    const md: any = user.user_metadata || {};
    return (
      md.full_name || md.name || (md.given_name && md.family_name ? `${md.given_name} ${md.family_name}` : undefined) ||
      user.email?.split('@')[0] || 'User'
    );
  }, [user]);

  const avatarUrl = React.useMemo(() => {
    if (!user) return '';
    const md: any = user.user_metadata || {};
    return md.avatar_url || md.picture || '';
  }, [user]);

  const initials = React.useMemo(() => {
    const name = displayName.trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    const letters = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    return letters.toUpperCase() || 'U';
  }, [displayName]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => navigateTo('/')}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-lg group-hover:bg-blue-500/30 transition-colors"></div>
                <SparklesIcon className="h-8 w-8 text-blue-400 relative" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">
                  Model Studio
                </h1>
                <p className="text-xs text-gray-500">AI Photography</p>
              </div>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-gray-800/60 border border-gray-700/60 rounded-lg p-1">
              <button
                onClick={() => navigateTo('/')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
                  currentPath === '/' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('/showcase')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
                  currentPath === '/showcase'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Showcase
              </button>
              <button
                onClick={() => navigateTo('/studio')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
                  currentPath === '/studio' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Studio
              </button>
              <button
                onClick={() => navigateTo('/gallery')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
                  currentPath === '/gallery' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => navigateTo('/upgrade')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
                  currentPath === '/upgrade' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Pricing
              </button>
            </nav>

            {/* Right side - Credits & User */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user && (
                <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold text-blue-400">{credits}</span>
                  <span className="hidden sm:inline text-xs text-gray-400">credits</span>
                </div>
              )}
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="flex items-center gap-1.5 sm:gap-2 focus:outline-none group min-w-0"
                    title={user.email || ''}
                  >
                    <span className="hidden md:block text-sm text-gray-200 font-medium group-hover:text-white transition-colors truncate max-w-[100px]">
                      {displayName}
                    </span>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="avatar" 
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-gray-700 group-hover:border-blue-500 object-cover transition-colors flex-shrink-0" 
                      />
                    ) : (
                      <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-xs sm:text-sm font-semibold border-2 border-gray-700 group-hover:border-blue-500 transition-colors flex-shrink-0">
                        {initials}
                      </span>
                    )}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                        <p className="text-sm font-medium text-gray-100">{displayName}</p>
                        {user.email && <p className="text-xs text-gray-400 truncate mt-1">{user.email}</p>}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={() => setShowAuthModal(true)} 
                  className="text-xs sm:text-sm py-2 px-3 sm:px-5 font-medium"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation - Better touch targets */}
          <nav className="md:hidden flex items-center gap-1 bg-gray-800/60 border border-gray-700/60 rounded-lg p-1 mt-3">
            <button
              onClick={() => navigateTo('/')}
              className={`flex-1 px-2 py-2.5 text-xs rounded-md font-medium transition-all duration-200 ${
                currentPath === '/' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('/showcase')}
              className={`flex-1 px-2 py-2.5 text-xs rounded-md font-medium transition-all duration-200 ${
                currentPath === '/showcase'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Showcase
            </button>
            <button
              onClick={() => navigateTo('/studio')}
              className={`flex-1 px-2 py-2.5 text-xs rounded-md font-medium transition-all duration-200 ${
                currentPath === '/studio' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => navigateTo('/gallery')}
              className={`flex-1 px-2 py-2.5 text-xs rounded-md font-medium transition-all duration-200 ${
                currentPath === '/gallery' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => navigateTo('/upgrade')}
              className={`flex-1 px-2 py-2.5 text-xs rounded-md font-medium transition-all duration-200 ${
                currentPath === '/upgrade' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Pricing
            </button>
          </nav>
        </div>
      </header>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;