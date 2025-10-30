import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import OptionsPanel from './components/OptionsPanel';
import Button from './components/Button';
import Spinner from './components/Spinner';
import { ModelOptions, GeneratedImage } from './types';
import { generateImageBatch, generateImageVariation } from './services/geminiService';
import BuyCredits from './components/BuyCredits';
import { consumeCredits, creditsNeededPerImage, syncCredits } from './services/creditsService';

// Icons for buttons
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-3.182 3.182l.001.002a3 3 0 0 0 3.182 3.182l.002.001a3 3 0 0 0 3.182-3.182l-.001-.002a3 3 0 0 0-3.182-3.182Zm-3.182 0a3 3 0 0 0-3.182-3.182l-.001-.002a3 3 0 0 0-3.182 3.182l.001.002a3 3 0 0 0 3.182 3.182l.002-.001a3 3 0 0 0 3.182-3.182l-.001-.002ZM12.75 12.75a3 3 0 0 0-3.182-3.182l-.002-.001a3 3 0 0 0-3.182 3.182l.002.001a3 3 0 0 0 3.182 3.182l.001.002a3 3 0 0 0 3.182-3.182l-.001-.002Zm3.182-3.182a3 3 0 0 0-3.182-3.182l-.002-.001a3 3 0 0 0-3.182 3.182l.002.001a3 3 0 0 0 3.182 3.182l.001.002a3 3 0 0 0 3.182-3.182l-.001-.002Z" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);


function App() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<ModelOptions>({
    gender: 'Woman',
    age: 'Young Adult (18-25)',
    ethnicity: 'Caucasian',
    background: 'Studio White',
    imagesCount: 3,
  });
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingVariationId, setGeneratingVariationId] = useState<string | null>(null);

  // Sync credits from database on mount and after payment
  useEffect(() => {
    // Sync credits when app loads
    syncCredits().catch(console.error);

    // Check if returning from payment
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status === 'success') {
      // Sync credits after successful payment
      syncCredits().catch(console.error);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    setProductImage(file);
    if (productImageUrl) {
      URL.revokeObjectURL(productImageUrl);
    }
    setProductImageUrl(URL.createObjectURL(file));
    setGeneratedImages([]);
    setError(null);
  }, [productImageUrl]);

  const handleGenerateClick = async () => {
    if (!productImage) {
      setError('Please upload a product image first.');
      return;
    }
    const imagesCount = options.imagesCount || 3;
    const need = creditsNeededPerImage() * imagesCount;
    const use = await consumeCredits(need);
    if (!use.ok) {
      setError(use.error || `Not enough credits. You need ${need} credits per batch.`);
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const results = await generateImageBatch(productImage, options, imagesCount);
      const newImages: GeneratedImage[] = results.map((result, index) => ({
        id: `base-${Date.now()}-${index}`,
        src: result.src,
        category: result.category,
      }));
      setGeneratedImages(newImages);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariationClick = async (baseImage: GeneratedImage) => {
    if (!productImage) return;

    const need = creditsNeededPerImage();
    const use = await consumeCredits(need);
    if (!use.ok) {
      setError(use.error || `Not enough credits. You need ${need} credits per variation.`);
      return;
    }

    setGeneratingVariationId(baseImage.id);
    setError(null);

    try {
      const variationSrc = await generateImageVariation(productImage, options, baseImage.src);
      const variationImage: GeneratedImage = {
        id: `var-${baseImage.id}-${Date.now()}`,
        src: variationSrc,
        category: `Variation`,
        parentId: baseImage.id,
      };

      const parentIndex = generatedImages.findIndex(img => img.id === baseImage.id);
      if (parentIndex !== -1) {
        const newImages = [...generatedImages];
        newImages.splice(parentIndex + 1, 0, variationImage);
        setGeneratedImages(newImages);
      } else {
        setGeneratedImages(prev => [...prev, variationImage]);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred generating the variation.');
      console.error(err);
    } finally {
      setGeneratingVariationId(null);
    }
  };

  const handleDownloadClick = (src: string, category: string) => {
    const link = document.createElement('a');
    link.href = src;
    const filename = `${category.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isGenerateDisabled = !productImage || isLoading;

  return (
    <div className="bg-gray-800 text-gray-100 min-h-screen font-sans">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-1 flex flex-col space-y-8">
            <ImageUploader onImageSelect={handleImageSelect} selectedImageUrl={productImageUrl} />
            <OptionsPanel options={options} setOptions={setOptions} isDisabled={isLoading} />
            <div className="sticky bottom-0 py-4 bg-gray-800/80 backdrop-blur-sm">
                <Button 
                    onClick={handleGenerateClick} 
                    isLoading={isLoading} 
                    disabled={isGenerateDisabled}
                    className="w-full text-lg py-3"
                    icon={<SparklesIcon className="h-5 w-5" />}
                >
                    Generate Model Photos
                </Button>
                {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold leading-6 text-gray-100 mb-1">
              3. Generated Photos
            </h3>
            <p className="text-sm text-gray-400 mb-6">Review the generated images. Click the magic wand to generate a variation.</p>

            {isLoading && (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                <Spinner className="w-12 h-12 text-blue-400" />
                <p className="mt-4 text-lg text-gray-300">Generating images...</p>
                <p className="text-sm text-gray-500">This may take a moment.</p>
              </div>
            )}
            
            {!isLoading && generatedImages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-lg">
                <p className="text-lg text-gray-500">Your generated images will appear here.</p>
                <p className="text-sm text-gray-600">Upload an image and set your options to get started.</p>
              </div>
            )}

            {!isLoading && generatedImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map(image => (
                  <div key={image.id} className={`group bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col ${image.parentId ? 'ml-6 border-l-2 border-blue-500/30' : ''}`}>
                    <div className="relative overflow-hidden">
                      <img src={image.src} alt={image.category} className="w-full h-auto object-cover aspect-[4/5] transition-transform duration-300 ease-in-out group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <h4 className="text-white text-lg font-bold truncate">{image.category}</h4>
                      </div>
                    </div>
                    <div className="p-2 bg-gray-800/50 flex items-center gap-2 border-t border-gray-700/50">
                      {!image.parentId && (
                        <Button
                          variant="secondary"
                          className="flex-1 text-xs py-2"
                          onClick={() => handleVariationClick(image)}
                          isLoading={generatingVariationId === image.id}
                          disabled={!!generatingVariationId}
                          title="Generate a new variation"
                          icon={<WandIcon className="h-4 w-4" />}
                        >
                          Variation
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        className="flex-1 text-xs py-2"
                        onClick={() => handleDownloadClick(image.src, image.category)}
                        title="Download Image"
                        icon={<DownloadIcon className="h-4 w-4" />}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>
      <section id="buy-credits-panel" className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
        <BuyCredits />
      </section>
    </div>
  );
}

export default App;
