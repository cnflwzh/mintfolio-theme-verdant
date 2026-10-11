import type { PublicImage } from '@mintfolio/theme-api';

/** Verdant Theme settings, fully populated and validated by its own manifest. */
export interface VerdantSettings extends Record<string, unknown> {
  /** Visitor choices in localStorage take precedence over these initial appearance values. */
  initialMode: 'auto' | 'light' | 'dark';
  initialPalette: string;
  /** Number of cards initially visible before the visitor loads more. */
  homePageSize: number;
  archivePageSize: number;
  /** Optional sidebar presentation; Core contains no Verdant-specific configuration. */
  sidebar: {
    sections: { contact: boolean; activity: boolean; tools: boolean };
    tools: Array<{ name: string; description: string; url: string }>;
    quote: { enabled: boolean; text: string; author: string };
  };
  /** Explicitly curated post identifiers and display images; Core resolves their public posts. */
  home: { hotContent: { enabled: boolean; items: Array<{ postId: string; image: string | PublicImage }> } };
  article: { footerImage: { enabled: boolean; src: string | PublicImage } };
}
