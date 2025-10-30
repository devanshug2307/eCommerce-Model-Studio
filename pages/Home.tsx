import React from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const startStudio = () => {
    if (window.location.pathname !== '/studio') {
      window.history.pushState({}, '', '/studio');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 min-h-screen">
      <Header />
      
      {/* Hero Section with modern gradient background */}
      <main className="relative overflow-hidden">
        {/* Gradient orbs for visual interest */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          {/* Hero Content */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  AI-Powered Photography
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Transform Products
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Into Model Photos
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-xl leading-relaxed">
                Upload your clothing photos and generate stunning, professional model images in seconds. 
                No photoshoot required, no expensive equipment—just AI magic.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                <Button 
                  onClick={startStudio} 
                  className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Creating Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 sm:gap-8 pt-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">10K+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Images Generated</div>
                </div>
                <div className="w-px h-10 sm:h-12 bg-gray-700"></div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Happy Creators</div>
                </div>
              </div>
            </div>

            {/* Hero Image with modern effects */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative rounded-2xl overflow-hidden border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1374&auto=format&fit=crop"
                  alt="AI Model Preview"
                  className="w-full h-full object-cover aspect-[3/4]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
              </div>
            </div>
          </section>

          {/* Before/After Showcase Section */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  See The Magic In Action
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
                Drag the slider to see how our AI transforms simple product photos into professional model images
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* First Example */}
              <div className="aspect-[3/4] relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-full border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
                  <BeforeAfterSlider
                    beforeImage="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"
                    afterImage="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
                    beforeLabel="Product Only"
                    afterLabel="AI Generated"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">Fashion T-Shirt Transformation</p>
                </div>
              </div>

              {/* Second Example */}
              <div className="aspect-[3/4] relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-full border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
                  <BeforeAfterSlider
                    beforeImage="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop"
                    afterImage="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop"
                    beforeLabel="Original"
                    afterLabel="With Model"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">Clothing Item to Lifestyle Shot</p>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-gray-900/40 border border-gray-700/50 backdrop-blur-sm">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-semibold text-white mb-2">Perfect Fit</h4>
                <p className="text-sm text-gray-400">AI ensures clothing looks natural on every model</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gray-900/40 border border-gray-700/50 backdrop-blur-sm">
                <div className="text-3xl mb-2">✨</div>
                <h4 className="font-semibold text-white mb-2">Studio Quality</h4>
                <p className="text-sm text-gray-400">Professional lighting and composition automatically</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gray-900/40 border border-gray-700/50 backdrop-blur-sm">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-white mb-2">Instant Results</h4>
                <p className="text-sm text-gray-400">Generate multiple variations in seconds</p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-16 sm:mb-24">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Simple 3-Step Process
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
                From upload to download in minutes. No technical skills required.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Upload Product',
                  description: 'Upload your clothing or product photo. Our AI will analyze and prepare it for transformation.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Customize Model',
                  description: 'Choose gender, ethnicity, age, pose, and background. Make it perfectly match your brand.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Generate & Download',
                  description: 'Click generate and watch AI create photorealistic images ready for your e-commerce store.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ),
                },
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-8 rounded-2xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm hover:border-gray-600 transition-all duration-300">
                    <div className="text-5xl font-bold text-gray-700/50 mb-4">{item.step}</div>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 mb-6">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Grid */}
          <section className="mb-16 sm:mb-24">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Why Choose Our Platform
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: '⚡', title: 'Lightning Fast', desc: 'Generate images in seconds' },
                { icon: '🎨', title: 'Full Control', desc: 'Customize every detail' },
                { icon: '💎', title: 'High Quality', desc: 'Professional results' },
                { icon: '💰', title: 'Cost Effective', desc: 'No expensive photoshoots' },
              ].map((feature, idx) => (
                <div key={idx} className="p-4 sm:p-6 rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm hover:border-gray-600 transition-all duration-300 text-center">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{feature.icon}</div>
                  <h4 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12 sm:py-20 relative px-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Ready to Transform Your Product Photos?
                </span>
              </h2>
              <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join hundreds of brands creating stunning model photos with AI
              </p>
              <Button 
                onClick={startStudio} 
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
              >
                Get Started Now - It's Free
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;


