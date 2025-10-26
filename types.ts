export interface ModelOptions {
  gender: 'Man' | 'Woman' | 'Boy' | 'Girl';
  age: 'Young Adult (18-25)' | 'Adult (25-40)' | 'Teenager (13-17)' | 'Child (3-7)';
  ethnicity: 'Asian' | 'Black' | 'Caucasian' | 'Hispanic' | 'Indian' | 'Middle Eastern';
  background: 'Studio White' | 'Studio Gray' | 'Outdoor Urban' | 'Outdoor Nature';
}

export type GeneratedImage = {
  id: string;
  src: string;
  category: string; // e.g., 'Standing Pose', 'Flat Lay'
  parentId?: string; // To link a variation to its parent image
};