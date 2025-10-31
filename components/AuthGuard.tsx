import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import Spinner from './Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      setShowAuthModal(false);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800">
        <Spinner className="w-12 h-12 text-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-gray-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Authentication Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to access the application.</p>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => {
            setShowAuthModal(false);
            if (typeof window !== 'undefined' && window.location.pathname !== '/') {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }} 
        />
      </>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;

