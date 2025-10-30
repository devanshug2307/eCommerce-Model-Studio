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

  useEffect(() => {
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
      };
    }
  }, [user]);

  const handleBuy = () => {
    const el = document.getElementById('buy-credits-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="bg-gray-900/70 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center space-x-4">
          <SparklesIcon className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-gray-100">eCommerce Model Studio</h1>
            <p className="text-sm text-gray-400">AI-powered model photography for your products.</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <>
                <span className="text-sm text-gray-300 bg-gray-800 border border-gray-700/60 rounded-md px-3 py-1">
                  Credits: {credits}
                </span>
                <Button onClick={handleBuy} className="text-sm py-1 px-3">Buy Credits</Button>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {user.email}
                </span>
                <Button onClick={handleSignOut} variant="secondary" className="text-sm py-1 px-3">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowAuthModal(true)} className="text-sm py-1 px-3">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;