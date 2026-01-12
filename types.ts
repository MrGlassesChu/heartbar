export interface CocktailRecipe {
  name: string;
  description: string;
  ingredients: string[];
  quote: string;
  visualPrompt: string; // Used internally for image generation
}

export interface BistroState {
  status: 'idle' | 'analyzing' | 'mixing' | 'served' | 'error';
  mood: string;
  recipe: CocktailRecipe | null;
  imageUrl: string | null;
  error?: string;
}

export enum AppStatus {
  IDLE = 'idle',
  ANALYZING = 'analyzing', // Text generation
  MIXING = 'mixing',       // Image generation
  SERVED = 'served',
  ERROR = 'error'
}