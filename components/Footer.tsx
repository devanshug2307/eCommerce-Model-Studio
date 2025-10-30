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
    <footer className="bg-soft-cream border-t border-gray-200 mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-deep-teal flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-rich-black">Model Studio</h2>
                <p className="text-xs text-gray-500">AI Photography</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm max-w-md mb-6 leading-relaxed">
              Transform your product photos into professional model images with AI.
              No photoshoot required, no expensive equipment—just AI magic.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-rich-black mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => navigateTo('/')}
                  className="text-gray-600 hover:text-deep-teal text-sm transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/studio')}
                  className="text-gray-600 hover:text-deep-teal text-sm transition-colors"
                >
                  Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/upgrade')}
                  className="text-gray-600 hover:text-deep-teal text-sm transition-colors"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-rich-black mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-deep-teal text-sm transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-deep-teal text-sm transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-deep-teal text-sm transition-colors"
                >
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              © {currentYear} Model Studio. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs">
              Made with AI-powered technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
