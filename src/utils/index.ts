// src/utils/index.ts
import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Utilitaire pour combiner les classes CSS avec Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formatage des dates
 */
export const formatDate = {
  short: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: fr });
  },
  
  long: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd MMMM yyyy', { locale: fr });
  },
  
  dateTime: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy à HH:mm', { locale: fr });
  },
  
  timeAgo: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
  }
};

/**
 * Vérification des dates
 */
export const dateUtils = {
  isOverdue: (dueDate: string | Date) => {
    const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return isBefore(dateObj, new Date());
  },
  
  isDueSoon: (dueDate: string | Date, days: number = 2) => {
    const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + days);
    return isBefore(dateObj, soonDate) && isAfter(dateObj, new Date());
  }
};

/**
 * Formatage des données
 */
export const formatters = {
  mediaType: (type: string) => {
    const types = {
      book: 'Livre',
      movie: 'Film',
      music: 'Musique'
    };
    return types[type as keyof typeof types] || type;
  },
  
  userRole: (role: string) => {
    const roles = {
      user: 'Utilisateur',
      employee: 'Employé',
      admin: 'Administrateur'
    };
    return roles[role as keyof typeof roles] || role;
  },
  
  borrowStatus: (status: string) => {
    const statuses = {
      borrowed: 'Emprunté',
      returned: 'Retourné',
      overdue: 'En retard'
    };
    return statuses[status as keyof typeof statuses] || status;
  }
};

/**
 * Validation d'email
 */
export const isValidEmail = (email: string): boolean => {
  // Regex plus stricte qui exige un domaine d'au moins 2 caractères après le point
  // et rejette les domaines commençant par un point
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  
  // Vérifications supplémentaires
  if (email.includes('@.')) return false; // Rejette @.com
  if (email.includes('..')) return false; // Rejette user..name@example.com
  if (email.startsWith('.') || email.endsWith('.')) return false; // Rejette .user@example.com ou user@example.com.
  
  return emailRegex.test(email);
};

/**
 * Debounce pour les recherches
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Troncature de texte
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Génération d'ID aléatoire
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};