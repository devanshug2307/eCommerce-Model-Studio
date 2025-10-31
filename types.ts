export interface ModelOptions {
  gender: 'Male' | 'Female';
  age: 'Young Adult (18-25)' | 'Adult (25-40)' | 'Teenager (13-17)' | 'Child (3-7)';
  ethnicity: 'Asian' | 'Black' | 'Caucasian' | 'Hispanic' | 'Indian' | 'Middle Eastern';
  background: 'Studio White' | 'Studio Gray' | 'Outdoor Urban' | 'Outdoor Nature';
  imagesCount?: number; // number of images to generate in a batch
  // Keep only pose as extra customization
  pose?: 'Standing' | 'Walking' | 'Seated' | 'Half-body' | 'Close-up';
  // When true, generation will randomize persona/background per image
  surpriseMe?: boolean;
}

export type GeneratedImage = {
  id: string;
  src: string;
  category: string; // e.g., 'Standing Pose', 'Flat Lay'
  parentId?: string; // To link a variation to its parent image
};