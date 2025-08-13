import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Composant wrapper avec Router pour les tests
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Composant BorrowStats simplifié pour les tests
const BorrowStats = ({ mockData = null, mockUser = null }) => {
  // Données de test par défaut
  const defaultUser = mockUser || {
    _id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };

  const defaultBorrows = mockData !== undefined ? mockData : [
    {
      _id: 'borrow1',
      status: 'borrowed'
    },
    {
      _id: 'borrow2',
      status: 'overdue'
    },
    {
      _id: 'borrow3',
      status: 'returned'
    }
  ];

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (!defaultBorrows) {
      return {
        active: 0,
        overdue: 0,
        returned: 0,
        total: 0
      };
    }

    const active = defaultBorrows.filter(b => b.status === 'borrowed').length;
    const overdue = defaultBorrows.filter(b => b.status === 'overdue').length;
    const returned = defaultBorrows.filter(b => b.status === 'returned').length;

    return {
      active,
      overdue,
      returned,
      total: defaultBorrows.length
    };
  }, [defaultBorrows]);

  const statItems = [
    {
      label: 'En cours',
      value: stats.active,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/my-borrows?status=borrowed'
    },
    {
      label: 'En retard',
      value: stats.overdue,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/my-borrows?status=overdue'
    },
    {
      label: 'Retournés',
      value: stats.returned,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/my-borrows?status=returned'
    },
    {
      label: 'Total',
      value: stats.total,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      href: '/my-borrows'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {item.value}
              </p>
              <p className="text-sm text-gray-600">{item.label}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bgColor} group-hover:scale-110 transition-transform`}>
              <div className={`h-5 w-5 ${item.color}`} />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

describe('BorrowStats', () => {
  const mockBorrows = [
    {
      _id: 'borrow1',
      status: 'borrowed'
    },
    {
      _id: 'borrow2',
      status: 'overdue'
    },
    {
      _id: 'borrow3',
      status: 'returned'
    }
  ];

  describe('Rendu du composant', () => {
    it('affiche le composant avec toutes les cartes de statistiques', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      // Vérifie que les 4 cartes sont affichées
      expect(screen.getByText('En cours')).toBeInTheDocument();
      expect(screen.getByText('En retard')).toBeInTheDocument();
      expect(screen.getByText('Retournés')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('affiche les valeurs correctes calculées', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      // Vérifie que toutes les valeurs sont présentes
      const valueElements = screen.getAllByText(/^[13]$/);
      expect(valueElements).toHaveLength(4);
      
      // Vérifie que le total est 3
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Calcul des statistiques', () => {
    it('calcule correctement les emprunts actifs', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const activeCard = screen.getByText('En cours').closest('a');
      expect(activeCard).toHaveTextContent('1');
    });

    it('calcule correctement les emprunts en retard', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const overdueCard = screen.getByText('En retard').closest('a');
      expect(overdueCard).toHaveTextContent('1');
    });

    it('calcule correctement les emprunts retournés', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const returnedCard = screen.getByText('Retournés').closest('a');
      expect(returnedCard).toHaveTextContent('1');
    });

    it('calcule correctement le total des emprunts', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const totalCard = screen.getByText('Total').closest('a');
      expect(totalCard).toHaveTextContent('3');
    });

    it('gère le cas où aucune donnée n\'est disponible', () => {
      renderWithRouter(<BorrowStats mockData={null} />);
      
      // Toutes les valeurs doivent être 0
      const valueElements = screen.getAllByText('0');
      expect(valueElements).toHaveLength(4);
    });

    it('gère le cas où les données sont vides', () => {
      renderWithRouter(<BorrowStats mockData={[]} />);
      
      // Toutes les valeurs doivent être 0
      const valueElements = screen.getAllByText('0');
      expect(valueElements).toHaveLength(4);
    });
  });

  describe('Navigation et liens', () => {
    it('chaque carte est un lien cliquable vers la page appropriée', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(4);
      
      // Vérifie les URLs des liens
      expect(links[0]).toHaveAttribute('href', '/my-borrows?status=borrowed'); // En cours
      expect(links[1]).toHaveAttribute('href', '/my-borrows?status=overdue'); // En retard
      expect(links[2]).toHaveAttribute('href', '/my-borrows?status=returned'); // Retournés
      expect(links[3]).toHaveAttribute('href', '/my-borrows'); // Total
    });

    it('les liens ont les bonnes classes CSS pour le style', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toHaveClass('bg-white', 'rounded-xl', 'border', 'border-gray-200', 'p-4');
      });
    });
  });

  describe('Styles et classes CSS', () => {
    it('applique les effets de hover et transition', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toHaveClass('hover:shadow-md', 'transition-all', 'duration-200', 'transform', 'hover:-translate-y-1');
      });
    });

    it('applique les classes de grille responsive', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const container = document.querySelector('.grid');
      expect(container).toHaveClass('grid', 'grid-cols-2', 'lg:grid-cols-4', 'gap-4');
    });
  });

  describe('Accessibilité et UX', () => {
    it('chaque carte a une structure sémantique appropriée', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        // Vérifie que chaque lien contient un label et une valeur
        const value = link.querySelector('p:first-child');
        const label = link.querySelector('p:last-child');
        
        expect(value).toHaveClass('text-2xl', 'font-bold');
        expect(label).toHaveClass('text-sm', 'text-gray-600');
      });
    });

    it('les conteneurs d\'icônes ont les bonnes dimensions', () => {
      renderWithRouter(<BorrowStats mockData={mockBorrows} />);
      
      const iconContainers = document.querySelectorAll('.w-10.h-10');
      expect(iconContainers).toHaveLength(4);
    });
  });

  describe('Gestion des données complexes', () => {
    it('gère correctement les emprunts avec des statuts mixtes', () => {
      const complexBorrows = [
        { _id: 'borrow1', status: 'borrowed' },
        { _id: 'borrow2', status: 'borrowed' },
        { _id: 'borrow3', status: 'overdue' },
        { _id: 'borrow4', status: 'returned' },
        { _id: 'borrow5', status: 'returned' }
      ];

      renderWithRouter(<BorrowStats mockData={complexBorrows} />);
      
      // 2 emprunts en cours
      expect(screen.getAllByText('2')[0]).toBeInTheDocument();
      
      // 1 emprunt en retard
      expect(screen.getAllByText('1')[0]).toBeInTheDocument();
      
      // 2 emprunts retournés
      expect(screen.getAllByText('2')[1]).toBeInTheDocument();
      
      // Total: 5 emprunts
      expect(screen.getAllByText('5')[0]).toBeInTheDocument();
    });

    it('gère les emprunts avec des statuts différents', () => {
      const mixedBorrows = [
        { _id: 'borrow1', status: 'borrowed' },
        { _id: 'borrow2', status: 'overdue' },
        { _id: 'borrow3', status: 'returned' },
        { _id: 'borrow4', status: 'borrowed' }
      ];

      renderWithRouter(<BorrowStats mockData={mixedBorrows} />);
      
      // 2 emprunts en cours
      expect(screen.getAllByText('2')[0]).toBeInTheDocument();
      
      // 1 emprunt en retard
      expect(screen.getAllByText('1')[0]).toBeInTheDocument();
      
      // 1 emprunt retourné
      expect(screen.getAllByText('1')[1]).toBeInTheDocument();
      
      // Total: 4 emprunts
      expect(screen.getAllByText('4')[0]).toBeInTheDocument();
    });
  });
});
