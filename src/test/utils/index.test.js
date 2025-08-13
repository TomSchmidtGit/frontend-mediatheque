import { describe, it, expect, beforeEach } from 'vitest';
import { 
  cn, 
  formatDate, 
  dateUtils, 
  formatters, 
  isValidEmail, 
  debounce
} from '../../utils';

describe('Utils - Fonctions utilitaires', () => {
  describe('cn - Combinaison de classes CSS', () => {
    it('devrait combiner plusieurs classes CSS', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('devrait filtrer les valeurs falsy', () => {
      const result = cn('class1', false, 'class2', null, 'class3', undefined);
      expect(result).toBe('class1 class2 class3');
    });

    it('devrait gérer les objets conditionnels', () => {
      const result = cn('base', { 'active': true, 'disabled': false });
      expect(result).toBe('base active');
    });

    it('devrait gérer les tableaux', () => {
      const result = cn('base', ['class1', 'class2']);
      expect(result).toBe('base class1 class2');
    });
  });

  describe('formatDate - Formatage des dates', () => {
    const testDate = new Date('2023-01-15T10:30:00');

    it('devrait formater une date en format court', () => {
      const result = formatDate.short(testDate);
      expect(result).toBe('15/01/2023');
    });

    it('devrait formater une date en format long', () => {
      const result = formatDate.long(testDate);
      expect(result).toBe('15 janvier 2023');
    });

    it('devrait formater une date avec heure', () => {
      const result = formatDate.dateTime(testDate);
      expect(result).toBe('15/01/2023 à 10:30');
    });

    it('devrait formater une date relative', () => {
      const result = formatDate.timeAgo(testDate);
      expect(result).toMatch(/il y a/);
    });

    it('devrait accepter les dates sous forme de string', () => {
      const result = formatDate.short('2023-01-15');
      expect(result).toBe('15/01/2023');
    });
  });

  describe('dateUtils - Utilitaires de dates', () => {
    it('devrait détecter une date en retard', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const result = dateUtils.isOverdue(pastDate);
      expect(result).toBe(true);
    });

    it('devrait détecter une date non en retard', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const result = dateUtils.isOverdue(futureDate);
      expect(result).toBe(false);
    });

    it('devrait détecter une date bientôt due', () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 1);
      
      const result = dateUtils.isDueSoon(soonDate, 2);
      expect(result).toBe(true);
    });

    it('devrait ne pas détecter une date bientôt due si trop éloignée', () => {
      const farDate = new Date();
      farDate.setDate(farDate.getDate() + 5);
      
      const result = dateUtils.isDueSoon(farDate, 2);
      expect(result).toBe(false);
    });
  });

  describe('formatters - Formatage des données', () => {
    describe('mediaType', () => {
      it('devrait formater le type "book"', () => {
        const result = formatters.mediaType('book');
        expect(result).toBe('Livre');
      });

      it('devrait formater le type "movie"', () => {
        const result = formatters.mediaType('movie');
        expect(result).toBe('Film');
      });

      it('devrait formater le type "music"', () => {
        const result = formatters.mediaType('music');
        expect(result).toBe('Musique');
      });

      it('devrait retourner le type original si inconnu', () => {
        const result = formatters.mediaType('unknown');
        expect(result).toBe('unknown');
      });
    });

    describe('userRole', () => {
      it('devrait formater le rôle "user"', () => {
        const result = formatters.userRole('user');
        expect(result).toBe('Utilisateur');
      });

      it('devrait formater le rôle "employee"', () => {
        const result = formatters.userRole('employee');
        expect(result).toBe('Employé');
      });

      it('devrait formater le rôle "admin"', () => {
        const result = formatters.userRole('admin');
        expect(result).toBe('Administrateur');
      });

      it('devrait retourner le rôle original si inconnu', () => {
        const result = formatters.userRole('unknown');
        expect(result).toBe('unknown');
      });
    });

    describe('borrowStatus', () => {
      it('devrait formater le statut "borrowed"', () => {
        const result = formatters.borrowStatus('borrowed');
        expect(result).toBe('Emprunté');
      });

      it('devrait formater le statut "returned"', () => {
        const result = formatters.borrowStatus('returned');
        expect(result).toBe('Retourné');
      });

      it('devrait formater le statut "overdue"', () => {
        const result = formatters.borrowStatus('overdue');
        expect(result).toBe('En retard');
      });

      it('devrait retourner le statut original si inconnu', () => {
        const result = formatters.borrowStatus('unknown');
        expect(result).toBe('unknown');
      });
    });
  });

  describe('isValidEmail - Validation d\'email', () => {
    it('devrait valider un email valide', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('devrait rejeter un email invalide', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@.com',
        'user..name@example.com'
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('devrait accepter des emails avec des domaines courts mais valides', () => {
      // La regex exige un domaine d'au moins 2 caractères après le point
      expect(isValidEmail('user@ab.com')).toBe(true);
      expect(isValidEmail('test@bc.org')).toBe(true);
    });

    it('devrait rejeter une chaîne vide', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('debounce - Fonction de debounce', () => {
    it('devrait retarder l\'exécution de la fonction', async () => {
      let callCount = 0;
      const testFunction = () => { callCount++; };
      const debouncedFunction = debounce(testFunction, 100);

      debouncedFunction();
      debouncedFunction();
      debouncedFunction();

      expect(callCount).toBe(0);

      // Attendre que le debounce se termine
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });

    it('devrait respecter le délai spécifié', async () => {
      let callCount = 0;
      const testFunction = () => { callCount++; };
      const debouncedFunction = debounce(testFunction, 200);

      debouncedFunction();

      // Vérifier que la fonction n'est pas appelée avant le délai
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callCount).toBe(0);

      // Vérifier que la fonction est appelée après le délai
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });
  });


});
