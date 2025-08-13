// Index des tests des services
// Ce fichier permet d'exécuter tous les tests des services en une seule commande

import { describe, it, expect } from 'vitest';

// Services principaux
import './authService.test';
import './userService.test';
import './mediaService.test';
import './contactService.test';
import './borrowService.test';
import './dashboardService.test';

// Services admin
import './adminBorrowService.test';
import './adminMediaService.test';
import './adminUserService.test';

describe('Tous les services', () => {
  it('devrait avoir tous les tests des services configurés', () => {
    // Ce test sert juste à s'assurer que le fichier est reconnu comme un test
    expect(true).toBe(true);
  });
});
