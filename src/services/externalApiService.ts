import api from './api';
import type {
  ExternalMedia,
  SearchParams,
  AdvancedSearchParams,
  SearchResponse,
} from '../types/externalApi';

class ExternalApiService {
  // Recherche générale
  async searchMedia(params: SearchParams): Promise<SearchResponse> {
    const response = await api.get('/external/search', { params });
    return response.data;
  }

  // Recherche par type spécifique
  async searchBooks(query: string, maxResults = 20): Promise<SearchResponse> {
    const response = await api.get('/external/search/books', {
      params: { query, maxResults },
    });
    return response.data;
  }

  async searchMovies(query: string, maxResults = 20): Promise<SearchResponse> {
    const response = await api.get('/external/search/movies', {
      params: { query, maxResults },
    });
    return response.data;
  }

  async searchMusic(query: string, maxResults = 20): Promise<SearchResponse> {
    const response = await api.get('/external/search/music', {
      params: { query, maxResults },
    });
    return response.data;
  }

  // Recherche avancée
  async advancedSearch(params: AdvancedSearchParams): Promise<SearchResponse> {
    const response = await api.get('/external/search/advanced', { params });
    return response.data;
  }

  // Récupération d'un média spécifique
  async getMediaById(
    source: string,
    type: string,
    id: string
  ): Promise<{ success: boolean; data: ExternalMedia }> {
    const response = await api.get(`/external/media/${source}/${type}/${id}`);
    return response.data;
  }

  // Créer un média à partir de données externes
  async createMediaFromExternal(mediaData: {
    title: string;
    type: 'book' | 'movie' | 'music';
    author: string;
    year: number;
    description?: string;
    category?: string;
    tags?: string[];
    externalData: any;
  }) {
    const response = await api.post('/media/external', mediaData);
    return response.data;
  }
}

export default new ExternalApiService();
