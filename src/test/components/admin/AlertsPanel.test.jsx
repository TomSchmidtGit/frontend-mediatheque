import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AlertsPanel from '../../../components/admin/AlertsPanel';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ExclamationTriangleIcon: ({ className, ...props }) => <span className={className} {...props}>⚠️</span>,
  InformationCircleIcon: ({ className, ...props }) => <span className={className} {...props}>ℹ️</span>,
  XCircleIcon: ({ className, ...props }) => <span className={className} {...props}>❌</span>,
  ClockIcon: ({ className, ...props }) => <span className={className} {...props}>🕐</span>,
  EyeIcon: ({ className, ...props }) => <span className={className} {...props}>👁️</span>,
  UserIcon: ({ className, ...props }) => <span className={className} {...props}>👤</span>
}));

// Mock de la fonction cn
vi.mock('../../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' '),
  formatDate: {
    short: (date) => new Date(date).toLocaleDateString('fr-FR')
  }
}));

// Wrapper pour les tests avec Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AlertsPanel', () => {
  const mockStats = {
    users: {
      total: 150,
      active: 142,
      inactive: 8,
      newThisMonth: 12
    },
    media: {
      total: 1250,
      byType: {
        book: 800,
        movie: 300,
        music: 150
      }
    },
    borrows: {
      active: 89,
      overdue: 5,
      returned: 1250,
      total: 1344
    },
    topBorrowedMedia: [
      {
        _id: 'media1',
        title: 'Le Petit Prince',
        type: 'book',
        author: 'Antoine de Saint-Exupéry',
        borrowCount: 45
      }
    ],
    recentBorrows: [],
    mostActiveUsers: [
      {
        _id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        borrowCount: 23
      }
    ],
    alerts: [
      {
        type: 'warning',
        message: '5 emprunts sont en retard de plus de 7 jours',
        priority: 'high'
      },
      {
        type: 'info',
        message: '3 nouveaux utilisateurs se sont inscrits cette semaine',
        priority: 'medium'
      },
      {
        type: 'error',
        message: 'Problème de connexion à la base de données',
        priority: 'high'
      }
    ],
    overdueDetails: [
      {
        _id: 'borrow1',
        user: {
          name: 'Alice Martin',
          email: 'alice@example.com'
        },
        media: {
          title: '1984'
        },
        dueDate: '2024-01-15T00:00:00.000Z',
        daysOverdue: 12
      },
      {
        _id: 'borrow2',
        user: {
          name: 'Bob Dupont',
          email: 'bob@example.com'
        },
        media: {
          title: 'Le Seigneur des Anneaux'
        },
        dueDate: '2024-01-18T00:00:00.000Z',
        daysOverdue: 9
      }
    ]
  };

  describe('Rendu du composant', () => {
    it('devrait afficher le composant avec les alertes et emprunts en retard', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      // Vérifier les titres des sections
      expect(screen.getByText('Alertes système')).toBeInTheDocument();
      expect(screen.getByText('Emprunts en retard')).toBeInTheDocument();
      
      // Vérifier les icônes
      expect(screen.getAllByText('⚠️').length).toBeGreaterThan(0); // ExclamationTriangleIcon (peut être multiple)
      expect(screen.getByText('🕐')).toBeInTheDocument(); // ClockIcon
    });

    it('devrait afficher le nombre d\'alertes de priorité haute', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      expect(screen.getByText('2 priorité haute')).toBeInTheDocument();
    });

    it('devrait afficher le nombre d\'emprunts en retard', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      expect(screen.getByText('5 en retard')).toBeInTheDocument();
    });
  });

  describe('Section Alertes système', () => {
    it('devrait afficher toutes les alertes avec leurs informations', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      // Vérifier les messages d'alerte
      expect(screen.getByText('5 emprunts sont en retard de plus de 7 jours')).toBeInTheDocument();
      expect(screen.getByText('3 nouveaux utilisateurs se sont inscrits cette semaine')).toBeInTheDocument();
      expect(screen.getByText('Problème de connexion à la base de données')).toBeInTheDocument();
      
      // Vérifier les priorités (il peut y avoir plusieurs "Haute")
      expect(screen.getAllByText('Haute').length).toBeGreaterThan(0);
      expect(screen.getByText('Moyenne')).toBeInTheDocument();
      
      // Vérifier les types
      expect(screen.getByText('Avertissement')).toBeInTheDocument();
      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByText('Erreur')).toBeInTheDocument();
    });

    it('devrait afficher les icônes appropriées selon le type d\'alerte', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      // Vérifier que les icônes sont présentes
      expect(screen.getAllByText('⚠️').length).toBeGreaterThan(0); // Warning
      expect(screen.getAllByText('ℹ️').length).toBeGreaterThan(0); // Info
      expect(screen.getAllByText('❌').length).toBeGreaterThan(0); // Error
    });

    it('devrait afficher le lien "Voir tous les retards"', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      const link = screen.getByText('Voir tous les retards');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/admin/borrows?status=overdue');
    });
  });

  describe('Section Emprunts en retard', () => {
    it('devrait afficher tous les emprunts en retard avec leurs détails', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      // Vérifier les noms des utilisateurs
      expect(screen.getByText('Alice Martin')).toBeInTheDocument();
      expect(screen.getByText('Bob Dupont')).toBeInTheDocument();
      
      // Vérifier les titres des médias
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.getByText('Le Seigneur des Anneaux')).toBeInTheDocument();
      
      // Vérifier les jours de retard
      expect(screen.getByText('12 jours')).toBeInTheDocument();
      expect(screen.getByText('9 jours')).toBeInTheDocument();
    });

    it('devrait afficher les informations des utilisateurs en retard', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      // Vérifier que les informations utilisateur sont affichées
      expect(screen.getByText('Alice Martin')).toBeInTheDocument();
      expect(screen.getByText('Bob Dupont')).toBeInTheDocument();
      
      // Vérifier que les médias sont affichés
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.getByText('Le Seigneur des Anneaux')).toBeInTheDocument();
    });

    it('devrait afficher les dates d\'échéance formatées', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      expect(screen.getByText('Échéance : 15/01/2024')).toBeInTheDocument();
      expect(screen.getByText('Échéance : 18/01/2024')).toBeInTheDocument();
    });
  });

  describe('États de chargement', () => {
    it('devrait afficher le skeleton loader quand loading est true', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} loading={true} />);
      
      // Vérifier que le contenu réel n'est pas affiché
      expect(screen.queryByText('Alertes système')).not.toBeInTheDocument();
      expect(screen.queryByText('Emprunts en retard')).not.toBeInTheDocument();
      
      // Vérifier que les éléments de skeleton sont présents
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('devrait afficher le contenu normal quand loading est false', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} loading={false} />);
      
      expect(screen.getByText('Alertes système')).toBeInTheDocument();
      expect(screen.getByText('Emprunts en retard')).toBeInTheDocument();
    });
  });

  describe('Cas d\'absence de données', () => {
    it('devrait afficher le message "Aucune alerte active" quand il n\'y a pas d\'alertes', () => {
      const statsWithoutAlerts = {
        ...mockStats,
        alerts: []
      };
      
      renderWithRouter(<AlertsPanel stats={statsWithoutAlerts} />);
      
      expect(screen.getByText('Aucune alerte active')).toBeInTheDocument();
      expect(screen.getByText('Tous les emprunts sont à jour !')).toBeInTheDocument();
    });

    it('devrait afficher le message "Aucun emprunt en retard" quand il n\'y a pas d\'emprunts en retard', () => {
      const statsWithoutOverdue = {
        ...mockStats,
        overdueDetails: []
      };
      
      renderWithRouter(<AlertsPanel stats={statsWithoutOverdue} />);
      
      expect(screen.getByText('Aucun emprunt en retard')).toBeInTheDocument();
      expect(screen.getByText('Tout fonctionne normalement !')).toBeInTheDocument();
    });

    it('devrait gérer le cas où stats a des propriétés vides', () => {
      const statsWithEmptyProps = {
        users: { total: 0, active: 0, inactive: 0, newThisMonth: 0 },
        media: { total: 0, byType: { book: 0, movie: 0, music: 0 } },
        borrows: { active: 0, overdue: 0, returned: 0, total: 0 },
        topBorrowedMedia: [],
        recentBorrows: [],
        mostActiveUsers: [],
        alerts: [],
        overdueDetails: []
      };
      
      renderWithRouter(<AlertsPanel stats={statsWithEmptyProps} />);
      
      // Le composant devrait afficher les messages d'absence de données
      expect(screen.getByText('Aucune alerte active')).toBeInTheDocument();
      expect(screen.getByText('Aucun emprunt en retard')).toBeInTheDocument();
    });
  });

  describe('Gestion des priorités et types d\'alertes', () => {
    it('devrait appliquer les bonnes couleurs selon la priorité et le type', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      // Vérifier que les classes CSS appropriées sont appliquées
      const alertElements = document.querySelectorAll('[class*="bg-red-50"], [class*="bg-orange-50"], [class*="bg-yellow-50"]');
      expect(alertElements.length).toBeGreaterThan(0);
    });

    it('devrait afficher le bon nombre d\'alertes de priorité haute', () => {
      const statsWithHighPriorityAlerts = {
        ...mockStats,
        alerts: [
          {
            type: 'error',
            message: 'Erreur critique',
            priority: 'high'
          },
          {
            type: 'warning',
            message: 'Avertissement important',
            priority: 'high'
          }
        ]
      };
      
      renderWithRouter(<AlertsPanel stats={statsWithHighPriorityAlerts} />);
      
      expect(screen.getByText('2 priorité haute')).toBeInTheDocument();
    });
  });

  describe('Limitation du nombre d\'éléments affichés', () => {
    it('devrait limiter l\'affichage à 5 alertes maximum', () => {
      const statsWithManyAlerts = {
        ...mockStats,
        alerts: Array.from({ length: 10 }, (_, index) => ({
          type: 'info',
          message: `Alerte ${index + 1}`,
          priority: 'low'
        }))
      };
      
      renderWithRouter(<AlertsPanel stats={statsWithManyAlerts} />);
      
      // Vérifier que seulement 5 alertes sont affichées
      expect(screen.getByText('Alerte 1')).toBeInTheDocument();
      expect(screen.getByText('Alerte 5')).toBeInTheDocument();
      expect(screen.queryByText('Alerte 6')).not.toBeInTheDocument();
    });

    it('devrait limiter l\'affichage à 5 emprunts en retard maximum', () => {
      const statsWithManyOverdue = {
        ...mockStats,
        overdueDetails: Array.from({ length: 8 }, (_, index) => ({
          _id: `borrow${index + 1}`,
          user: {
            name: `Utilisateur ${index + 1}`,
            email: `user${index + 1}@example.com`
          },
          media: {
            title: `Média ${index + 1}`
          },
          dueDate: '2024-01-15T00:00:00.000Z',
          daysOverdue: index + 1
        }))
      };
      
      renderWithRouter(<AlertsPanel stats={statsWithManyOverdue} />);
      
      // Vérifier que seulement 5 emprunts en retard sont affichés
      expect(screen.getByText('Utilisateur 1')).toBeInTheDocument();
      expect(screen.getByText('Utilisateur 5')).toBeInTheDocument();
      expect(screen.queryByText('Utilisateur 6')).not.toBeInTheDocument();
    });
  });

  describe('Accessibilité et UX', () => {
    it('devrait avoir une structure sémantique appropriée', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      // Vérifier la présence des titres de section (qui incluent les icônes)
      expect(screen.getByRole('heading', { name: /Alertes système/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Emprunts en retard/ })).toBeInTheDocument();
    });

    it('devrait avoir des liens accessibles', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      const link = screen.getByRole('link', { name: /Voir tous les retards/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href');
    });

    it('devrait afficher les informations de manière claire et organisée', () => {
      renderWithRouter(<AlertsPanel stats={mockStats} />);
      
      // Vérifier que les informations sont bien structurées
      expect(screen.getByText('Alice Martin')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.getByText('12 jours')).toBeInTheDocument();
    });
  });
});
