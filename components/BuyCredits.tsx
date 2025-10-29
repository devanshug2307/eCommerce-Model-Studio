import React, { useState } from 'react';
import Button from './Button';
import { CreditPack, startCheckout } from '../services/creditsService';

const PACKS: CreditPack[] = [100, 200, 300];

const BuyCredits: React.FC = () => {
  const [loadingPack, setLoadingPack] = useState<CreditPack | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onBuy = async (pack: CreditPack) => {
    try {
      setError(null);
      setLoadingPack(pack);
      const { url } = await startCheckout(pack);
      if (url && url !== '/') {
        window.location.href = url;
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to start checkout.');
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-2">Buy Credits</h3>
      <p className="text-sm text-gray-400 mb-4">Purchase credits to generate images. 10 credits per image.</p>
      <div className="grid grid-cols-3 gap-3">
        {PACKS.map((pack) => (
          <Button
            key={pack}
            onClick={() => onBuy(pack)}
            isLoading={loadingPack === pack}
            className="w-full"
          >
            {pack} credits
          </Button>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  );
};

export default BuyCredits;



