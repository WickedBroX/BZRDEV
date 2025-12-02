import { createContext, useContext } from 'react';

export interface SocialLink {
  name: string;
  url: string;
}

export interface GeneralSettings {
  logoUrl?: string;
  tokenAddress?: string;
  maxSupply?: number;
}

export interface ContentSettings {
  footerText?: string;
}

export interface SettingsContextType {
  general: GeneralSettings;
  content: ContentSettings;
  socials: SocialLink[];
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
