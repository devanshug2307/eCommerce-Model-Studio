import { GoogleGenAI, Modality } from "@google/genai";
import { ModelOptions } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const dataUrlToGenerativePart = (dataUrl: string) => {
    const [, base64Data] = dataUrl.split(',');
    const mimeType = dataUrl.match(/:(.*?);/)?.[1] ?? 'image/png';
    return {
        inlineData: { data: base64Data, mimeType },
    };
};

const buildPromptForCategory = (options: ModelOptions, category: string): string => {
  const { gender, age, ethnicity, background } = options;

  let backgroundDescription = '';
  switch (background) {
    case 'Studio White': backgroundDescription = 'a professional photo studio with a clean, plain white background'; break;
    case 'Studio Gray': backgroundDescription = 'a professional photo studio with a plain, neutral gray background'; break;

    case 'Outdoor Urban': backgroundDescription = 'an outdoor urban city street setting with a slightly blurred background'; break;
    case 'Outdoor Nature': backgroundDescription = 'an outdoor nature setting, like a park or forest, with natural lighting'; break;
  }
  
  const commonPrompt = `The lighting must be bright, even, and professional, highlighting the product's details. Do not add any text, logos, or watermarks. The final image must be ultra-photorealistic and suitable for a high-end eCommerce website like Amazon or Flipkart.`;

  switch (category) {
    case 'Standing Pose':
      return `Take the provided product image and realistically place it on a ${age} ${ethnicity} ${gender.toLowerCase()} model in a confident, full-body standing pose. The setting should be ${backgroundDescription}. ${commonPrompt}`;
    case 'Action Pose':
      return `Take the provided product image and realistically place it on a ${age} ${ethnicity} ${gender.toLowerCase()} model in a dynamic action pose, like walking or turning naturally. The setting should be ${backgroundDescription}. ${commonPrompt}`;
    case 'Detail Shot':
      return `Take the provided product image and create a close-up, detailed shot on a ${age} ${ethnicity} ${gender.toLowerCase()} model, focusing on the product's texture and features. The setting should be ${backgroundDescription}. ${commonPrompt}`;
    case 'Aesthetic Shot':
      return `Take the provided product image and create a cinematic, aesthetic, editorial-style shot with a ${age} ${ethnicity} ${gender.toLowerCase()} model. The pose should be stylish and engaging. The setting should be ${backgroundDescription}. ${commonPrompt}`;
    case 'Flat Lay':
      return `Create a cinematic and artfully styled 'flat lay' photograph using the provided product image. Arrange the product on a complementary textured surface like rustic wood, cool marble, or soft linen. Include 1-2 subtle, tasteful props that enhance the product's story without distracting from it. Use soft, diffused natural lighting to create a gentle, high-end mood with soft shadows. The composition should be balanced and visually appealing. No models. ${commonPrompt}`;
    case 'Hanger Shot':
      return `Create a cinematic, high-end shot of the product from the provided image hanging on a quality wooden or metallic hanger. Place it against an interesting but non-distracting background, such as a textured wall with soft, artistic shadows or in a minimalist boutique setting. The lighting should be professional and directional, beautifully highlighting the product's shape and fabric. No models. ${commonPrompt}`;
    default:
      return '';
  }
};


const buildVariationPrompt = (options: ModelOptions): string => {
  const { gender, age, ethnicity, background } = options;
  return `Using the provided product image (first image) and the existing model photo (second image) as a reference, generate a new, slightly different version.
Maintain the same product, model characteristics (${age} ${ethnicity} ${gender.toLowerCase()}), and background style (${background}).
Introduce a subtle variation in the model's pose, expression, or the camera angle.
The goal is a new, unique image that is consistent with the original's quality and style for an eCommerce website.
The result must be photorealistic, professional, and free of any text or watermarks.`;
};

export const generateImageBatch = async (
  productImage: File,
  options: ModelOptions
): Promise<{ src: string, category: string }[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(productImage);
  
  const shotCategories = [
    'Standing Pose', 'Action Pose', 'Detail Shot', 'Aesthetic Shot', 
    'Flat Lay', 'Hanger Shot'
  ];

  const generationPromises = shotCategories.map(async (category) => {
    const textPart = { text: buildPromptForCategory(options, category) };
    // FIX: The original ternary operator was redundant as both branches were identical.
    // Simplified to always include both image and text parts, which is correct for all categories.
    const parts = [imagePart, textPart];
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { responseModalities: [Modality.IMAGE] },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return {
            src: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`,
            category: category,
          };
        }
      }
      return null;
    } catch (error) {
      console.error(`Error generating image for category "${category}":`, error);
      return null; // Return null on error for this specific image
    }
  });

  const results = await Promise.allSettled(generationPromises);
  
  const successfulResults = results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => (result as PromiseFulfilledResult<any>).value);

  if (successfulResults.length === 0) {
    throw new Error("Failed to generate any images. Please check the console for errors and try again.");
  }
  
  return successfulResults;
};


export const generateImageVariation = async (
  productImage: File,
  options: ModelOptions,
  baseImageSrc: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const productPart = await fileToGenerativePart(productImage);
  const baseImagePart = dataUrlToGenerativePart(baseImageSrc);
  const textPart = { text: buildVariationPrompt(options) };
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [productPart, baseImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error('No image variation was generated. The response did not contain image data.');
  } catch (error) {
    console.error("Error generating image variation with Gemini:", error);
    throw new Error("Failed to generate model image variation. Please try again.");
  }
};