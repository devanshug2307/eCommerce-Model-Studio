import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import OptionsPanel from './components/OptionsPanel';
import ImageEditorModal from './components/ImageEditorModal';
import Button from './components/Button';
import Spinner from './components/Spinner';
import { ModelOptions, GeneratedImage } from './types';
import { generateImageBatch, generateImageVariation } from './services/geminiService';
import { uploadToGallery } from './services/galleryService';
import { consumeCredits, creditsNeededPerImage, syncCredits, getCredits } from './services/creditsService';

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
    gender: 'Female',
    age: 'Young Adult (18-25)',
    ethnicity: 'Caucasian',
    background: 'Studio White',
    pose: 'Standing',
    imagesCount: 3,
  });
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingVariationId, setGeneratingVariationId] = useState<string | null>(null);
  const [editorTargetId, setEditorTargetId] = useState<string | null>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [usePersonPhoto, setUsePersonPhoto] = useState<boolean>(false);
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [personImageUrl, setPersonImageUrl] = useState<string | null>(null);
  const [moreCount, setMoreCount] = useState<number>(3);

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

  // Prefill options from URL params for Showcase deep-links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let changed = false;
    const next: Partial<ModelOptions> = {};
    const get = (k: string) => params.get(k) || undefined;
    const g = get('gender');
    if (g && (g === 'Female' || g === 'Male')) { next.gender = g as any; changed = true; }
    const a = get('age');
    const ageVals: ModelOptions['age'][] = ['Young Adult (18-25)','Adult (25-40)','Teenager (13-17)','Child (3-7)'];
    if (a && ageVals.includes(a as any)) { next.age = a as any; changed = true; }
    const e = get('ethnicity');
    const ethVals: ModelOptions['ethnicity'][] = ['Asian','Black','Caucasian','Hispanic','Indian','Middle Eastern'];
    if (e && ethVals.includes(e as any)) { next.ethnicity = e as any; changed = true; }
    const b = get('background');
    const bgVals: ModelOptions['background'][] = ['Studio White','Studio Gray','Outdoor Urban','Outdoor Nature'];
    if (b && bgVals.includes(b as any)) { next.background = b as any; changed = true; }
    const p = get('pose');
    const poseVals: NonNullable<ModelOptions['pose']>[] = ['Standing','Walking','Seated','Half-body','Close-up'];
    if (p && poseVals.includes(p as any)) { next.pose = p as any; changed = true; }
    if (changed) {
      setOptions(prev => ({ ...prev, ...next }));
      // Optionally clean URL (keep other params like status)
      const kept = new URLSearchParams(window.location.search);
      ['gender','age','ethnicity','background','pose'].forEach(k => kept.delete(k));
      const qs = kept.toString();
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState({}, document.title, url);
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

  const handlePersonSelect = useCallback((file: File) => {
    setPersonImage(file);
    if (personImageUrl) {
      URL.revokeObjectURL(personImageUrl);
    }
    setPersonImageUrl(URL.createObjectURL(file));
  }, [personImageUrl]);

  const applyEditedOutputReplace = async (dataUrl: string) => {
    try {
      if (!editorTargetId) return;
      setGeneratedImages(prev => prev.map(img => img.id === editorTargetId ? { ...img, src: dataUrl, category: img.category + ' (Edited)' } : img));
      setEditorTargetId(null);
      setEditorSrc(null);
      setEditorOpen(false);
    } catch (e) {
      console.error('Failed to apply edited image', e);
      setError('Failed to apply edited image');
    }
  };

  const handleEditClick = (image: GeneratedImage) => {
    setEditorTargetId(image.id);
    setEditorSrc(image.src);
    setEditorOpen(true);
    // scroll to editor panel
    // no-op (modal opens)
  };

  const applyEditedOutputNew = async (dataUrl: string) => {
    try {
      if (!editorTargetId) return;
      const parentIndex = generatedImages.findIndex(img => img.id === editorTargetId);
      const newImage: GeneratedImage = {
        id: `edit-${editorTargetId}-${Date.now()}`,
        src: dataUrl,
        category: 'Edited Version',
        parentId: editorTargetId,
      };
      if (parentIndex !== -1) {
        const next = [...generatedImages];
        next.splice(parentIndex + 1, 0, newImage);
        setGeneratedImages(next);
      } else {
        setGeneratedImages(prev => [newImage, ...prev]);
      }
      setEditorTargetId(null);
      setEditorSrc(null);
      setEditorOpen(false);
    } catch (e) {
      console.error('Failed to create new edited image', e);
      setError('Failed to create new edited image');
    }
  };

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
      const results = await generateImageBatch(
        productImage,
        options,
        imagesCount,
        usePersonPhoto && personImage ? personImage : undefined
      );
      const newImages: GeneratedImage[] = results.map((result, index) => ({
        id: `base-${Date.now()}-${index}`,
        src: result.src,
        category: result.category,
      }));
      setGeneratedImages(newImages);

      // Save each generated image to the user's gallery (best-effort)
      try {
        await Promise.all(
          newImages.map(async (img) => {
            await uploadToGallery(img.src, {
              background: options.background,
              category: img.category,
              ...(usePersonPhoto ? {} : { gender: options.gender, age: options.age, ethnicity: options.ethnicity })
            });
          })
        );
      } catch {}
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
  const estimatedCost = creditsNeededPerImage() * (options.imagesCount || 3);
  const availableCredits = getCredits();
  const insufficientCredits = availableCredits < estimatedCost;

  const estimatedMoreCost = creditsNeededPerImage() * (moreCount || 1);
  const insufficientCreditsMore = availableCredits < estimatedMoreCost;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 min-h-screen font-sans">
      <Header />
      
      {/* Background gradient orbs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 relative">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-block mb-2">
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs sm:text-sm font-medium">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              AI-Powered Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Create Professional Model Photos
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            Transform your product images into stunning model photos in seconds. Just upload, customize, and generate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-1 flex flex-col space-y-4 sm:space-y-6">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-2 sm:-left-3 top-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">1</div>
              <div className="pl-5 sm:pl-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 uppercase tracking-wider">Upload Product</h3>
                <ImageUploader onImageSelect={handleImageSelect} selectedImageUrl={productImageUrl} />
              </div>
            </div>

            {/* Optional Person Photo */}
            <div className="relative">
              <div className="absolute -left-2 sm:-left-3 top-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">2</div>
              <div className="pl-5 sm:pl-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Use My Photo (Optional)</h3>
                  <button
                    onClick={() => setUsePersonPhoto(v => !v)}
                    className={`px-2.5 py-1 text-[11px] rounded-md border ${usePersonPhoto ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'}`}
                  >
                    {usePersonPhoto ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {usePersonPhoto && (
                  <>
                    <p className="text-[11px] text-gray-500 mb-2">Upload a clear, front-facing photo for best results.</p>
                    <ImageUploader onImageSelect={handlePersonSelect} selectedImageUrl={personImageUrl} />
                  </>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-2 sm:-left-3 top-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">3</div>
              <div className="pl-5 sm:pl-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 uppercase tracking-wider">Customize Model</h3>
                <OptionsPanel options={options} setOptions={setOptions} isDisabled={isLoading} hideModelAttributes={usePersonPhoto} />
              </div>
            </div>

            {/* Step 4 - Generate Button */}
            <div className="relative lg:sticky lg:bottom-4 pt-2 sm:pt-4">
              <div className="absolute -left-2 sm:-left-3 top-2 sm:top-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">4</div>
              <div className="pl-5 sm:pl-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 uppercase tracking-wider">Generate</h3>
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-4">
                  <Button 
                      onClick={handleGenerateClick} 
                      isLoading={isLoading} 
                      disabled={isGenerateDisabled}
                      className="w-full text-sm sm:text-base py-3 sm:py-3.5 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                      icon={<SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  >
                      Generate Photos
                  </Button>
                  <div className="mt-2">
                    {insufficientCredits ? (
                      <div className="text-[11px] sm:text-xs text-red-300 bg-red-900/20 border border-red-700/40 rounded-md px-2 py-1.5">
                        This run needs {estimatedCost} credits, you have {availableCredits}.{' '}
                        <button
                          onClick={() => {
                            window.history.pushState({}, '', '/upgrade');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }}
                          className="text-red-200 underline underline-offset-2 hover:text-red-100"
                        >
                          Buy credits
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] sm:text-xs text-gray-400">
                        This run will use {estimatedCost} credits. Available: {availableCredits}
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="mt-3 p-2.5 sm:p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                      <p className="text-red-300 text-xs text-center">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-2">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white">4</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-100">
                  Your Generated Photos
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 ml-9 sm:ml-11">Review, edit, create variations, or download your AI-generated images</p>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl"></div>
                  <Spinner className="w-16 h-16 text-blue-400 relative" />
                </div>
                <p className="mt-6 text-xl text-gray-200 font-semibold">Creating Magic...</p>
                <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
              </div>
            )}
            
            {!isLoading && generatedImages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 sm:h-96 bg-gray-900/40 backdrop-blur-sm border-2 border-dashed border-gray-600/50 rounded-2xl p-6">
                <div className="text-center max-w-md">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-600 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg sm:text-xl text-gray-400 font-medium mb-2">No images yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 px-4">Upload a product image, customize your settings, and hit generate to see the magic</p>
                </div>
              </div>
            )}

            {!isLoading && generatedImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {generatedImages.map(image => (
                  <div key={image.id} className={`group relative ${image.parentId ? 'ml-4 sm:ml-6' : ''}`}>
                    {image.parentId && (
                      <div className="absolute -left-4 sm:-left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-purple-500/50"></div>
                    )}
                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                      <div className="relative overflow-hidden">
                        <img src={image.src} alt={image.category} className="w-full h-auto object-cover aspect-[4/5] transition-transform duration-500 ease-out group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                          <h4 className="text-white text-base font-bold truncate flex items-center gap-2">
                            {image.parentId && (
                              <span className="text-blue-400 text-xs">↳</span>
                            )}
                            {image.category}
                          </h4>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3 bg-gray-800/50 flex items-center gap-1.5 sm:gap-2 border-t border-gray-700/50">
                        {!image.parentId && (
                          <Button
                            variant="secondary"
                            className="flex-1 text-[10px] sm:text-xs py-2 sm:py-2.5 hover:bg-gray-700"
                            onClick={() => handleVariationClick(image)}
                            isLoading={generatingVariationId === image.id}
                            disabled={!!generatingVariationId}
                            title="Generate a new variation"
                            icon={<WandIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
                          >
                            <span className="hidden xs:inline">Variation</span>
                            <span className="xs:hidden">Var</span>
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          className="flex-1 text-[10px] sm:text-xs py-2 sm:py-2.5 hover:bg-gray-700"
                          onClick={() => handleEditClick(image)}
                          title="Edit Image"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1 text-[10px] sm:text-xs py-2 sm:py-2.5 hover:bg-gray-700"
                          onClick={() => handleDownloadClick(image.src, image.category)}
                          title="Download Image"
                          icon={<DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
                        >
                          <span className="hidden xs:inline">Download</span>
                          <span className="xs:hidden">Save</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Generate More */}
            {!isLoading && generatedImages.length > 0 && (
              <div className="mt-6 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="text-sm text-gray-300 font-medium">Generate more</div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400">Count</label>
                    <select
                      value={moreCount}
                      onChange={(e) => setMoreCount(Number(e.target.value))}
                      className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-1 text-sm text-gray-200"
                    >
                      {[1,2,3,4,5,6].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[11px] text-gray-400">Will use {estimatedMoreCost} credits. Available: {availableCredits}</div>
                  <div className="sm:ml-auto flex items-center gap-2">
                    <Button
                      onClick={async () => {
                        if (!productImage) return;
                        const need = creditsNeededPerImage() * (moreCount || 1);
                        const use = await consumeCredits(need);
                        if (!use.ok) {
                          setError(use.error || `Not enough credits. You need ${need} credits.`);
                          return;
                        }
                        setIsLoading(true);
                        setError(null);
                        try {
                          const results = await generateImageBatch(
                            productImage,
                            options,
                            moreCount || 1,
                            usePersonPhoto && personImage ? personImage : undefined
                          );
                          const newImages = results.map((result, index) => ({
                            id: `more-${Date.now()}-${index}`,
                            src: result.src,
                            category: result.category,
                          }));
                          setGeneratedImages(prev => [...prev, ...newImages]);
                          try {
                            await Promise.all(newImages.map(async (img) => {
                              await uploadToGallery(img.src, {
                                background: options.background,
                                category: img.category,
                                ...(usePersonPhoto ? {} : { gender: options.gender, age: options.age, ethnicity: options.ethnicity })
                              });
                            }));
                          } catch {}
                        } catch (err:any) {
                          setError(err.message || 'An unknown error occurred.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading || insufficientCreditsMore}
                      className="text-sm"
                    >
                      Generate More
                    </Button>
                    {insufficientCreditsMore && (
                      <button 
                        onClick={() => { window.history.pushState({}, '', '/upgrade'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 underline"
                      >
                        Buy credits
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Info Banner */}
        {generatedImages.length > 0 && (
          <div className="mt-8 sm:mt-12 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-gray-300 text-xs sm:text-sm">
                🎉 <span className="font-semibold">Great work!</span> Need more credits? 
                <button 
                  onClick={() => {
                    window.history.pushState({}, '', '/upgrade');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="ml-1 sm:ml-2 text-blue-400 hover:text-blue-300 underline font-semibold"
                >
                  Check out our pricing
                </button>
              </p>
            </div>
          </div>
        )}
      </main>

      <ImageEditorModal
        open={!!editorOpen}
        src={editorSrc}
        title={generatedImages.find(g => g.id === editorTargetId)?.category || 'Edit Image'}
        onClose={() => { setEditorOpen(false); setEditorSrc(null); setEditorTargetId(null); }}
        onApplyNew={applyEditedOutputNew}
        onReplace={applyEditedOutputReplace}
      />

      {/* Sticky mobile generate bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
        <div className="m-3 rounded-xl border border-gray-700/60 bg-gray-900/90 backdrop-blur px-3 py-3 flex items-center gap-3 shadow-lg">
          <div className="text-[11px] text-gray-400">
            {isLoading ? 'Generating…' : `This run uses ${estimatedCost} credits. Available: ${availableCredits}`}
          </div>
          <Button
            onClick={handleGenerateClick}
            isLoading={isLoading}
            disabled={isGenerateDisabled}
            className="ml-auto px-4 py-2 text-sm"
            icon={<SparklesIcon className="h-4 w-4" />}
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
// Modal is rendered at root level
// Place after the main JSX by returning a fragment or include at bottom of tree
