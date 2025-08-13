import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import contactService from '../../services/contactService';
import api from '../../services/api';

// Mock du service API
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('ContactService', () => {
  const mockApi = vi.mocked(api) as any;

  const mockContactData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question générale',
    message: 'Bonjour, j\'ai une question...',
    phone: '0123456789'
  };

  const mockContactDataWithoutPhone = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Support technique',
    message: 'J\'ai besoin d\'aide...'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('devrait envoyer un message de contact avec succès avec tous les champs', async () => {
      const mockResponse = {
        data: {
          message: 'Message envoyé avec succès',
          contactId: 'contact-123'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await contactService.sendMessage(mockContactData);

      expect(mockApi.post).toHaveBeenCalledWith('/contact', mockContactData);
      expect(result).toEqual(mockResponse.data);
      expect(result.message).toBe('Message envoyé avec succès');
      expect(result.contactId).toBe('contact-123');
    });

    it('devrait envoyer un message de contact sans numéro de téléphone', async () => {
      const mockResponse = {
        data: {
          message: 'Message envoyé avec succès',
          contactId: 'contact-456'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await contactService.sendMessage(mockContactDataWithoutPhone);

      expect(mockApi.post).toHaveBeenCalledWith('/contact', mockContactDataWithoutPhone);
      expect(result).toEqual(mockResponse.data);
      expect(result.message).toBe('Message envoyé avec succès');
      expect(result.contactId).toBe('contact-456');
    });

    it('devrait gérer les erreurs d\'envoi de message', async () => {
      const mockError = new Error('Failed to send message');
      mockApi.post.mockRejectedValue(mockError);

      await expect(contactService.sendMessage(mockContactData))
        .rejects.toThrow('Failed to send message');

      expect(mockApi.post).toHaveBeenCalledWith('/contact', mockContactData);
    });

    it('devrait gérer les erreurs de validation côté serveur', async () => {
      const mockError = new Error('Validation failed');
      mockApi.post.mockRejectedValue(mockError);

      await expect(contactService.sendMessage(mockContactData))
        .rejects.toThrow('Validation failed');

      expect(mockApi.post).toHaveBeenCalledWith('/contact', mockContactData);
    });

    it('devrait gérer les erreurs de réseau', async () => {
      const mockError = new Error('Network error');
      mockApi.post.mockRejectedValue(mockError);

      await expect(contactService.sendMessage(mockContactData))
        .rejects.toThrow('Network error');

      expect(mockApi.post).toHaveBeenCalledWith('/contact', mockContactData);
    });
  });
});
