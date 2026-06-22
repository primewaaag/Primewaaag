export interface Download {
  id: string; // Slug/ID
  title: string; // Title for the card / quick view
  price: string; // Price (e.g. "€0.00", "€4.99")
  imageUrl: string; // URL of the card image
  category: 'free' | 'premium' | 'early-access';
  description?: string;
  featured?: boolean;
}
