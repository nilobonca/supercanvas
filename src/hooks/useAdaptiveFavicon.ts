import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

/**
 * useAdaptiveFavicon
 * Dynamically updates the browser tab favicon to ensure high contrast
 * so the icon never becomes invisible (white on white or black on black)
 * depending on whether the user is on light or dark/ethereal/cyber theme.
 */
export const useAdaptiveFavicon = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const isLight = theme === 'light';
    const svgFavicon = isLight ? '/favicon-light.svg' : '/favicon-dark.svg';
    const pngFavicon = isLight ? '/favicon-light.png' : '/favicon-dark.png';

    // Helper to update or create link tag in head
    const updateLink = (selector: string, href: string, type: string) => {
      let link = document.querySelector<HTMLLinkElement>(selector);
      if (!link) {
        link = document.createElement('link');
        const relMatch = selector.match(/rel="([^"]+)"/);
        link.rel = relMatch ? relMatch[1] : 'icon';
        document.head.appendChild(link);
      }
      link.type = type;
      link.href = `${href}?v=${theme || 'default'}`;
    };

    // Update SVG favicon (crisp vector)
    updateLink('link[type="image/svg+xml"]', svgFavicon, 'image/svg+xml');

    // Update standard icon link
    updateLink('link[rel="icon"]:not([type="image/svg+xml"])', pngFavicon, 'image/png');

    // Update shortcut icon link
    updateLink('link[rel="shortcut icon"]', pngFavicon, 'image/png');
  }, [theme]);
};
