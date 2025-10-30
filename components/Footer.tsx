import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer className="bg-black border-t border-white/10 mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-lg"></div>
                <svg
                  className="h-8 w-8 text-purple-400 relative"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">Model Studio</h2>
              </div>
            </div>
            <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed font-light">
              Transform your product photos into professional fashion imagery with AI.
              No photoshoot required—just upload, customize, and create.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {/* You can add social media links here */}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => navigateTo('/')}
                  className="text-gray-500 hover:text-white text-sm transition-colors font-light"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/studio')}
                  className="text-gray-500 hover:text-white text-sm transition-colors font-light"
                >
                  Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/upgrade')}
                  className="text-gray-500 hover:text-white text-sm transition-colors font-light"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-white text-sm transition-colors font-light"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-white text-sm transition-colors font-light"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-white text-sm transition-colors font-light"
                >
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left font-light">
              © {currentYear} Model Studio. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs font-light">
              Powered by AI technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
