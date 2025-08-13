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
    // Nettoyer le numéro de téléphone avant l'envoi
    const cleanedData = {
      ...data,
      phone: data.phone ? data.phone.replace(/[\s\-\(\)]/g, '') : undefined,
    };

    const response = await api.post<ContactResponse>('/contact', cleanedData);
    return response.data;
  }
}

export default new ContactService();
