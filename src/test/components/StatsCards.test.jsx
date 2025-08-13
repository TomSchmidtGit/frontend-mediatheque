import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StatsCards from '../../components/admin/StatsCards';

// Mock des icônes Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  UsersIcon: ({ className }) => <div data-testid="users-icon" className={className} />,
  BookOpenIcon: ({ className }) => <div data-testid="book-icon" className={className} />,
  ClockIcon: ({ className }) => <div data-testid="clock-icon" className={className} />,
  ExclamationTriangleIcon: ({ className }) => <div data-testid="exclamation-icon" className={className} />,
  CheckCircleIcon: ({ className }) => <div data-testid="check-icon" className={className} />,
  ArrowTrendingUpIcon: ({ className }) => <div data-testid="arrow-icon" className={className} />
}));

// Mock de la fonction cn
vi.mock('../../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

describe('StatsCards', () => {
  const mockStats = {
    users: {
      total: 1250,
      active: 1180,
      inactive: 70,
      newThisMonth: 45
    },
    media: {
      total: 3500,
      byType: {
        book: 2000,
        movie: 1000,
        music: 500
      }
    },
    borrows: {
      active: 280,
      overdue: 12,
      returned: 2150,
      total: 2430
    },
    topBorrowedMedia: [],
    recentBorrows: [],
    mostActiveUsers: [],
    alerts: [
      {
        type: 'warning',
        message: 'Emprunts en retard',
        priority: 'high'
      },
      {
        type: 'info',
        message: 'Nouveaux médias disponibles',
        priority: 'low'
      }
    ],
    overdueDetails: []
  };

  describe('État de chargement', () => {
    it('affiche le skeleton loader quand loading est true', () => {
      render(<StatsCards stats={mockStats} loading={true} />);
      
      // Vérifie que 8 cartes de skeleton sont affichées (avec les classes CSS appropriées)
      const skeletonCards = document.querySelectorAll('.animate-pulse');
      expect(skeletonCards).toHaveLength(8);
      
      // Vérifie que les vraies statistiques ne sont pas affichées
      expect(screen.queryByText('Utilisateurs totaux')).not.toBeInTheDocument();
    });
  });

  describe('Affichage des statistiques', () => {
    beforeEach(() => {
      render(<StatsCards stats={mockStats} loading={false} />);
    });

    it('affiche toutes les cartes de statistiques', () => {
      expect(screen.getByText('Utilisateurs totaux')).toBeInTheDocument();
      expect(screen.getByText('Utilisateurs actifs')).toBeInTheDocument();
      expect(screen.getByText('Médias totaux')).toBeInTheDocument();
      expect(screen.getByText('Emprunts actifs')).toBeInTheDocument();
      expect(screen.getByText('Emprunts en retard')).toBeInTheDocument();
      expect(screen.getByText('Emprunts retournés')).toBeInTheDocument();
      expect(screen.getByText('Taux de retour')).toBeInTheDocument();
      expect(screen.getByText('Alertes actives')).toBeInTheDocument();
    });

    it('affiche les valeurs correctes formatées', () => {
      expect(screen.getByText('1 250')).toBeInTheDocument(); // Utilisateurs totaux
      expect(screen.getByText('1 180')).toBeInTheDocument(); // Utilisateurs actifs
      expect(screen.getByText('3 500')).toBeInTheDocument(); // Médias totaux
      expect(screen.getByText('280')).toBeInTheDocument(); // Emprunts actifs
      expect(screen.getByText('12')).toBeInTheDocument(); // Emprunts en retard
      expect(screen.getByText('2 150')).toBeInTheDocument(); // Emprunts retournés
      expect(screen.getByText('88%')).toBeInTheDocument(); // Taux de retour
      expect(screen.getByText('1')).toBeInTheDocument(); // Alertes actives (high priority)
    });

    it('affiche les sous-titres corrects', () => {
      expect(screen.getByText('70 inactifs')).toBeInTheDocument();
      expect(screen.getByText('2000 livres, 1000 films, 500 musiques')).toBeInTheDocument();
      expect(screen.getByText('2430 au total')).toBeInTheDocument();
      expect(screen.getByText('2 au total')).toBeInTheDocument();
    });

    it('affiche les changements mensuels', () => {
      expect(screen.getByText('+45 nouveaux ce mois')).toBeInTheDocument();
    });
  });

  describe('Gestion des alertes', () => {
    it('applique le style d\'alerte pour les emprunts en retard', () => {
      render(<StatsCards stats={mockStats} loading={false} />);
      
      const overdueCard = screen.getByText('Emprunts en retard').closest('div').parentElement.parentElement;
      expect(overdueCard).toHaveClass('border-red-200', 'bg-red-50');
    });

    it('affiche le bon nombre d\'alertes actives', () => {
      render(<StatsCards stats={mockStats} loading={false} />);
      
      // 1 alerte avec priorité 'high'
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Icônes et couleurs', () => {
    beforeEach(() => {
      render(<StatsCards stats={mockStats} loading={false} />);
    });

    it('affiche les bonnes icônes pour chaque carte', () => {
      expect(screen.getAllByTestId('users-icon')).toHaveLength(2); // 2 cartes utilisateurs
      expect(screen.getByTestId('book-icon')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('exclamation-icon')).toHaveLength(2); // Retard + Alertes
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('arrow-icon')).toHaveLength(2); // 2 cartes utilisent ArrowTrendingUpIcon
    });
  });

  describe('Calculs et formatage', () => {
    it('calcule correctement le taux de retour', () => {
      render(<StatsCards stats={mockStats} loading={false} />);
      
      // 2150 retournés / 2430 total = 88.48% arrondi à 88%
      expect(screen.getByText('88%')).toBeInTheDocument();
    });

    it('formate correctement les grands nombres', () => {
      render(<StatsCards stats={mockStats} loading={false} />);
      
      expect(screen.getByText('1 250')).toBeInTheDocument();
      expect(screen.getByText('3 500')).toBeInTheDocument();
      expect(screen.getByText('2 150')).toBeInTheDocument();
    });
  });

  describe('Responsive design', () => {
    it('applique les classes CSS responsives', () => {
      render(<StatsCards stats={mockStats} loading={false} />);
      
      const container = screen.getByText('Utilisateurs totaux').closest('div').parentElement.parentElement.parentElement;
      expect(container).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  describe('Cas limites', () => {
    it('gère les statistiques avec des valeurs nulles', () => {
      const emptyStats = {
        users: { total: 0, active: 0, inactive: 0, newThisMonth: 0 },
        media: { total: 0, byType: { book: 0, movie: 0, music: 0 } },
        borrows: { active: 0, overdue: 0, returned: 0, total: 0 },
        topBorrowedMedia: [],
        recentBorrows: [],
        mostActiveUsers: [],
        alerts: [],
        overdueDetails: []
      };

      render(<StatsCards stats={emptyStats} loading={false} />);
      
      // Vérifie que les valeurs 0 sont affichées (prend la première occurrence)
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
      expect(screen.getByText('NaN%')).toBeInTheDocument(); // Taux de retour avec 0 emprunts
    });

    it('gère les statistiques avec des valeurs très élevées', () => {
      const largeStats = {
        ...mockStats,
        users: { ...mockStats.users, total: 999999 },
        media: { ...mockStats.media, total: 999999 }
      };

      render(<StatsCards stats={largeStats} loading={false} />);
      
      // Vérifie que les valeurs très élevées sont affichées (prend la première occurrence)
      const largeValueElements = screen.getAllByText('999 999');
      expect(largeValueElements.length).toBeGreaterThan(0);
    });
  });
});
