import React from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import Testimonial from '../components/Testimonial';
import FAQAccordion from '../components/FAQ';
import Footer from '../components/Footer';
import StatsCounter from '../components/StatsCounter';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const startStudio = () => {
    if (window.location.pathname !== '/studio') {
      window.history.pushState({}, '', '/studio');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // FAQ data
  const faqItems = [
    {
      question: "How does the AI model generation work?",
      answer: "Simply upload your product photo, choose your model preferences (gender, age, ethnicity, background), and our AI generates professional model images wearing your product. The process takes 30-60 seconds and produces photorealistic results."
    },
    {
      question: "What image formats do you support?",
      answer: "We support all common image formats including JPG, PNG, and WEBP. For best results, use high-quality product photos with good lighting and a clear view of the garment."
    },
    {
      question: "How many credits do I need?",
      answer: "Each image generation costs 10 credits. You can purchase credit packs starting from 100 credits (10 images) for ₹99. Credits never expire, so you can use them whenever you need."
    },
    {
      question: "Can I edit the generated images?",
      answer: "Yes! Every generated image can be edited using our built-in image editor. You can adjust brightness, contrast, add text, crop, and more. You can also generate variations of any image you like."
    },
    {
      question: "What if I'm not satisfied with the results?",
      answer: "You can generate multiple variations of each image using additional credits. Our AI learns from your preferences and improves with each generation. We're confident you'll love the results!"
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a satisfaction guarantee. If you're not happy with your first purchase, contact us within 7 days for a full refund, no questions asked."
    }
  ];

  return (
    <div className="bg-black text-gray-100 min-h-screen font-sans">
      <Header />

      {/* Hero Section with elegant design */}
      <main className="relative overflow-hidden">
        {/* Subtle gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-96 bg-gradient-to-tl from-pink-900/5 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          {/* Hero Content */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-32">
            <div className="space-y-8 lg:space-y-10">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-gray-300 text-sm font-medium backdrop-blur-sm">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  AI-Powered Fashion Photography
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-bold leading-[1.1] tracking-tight">
                <span className="text-white">
                  Create Stunning
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
                  Model Photography
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-xl leading-relaxed font-light">
                Transform your product photos into professional fashion imagery with AI models.
                No photoshoot, no studio—just stunning results in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 pt-6">
                <Button
                  onClick={startStudio}
                  className="w-full sm:w-auto px-10 py-5 text-base sm:text-lg font-semibold shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <span className="flex items-center justify-center gap-2.5">
                    Start Creating
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>

                <button className="px-10 py-5 text-base sm:text-lg font-medium border border-white/20 hover:border-white/40 rounded-lg transition-all duration-300 hover:bg-white/5">
                  View Examples
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-8 sm:gap-12 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl sm:text-4xl font-display font-bold text-white">15K+</div>
                  <div className="text-sm sm:text-base text-gray-500 font-light mt-1">Images Created</div>
                </div>
                <div className="w-px h-12 sm:h-14 bg-white/10"></div>
                <div>
                  <div className="text-3xl sm:text-4xl font-display font-bold text-white">800+</div>
                  <div className="text-sm sm:text-base text-gray-500 font-light mt-1">Fashion Brands</div>
                </div>
              </div>
            </div>

            {/* Hero Image with elegant styling */}
            <div className="relative lg:h-[700px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-pink-500/10 to-transparent rounded-3xl blur-3xl"></div>
              <div className="relative h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
                  alt="Fashion Model Photography"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                    <p className="text-sm font-medium text-white">AI-Generated Fashion Photography</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Before/After Showcase Section */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 text-white">
                See The Transformation
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto font-light">
                Drag the slider to see how AI transforms product photos into professional fashion imagery
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 max-w-6xl mx-auto">
              {/* First Example */}
              <div className="aspect-[3/4] relative group">
                <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-full border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  <BeforeAfterSlider
                    beforeImage="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"
                    afterImage="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
                    beforeLabel="Product"
                    afterLabel="AI Model"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-base font-light">From flat lay to fashion model</p>
                </div>
              </div>

              {/* Second Example */}
              <div className="aspect-[3/4] relative group">
                <div className="absolute -inset-2 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-full border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  <BeforeAfterSlider
                    beforeImage="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop"
                    afterImage="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop"
                    beforeLabel="Original"
                    afterLabel="Enhanced"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-base font-light">Professional lifestyle imagery</p>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Perfect Fit</h4>
                <p className="text-sm text-gray-400 font-light leading-relaxed">Clothing naturally adapts to every model</p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Studio Quality</h4>
                <p className="text-sm text-gray-400 font-light leading-relaxed">Professional lighting & composition</p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Instant Results</h4>
                <p className="text-sm text-gray-400 font-light leading-relaxed">Generate variations in seconds</p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 text-white">
                How It Works
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto font-light">
                From upload to professional imagery in three simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 max-w-6xl mx-auto">
              {[
                {
                  step: '01',
                  title: 'Upload',
                  description: 'Upload your product photo. Our AI analyzes and prepares it for transformation.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Customize',
                  description: 'Select model attributes, poses, and backgrounds to match your brand identity.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Generate',
                  description: 'Watch AI create photorealistic fashion imagery ready for your store.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ),
                },
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="relative p-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="text-7xl font-display font-bold text-white/5 absolute top-6 right-6">{item.step}</div>
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 mb-6">
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-semibold mb-4 text-white">{item.title}</h3>
                      <p className="text-gray-400 leading-relaxed font-light">{item.description}</p>
                    </div>
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

          {/* Stats Section */}
          <section className="mb-24 py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatsCounter value={15000} label="Images Generated" suffix="+" />
              <StatsCounter value={800} label="Happy Customers" suffix="+" />
              <StatsCounter value={50} label="Time Saved Per Shoot" suffix="h" />
              <StatsCounter value={95} label="Customer Satisfaction" suffix="%" />
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Perfect For Every Business
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                Whether you're a solo entrepreneur or a growing brand, we've got you covered
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: '🛍️',
                  title: 'E-commerce Stores',
                  description: 'Create consistent, professional product photos for your online store without expensive photoshoots.',
                  color: 'from-blue-500/10 to-blue-600/10'
                },
                {
                  icon: '👔',
                  title: 'Fashion Brands',
                  description: 'Showcase your latest collections on diverse models with various poses and backgrounds instantly.',
                  color: 'from-purple-500/10 to-purple-600/10'
                },
                {
                  icon: '📱',
                  title: 'Social Media Creators',
                  description: 'Generate eye-catching content for Instagram, TikTok, and other platforms in minutes.',
                  color: 'from-pink-500/10 to-pink-600/10'
                },
                {
                  icon: '🎨',
                  title: 'Fashion Designers',
                  description: 'Visualize your designs on models before production, save time and reduce costs.',
                  color: 'from-green-500/10 to-green-600/10'
                },
                {
                  icon: '🏪',
                  title: 'Boutique Owners',
                  description: 'Compete with large retailers by creating professional model photos on a small budget.',
                  color: 'from-orange-500/10 to-orange-600/10'
                },
                {
                  icon: '📸',
                  title: 'Marketing Agencies',
                  description: 'Deliver stunning visuals to clients faster and more cost-effectively than traditional shoots.',
                  color: 'from-indigo-500/10 to-indigo-600/10'
                }
              ].map((useCase, idx) => (
                <div
                  key={idx}
                  className="group p-6 rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm hover:border-gray-600 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${useCase.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {useCase.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{useCase.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{useCase.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Loved by Creators Worldwide
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                See what our customers have to say about their experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Testimonial
                quote="This tool saved me thousands on photoshoots! The quality is incredible and my conversion rates have doubled since using these images on my store."
                author="Priya Sharma"
                role="Founder"
                company="StyleHub Fashion"
                rating={5}
              />
              <Testimonial
                quote="As a small boutique owner, I couldn't afford model photoshoots. This platform changed everything. Now I can compete with big brands!"
                author="Rahul Mehta"
                role="Owner"
                company="Urban Threads"
                rating={5}
              />
              <Testimonial
                quote="The AI generates such realistic images! My customers can't tell the difference. It's been a game-changer for my online business."
                author="Anita Desai"
                role="E-commerce Manager"
                company="Chic Collections"
                rating={5}
              />
            </div>
          </section>

          {/* Comparison Section - Why Choose Us */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Traditional Photoshoot vs AI Studio
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                See why thousands are switching to AI-powered photography
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-700/30 rounded-2xl overflow-hidden">
                {/* Traditional */}
                <div className="bg-gray-900/60 p-6 sm:p-8">
                  <div className="text-center mb-6">
                    <div className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-semibold mb-2">
                      Traditional Photoshoot
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {[
                      { text: '₹5,000 - ₹50,000 per shoot', icon: '💸' },
                      { text: 'Takes 2-4 weeks to complete', icon: '⏰' },
                      { text: 'Limited model diversity', icon: '🚫' },
                      { text: 'Expensive location & equipment', icon: '📸' },
                      { text: 'Difficult to make changes', icon: '❌' },
                      { text: 'Weather & scheduling dependent', icon: '☁️' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-400">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Studio */}
                <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6 sm:p-8 border-l border-gray-700/50">
                  <div className="text-center mb-6">
                    <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-semibold mb-2">
                      AI Model Studio
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {[
                      { text: 'Starting at just ₹99 (10 images)', icon: '💰' },
                      { text: 'Results in 30-60 seconds', icon: '⚡' },
                      { text: 'Unlimited model options', icon: '✨' },
                      { text: 'No equipment needed', icon: '🎯' },
                      { text: 'Edit & regenerate anytime', icon: '✅' },
                      { text: 'Work from anywhere, anytime', icon: '🌍' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                Everything you need to know about our AI model studio
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <FAQAccordion items={faqItems} />
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="text-center py-16 sm:py-24 relative px-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Ready to Transform Your Product Photos?
                </span>
              </h2>
              <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join hundreds of brands creating stunning model photos with AI. Start free today!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Button
                  onClick={startStudio}
                  className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    Start Creating Free
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required • 7-day money back guarantee
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;


