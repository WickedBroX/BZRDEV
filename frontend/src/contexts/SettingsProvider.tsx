import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SettingsContext } from './SettingsContext';
import type { GeneralSettings, ContentSettings, SocialLink } from './SettingsContext';
import { BZR_TOKEN_ADDRESS, SOCIAL_LINKS } from '../constants/index';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [general, setGeneral] = useState<GeneralSettings>({
    tokenAddress: BZR_TOKEN_ADDRESS,
    logoUrl: 'https://res.cloudinary.com/dhznjbcys/image/upload/v1762175462/BZR-SCAN-V2_iybuqz.png',
  });
  const [content, setContent] = useState<ContentSettings>({
    footerText: 'Explore and track BZR token transactions across multiple blockchain networks.',
  });
  const [socials, setSocials] = useState<SocialLink[]>([...SOCIAL_LINKS]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/settings/public`, { timeout: 3000 });
      if (response.data) {
        if (response.data.general) setGeneral(prev => ({ ...prev, ...response.data.general }));
        if (response.data.content) setContent(prev => ({ ...prev, ...response.data.content }));
        if (response.data.socials && Array.isArray(response.data.socials)) setSocials(response.data.socials);
      }
    } catch (error) {
      console.error('Failed to load settings, using defaults:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ general, content, socials, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
