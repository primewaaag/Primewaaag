export interface DownloadAction {
  id: string;
  type: 'file' | 'copy';
  label?: string; // Optional label for file downloads (e.g. "Download Codex Installer")
  fileUrl?: string;
  copyIcon?: string;
  copyTitle?: string;
  copyDesc?: string;
  copyText?: string;
  copyBtnText?: string;
}

export interface Download {
  id: string; // Slug/ID
  title: string; // Title for the card / quick view
  price: string; // Price (e.g. "FREE", "PREMIUM")
  imageUrl: string; // URL of the card image
  category: 'free' | 'premium' | 'early-access';
  description?: string;
  featured?: boolean;
  downloadType?: 'file' | 'copy'; // Legacy support
  fileUrl?: string; // Legacy support
  copyIcon?: string; // Legacy support
  copyTitle?: string; // Legacy support
  copyDesc?: string; // Legacy support
  copyText?: string; // Legacy support
  copyBtnText?: string; // Legacy support
  actions?: DownloadAction[];
}

