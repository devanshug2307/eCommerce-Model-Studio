import React from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const startTryOn = () => {
    if (user) {
      if (window.location.pathname !== '/studio') {
        window.history.pushState({}, '', '/studio');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } else {
      // Open auth via custom event the Header listens for by toggling modal
      // Fallback: navigate to /studio which will trigger AuthGuard
      if (window.location.pathname !== '/studio') {
        window.history.pushState({}, '', '/studio');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  return (
    <div className="bg-gray-800 text-gray-100 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
              Create Lifelike
              <br />
              Model Photoshoots
              <br />
              <span className="text-blue-400">in Seconds</span>
            </h1>
            <p className="mt-6 text-gray-300 max-w-xl">
              Upload your clothing photos and let our AI generate stunning, realistic
              model images for your e‑commerce store. No studio, no problem.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Button onClick={startTryOn} className="px-6 py-3 text-base">
                Start Your Virtual Try‑On
              </Button>
              <button
                onClick={() => {
                  if (window.location.pathname !== '/upgrade') {
                    window.history.pushState({}, '', '/upgrade');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="text-gray-300 hover:text-white underline underline-offset-4"
              >
                View Pricing
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-900/40 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1374&auto=format&fit=crop"
              alt="Model preview"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center">How It Works</h2>
          <p className="text-gray-400 text-center mt-2">
            A simple, powerful workflow to revolutionize your product photography.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-6">
              <h3 className="font-semibold">Upload & Transform</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Upload a flat apparel photo. Our AI instantly fits it on a model.
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-6">
              <h3 className="font-semibold">Customize Your Model</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Choose poses, styles, backgrounds, and model attributes.
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-6">
              <h3 className="font-semibold">Generate Photos</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Create high‑resolution, photoreal images ready for your store.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center">Trending Styles</h2>
          <p className="text-gray-400 text-center mt-2">Get inspired by looks others are creating.</p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-700 bg-gray-900/40">
                <img
                  src={`https://images.unsplash.com/photo-1520975933861-923f0d0198b4?q=80&auto=format&fit=crop&w=${400 + i*5}`}
                  alt="style"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;


