import React, { useState } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { CreditPack, startCheckout } from '../services/creditsService';

type Plan = {
  title: string;
  price: string;
  description: string;
  pack: CreditPack;
  bullets: string[];
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    title: 'Trial',
    price: '₹99',
    description: 'Perfect for trying out our platform',
    pack: 100,
    bullets: [
      '100 credits for life (10 images)',
      'Access your generated images anytime',
      'Standard processing speed',
    ],
  },
  {
    title: 'Premium',
    price: '₹199',
    description: 'Great for small businesses/individuals',
    pack: 200,
    bullets: [
      '200 credits for life (20 images)',
      'Access your generated images anytime',
      'Access to new features',
      'Priority support from our founder',
      'Fast processing speed',
    ],
    highlight: true,
  },
  {
    title: 'Premium Plus',
    price: '₹299',
    description: 'For high-volume needs',
    pack: 300,
    bullets: [
      '300 credits for life (30 images)',
      'Access your generated images anytime',
      'Early access to new features',
      'Priority support from our founder',
      'Fast processing speed',
    ],
  },
];

const UpgradePage: React.FC = () => {
  const [loadingPack, setLoadingPack] = useState<CreditPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPack, setPendingPack] = useState<CreditPack | null>(null);
  const { user } = useAuth();

  const onBuy = async (pack: CreditPack) => {
    if (!user) {
      setPendingPack(pack);
      setAuthOpen(true);
      return;
    }
    try {
      setError(null);
      setLoadingPack(pack);
      const { url } = await startCheckout(pack);
      if (url) window.location.href = url;
    } catch (e: any) {
      setError(e?.message || 'Failed to start checkout');
    } finally {
      setLoadingPack(null);
    }
  };

  React.useEffect(() => {
    // If the user just signed in from the auth modal and selected a plan, resume checkout
    if (user && pendingPack && !authOpen) {
      onBuy(pendingPack);
      setPendingPack(null);
    }
  }, [user, authOpen]);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 min-h-screen font-sans">
      <Header />
      
      {/* Background gradient orbs */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <main className="max-w-7xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-block mb-3 sm:mb-4">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs sm:text-sm font-medium">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              Simple, Transparent Pricing
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
            Get credits to generate stunning AI model photos. One-time purchase, lifetime access.
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-300">
              <span className="text-blue-400 font-bold">10 Credits = 1 Image</span> · Credits never expire
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, idx) => (
            <div
              key={plan.title}
              className={`relative group ${plan.highlight ? 'md:-mt-4 md:mb-4 md:scale-105' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              )}
              <div
                className={`relative rounded-xl sm:rounded-2xl border ${
                  plan.highlight 
                    ? 'border-blue-500/60 bg-gray-900/90' 
                    : 'border-gray-700/50 bg-gray-900/60'
                } backdrop-blur-sm p-6 sm:p-8 shadow-xl hover:border-gray-600 transition-all duration-300 h-full flex flex-col`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">{plan.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{plan.description}</p>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm font-medium">one-time</span>
                  </div>
                  <div className="mt-2 inline-block px-2.5 sm:px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <span className="text-blue-400 font-semibold text-xs sm:text-sm">{plan.pack} Credits</span>
                    <span className="text-gray-400 text-xs ml-1">({plan.pack / 10} images)</span>
                  </div>
                </div>
                
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-6 sm:mb-8 flex-grow">
                  {plan.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300">{b}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full py-3 sm:py-3.5 text-sm sm:text-base font-semibold ${
                    plan.highlight 
                      ? 'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40' 
                      : ''
                  }`}
                  isLoading={loadingPack === plan.pack}
                  onClick={() => onBuy(plan.pack)}
                >
                  {plan.highlight ? 'Get Started' : 'Buy Now'}
                </Button>
                
                {error && loadingPack === plan.pack && (
                  <div className="mt-3 p-2 bg-red-900/30 border border-red-700/50 rounded-lg">
                    <p className="text-red-300 text-xs text-center">{error}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ or Features Section */}
        <div className="mt-12 sm:mt-20 max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              What You Get
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { icon: '🎨', title: 'Full Customization', desc: 'Control gender, age, ethnicity, pose, and background' },
              { icon: '🖼️', title: 'High Resolution', desc: 'Professional quality images ready for your store' },
              { icon: '♾️', title: 'Lifetime Access', desc: 'Credits never expire, use them whenever you need' },
              { icon: '⚡', title: 'Fast Generation', desc: 'Get your images in 30-60 seconds' },
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm hover:border-gray-600 transition-all">
                <div className="text-3xl sm:text-4xl">{feature.icon}</div>
                <div>
                  <h4 className="font-semibold text-white mb-1 text-sm sm:text-base">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-10 sm:mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-gray-400 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure Payment
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              No Subscriptions
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Instant Access
            </div>
          </div>
        </div>
      </main>
      
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode="login" />
    </div>
  );
};

export default UpgradePage;


