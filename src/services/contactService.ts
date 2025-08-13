// src/services/contactService.ts
import api from './api';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

interface ContactResponse {
  message: string;
  contactId: string;
}

class ContactService {
  /**
   * Envoyer un message de contact
   */
  async sendMessage(data: ContactFormData): Promise<ContactResponse> {
    const response = await api.post<ContactResponse>('/contact', data);
    return response.data;
  }
}

export default new ContactService();
