import { describe, it, expect } from 'vitest';
import { 
  loginSchema, 
  registerSchema, 
  profileSchema, 
  passwordSchema, 
  deleteAccountSchema 
} from '../../utils/validation';

describe('Validation Schemas', () => {
  describe('loginSchema - Schéma de connexion', () => {
    it('devrait valider des données de connexion valides', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un email manquant', () => {
      const invalidData = {
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('expected string');
      }
    });

    it('devrait rejeter un mot de passe manquant', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('expected string');
      }
    });

    it('devrait rejeter un email invalide', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Format d\'email invalide');
      }
    });

    it('devrait rejeter un mot de passe trop court', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le mot de passe doit contenir au moins 5 caractères');
      }
    });
  });

  describe('registerSchema - Schéma d\'inscription', () => {
    it('devrait valider des données d\'inscription valides', () => {
      const validData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un nom trop court', () => {
      const invalidData = {
        name: 'J',
        email: 'jean.dupont@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le nom doit contenir au moins 2 caractères');
      }
    });

    it('devrait rejeter un nom avec des caractères invalides', () => {
      const invalidData = {
        name: 'Jean123',
        email: 'jean.dupont@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets');
      }
    });

    it('devrait rejeter un nom trop long', () => {
      const invalidData = {
        name: 'A'.repeat(51),
        email: 'jean.dupont@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le nom ne peut pas dépasser 50 caractères');
      }
    });

    it('devrait rejeter un mot de passe sans minuscule', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
      }
    });

    it('devrait rejeter un mot de passe sans majuscule', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
      }
    });

    it('devrait rejeter un mot de passe sans chiffre', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: 'Password',
        confirmPassword: 'Password'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
      }
    });

    it('devrait rejeter des mots de passe qui ne correspondent pas', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Les mots de passe ne correspondent pas');
      }
    });

    it('devrait accepter des noms avec des accents et des tirets', () => {
      const validData = {
        name: 'Jean-François O\'Connor',
        email: 'jean-francois@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('profileSchema - Schéma de profil', () => {
    it('devrait valider des données de profil valides', () => {
      const validData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com'
      };

      const result = profileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un nom invalide', () => {
      const invalidData = {
        name: 'Jean123',
        email: 'jean.dupont@example.com'
      };

      const result = profileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter un email invalide', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'invalid-email'
      };

      const result = profileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema - Schéma de changement de mot de passe', () => {
    it('devrait valider des données de changement de mot de passe valides', () => {
      const validData = {
        currentPassword: 'CurrentPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123'
      };

      const result = passwordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter des nouveaux mots de passe qui ne correspondent pas', () => {
      const invalidData = {
        currentPassword: 'CurrentPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'DifferentPassword123'
      };

      const result = passwordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Les mots de passe ne correspondent pas');
      }
    });

    it('devrait rejeter un nouveau mot de passe trop court', () => {
      const invalidData = {
        currentPassword: 'CurrentPassword123',
        newPassword: 'New1',
        confirmPassword: 'New1'
      };

      const result = passwordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le nouveau mot de passe doit contenir au moins 6 caractères');
      }
    });
  });

  describe('deleteAccountSchema - Schéma de suppression de compte', () => {
    it('devrait valider des données de suppression de compte valides', () => {
      const validData = {
        password: 'CurrentPassword123',
        confirmation: 'DESACTIVER'
      };

      const result = deleteAccountSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter une confirmation incorrecte', () => {
      const invalidData = {
        password: 'CurrentPassword123',
        confirmation: 'ACTIVER'
      };

      const result = deleteAccountSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Vous devez taper "DESACTIVER" pour confirmer la désactivation');
      }
    });

    it('devrait rejeter un mot de passe manquant', () => {
      const invalidData = {
        confirmation: 'DESACTIVER'
      };

      const result = deleteAccountSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('expected string');
      }
    });

    it('devrait rejeter une confirmation manquante', () => {
      const invalidData = {
        password: 'CurrentPassword123'
      };

      const result = deleteAccountSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('expected string');
      }
    });
  });

  describe('Validation des types TypeScript', () => {
    it('devrait avoir des types corrects pour LoginFormData', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Ce test vérifie que les types sont corrects
      const result = loginSchema.parse(validData);
      expect(typeof result.email).toBe('string');
      expect(typeof result.password).toBe('string');
    });

    it('devrait avoir des types corrects pour RegisterFormData', () => {
      const validData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = registerSchema.parse(validData);
      expect(typeof result.name).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(typeof result.password).toBe('string');
      expect(typeof result.confirmPassword).toBe('string');
    });
  });
});
