export interface ExternalMedia {
  id: string;
  title: string;
  author: string;
  year: number | null;
  description: string;
  imageUrl: string | null;
  source: 'google_books' | 'tmdb' | 'musicbrainz';
  type: 'book' | 'movie' | 'music';
  externalId: string;
  // Champs spécifiques aux livres
  isbn?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
  // Champs spécifiques aux films
  runtime?: number;
  genres?: string[];
  backdropUrl?: string;
  releaseDate?: string;
  originalTitle?: string;
  budget?: number;
  revenue?: number;
  status?: string;
  // Champs spécifiques à la musique
  country?: string;
  barcode?: string;
  asin?: string;
  media?: Array<{
    format: string;
    trackCount: number;
    tracks: Array<{
      title: string;
      length: number;
    }>;
  }>;
}

export interface SearchParams {
  query: string;
  type?: 'book' | 'movie' | 'music';
  maxResults?: number;
}

export interface AdvancedSearchParams {
  query?: string;
  author?: string;
  type?: 'book' | 'movie' | 'music';
  year?: number;
  source?: 'google_books' | 'tmdb' | 'musicbrainz';
  maxResults?: number;
}

export interface SearchResponse {
  success: boolean;
  data: ExternalMedia[];
  total: number;
  query: string;
  type?: string;
}
