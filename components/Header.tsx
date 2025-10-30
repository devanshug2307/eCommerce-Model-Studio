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
      syncCredits().then(() => setCredits(getCredits())).catch(console.error);

      let syncCounter = 0;
      const refresh = () => {
        setCredits(getCredits());
        syncCounter++;
        if (syncCounter >= 6) {
          syncCounter = 0;
          syncCredits().then(() => setCredits(getCredits())).catch(console.error);
        }
      };

      refresh();
      const id = setInterval(refresh, 5000);
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigateTo('/')}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-deep-teal flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-rich-black group-hover:text-deep-teal transition-colors">
                  Model Studio
                </h1>
                <p className="text-xs text-gray-500">AI Photography</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigateTo('/')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPath === '/'
                    ? 'bg-teal-light text-deep-teal'
                    : 'text-gray-600 hover:text-rich-black hover:bg-gray-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('/studio')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPath === '/studio'
                    ? 'bg-teal-light text-deep-teal'
                    : 'text-gray-600 hover:text-rich-black hover:bg-gray-50'
                }`}
              >
                Studio
              </button>
              <button
                onClick={() => navigateTo('/upgrade')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPath === '/upgrade'
                    ? 'bg-teal-light text-deep-teal'
                    : 'text-gray-600 hover:text-rich-black hover:bg-gray-50'
                }`}
              >
                Pricing
              </button>
            </nav>

            {/* Right side - Credits & User */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 bg-teal-light border border-deep-teal/20 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-deep-teal" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-deep-teal">{credits}</span>
                  <span className="hidden sm:inline text-xs text-gray-600">credits</span>
                </div>
              )}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="flex items-center gap-2 focus:outline-none group"
                    title={user.email || ''}
                  >
                    <span className="hidden md:block text-sm text-gray-700 font-medium group-hover:text-rich-black transition-colors">
                      {displayName}
                    </span>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-9 w-9 rounded-full border-2 border-gray-200 group-hover:border-deep-teal object-cover transition-colors"
                      />
                    ) : (
                      <span className="h-9 w-9 rounded-full bg-deep-teal text-white flex items-center justify-center text-sm font-semibold border-2 border-transparent group-hover:border-teal-hover transition-colors">
                        {initials}
                      </span>
                    )}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-medium text-rich-black">{displayName}</p>
                        {user.email && <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                  variant="primary"
                  className="text-sm py-2 px-5"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-2 mt-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => navigateTo('/')}
              className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-md transition-all duration-200 ${
                currentPath === '/'
                  ? 'bg-white text-deep-teal shadow-sm'
                  : 'text-gray-600 hover:text-rich-black'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('/studio')}
              className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-md transition-all duration-200 ${
                currentPath === '/studio'
                  ? 'bg-white text-deep-teal shadow-sm'
                  : 'text-gray-600 hover:text-rich-black'
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => navigateTo('/upgrade')}
              className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-md transition-all duration-200 ${
                currentPath === '/upgrade'
                  ? 'bg-white text-deep-teal shadow-sm'
                  : 'text-gray-600 hover:text-rich-black'
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
