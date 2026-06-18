export interface Extension {
  id: string;
  name: string;
  badge?: 'NEW' | 'PREMIUM';
  description?: string;
  featured?: boolean;
  feature?: boolean; // supporting both 'feature' and 'featured' as requested
}
