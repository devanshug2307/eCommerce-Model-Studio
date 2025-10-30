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
    price: '$5.99',
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
    price: '$19',
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
    price: '$39',
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
    <div className="bg-gray-800 text-gray-100 min-h-screen font-sans">
      <Header />
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Choose Your Plan</h2>
          <p className="text-gray-400 mt-2">Select the perfect plan for your needs</p>
          <div className="inline-block mt-3 text-xs text-gray-400 bg-gray-900 border border-gray-700 rounded px-2 py-1">10 Credits = 1 Image</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.title}
              className={`rounded-xl border ${plan.highlight ? 'border-blue-500/60' : 'border-gray-700/50'} bg-gray-900/60 p-6 shadow`}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{plan.title}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>
              <div className="text-3xl font-bold mb-4">{plan.price}
                <span className="text-base text-gray-400 font-normal">/One Time</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                {plan.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                isLoading={loadingPack === plan.pack}
                onClick={() => onBuy(plan.pack)}
              >
                Add Credits
              </Button>
              {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            </div>
          ))}
        </div>
      </main>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode="login" />
    </div>
  );
};

export default UpgradePage;


