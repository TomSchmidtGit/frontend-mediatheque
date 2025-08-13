// src/pages/media/MediaDetailPage.tsx - Avec fonctionnalité d'emprunt
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  HeartIcon,
  StarIcon,
  CalendarIcon,
  UserIcon,
  BookOpenIcon,
  FilmIcon,
  MusicalNoteIcon,
  ClockIcon,
  ChatBubbleLeftEllipsisIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import mediaService from '../../services/mediaService';
import { formatters, formatDate, cn } from '../../utils';
import toast from 'react-hot-toast';
import type { Media } from '../../types';

const MediaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Requête pour récupérer les détails du média
  const {
    data: media,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['media', id],
    queryFn: () =>
      id ? mediaService.getMediaById(id) : Promise.reject('No ID'),
    enabled: !!id,
  });

  // Mutation pour emprunter un média - DÉSACTIVÉE (gestion en présentiel)
  // const borrowMediaMutation = useMutation({
  //   mutationFn: (mediaId: string) => borrowService.borrowMedia(mediaId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['media', id] });
  //     queryClient.invalidateQueries({ queryKey: ['my-borrows'] });
  //     toast.success('Média emprunté avec succès ! Vous pouvez le consulter dans "Mes emprunts".');
  //   },
  //   onError: (error: any) => {
  //     const message = error.response?.data?.message || 'Erreur lors de l\'emprunt';
  //     toast.error(message);
  //   }
  // });

  // Mutation pour les favoris
  const toggleFavoriteMutation = useMutation({
    mutationFn: (mediaId: string) => mediaService.toggleFavorite(mediaId),
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ['media', id] });
      toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des favoris');
    },
  });

  // Mutation pour ajouter un avis
  const addReviewMutation = useMutation({
    mutationFn: ({
      mediaId,
      rating,
      comment,
    }: {
      mediaId: string;
      rating: number;
      comment?: string;
    }) => mediaService.addReview(mediaId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', id] });
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Avis ajouté avec succès');
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de l'avis");
    },
  });

  // État local pour les favoris
  const [isFavorite, setIsFavorite] = useState(
    user?.favorites?.includes(id || '') || false
  );

  // Synchroniser l'état local avec les données utilisateur
  React.useEffect(() => {
    setIsFavorite(user?.favorites?.includes(id || '') || false);
  }, [user?.favorites, id]);

  // Données factices pour la démo
  const mockMedia: Media = {
    _id: id || '',
    title: "Le Seigneur des Anneaux - La Communauté de l'Anneau",
    type: 'book',
    author: 'J.R.R. Tolkien',
    year: 1954,
    available: true,
    description:
      "Dans un trou vivait un hobbit. Non point un trou déplaisant, sale et humide, rempli de bouts de vers et d'une odeur suintante, non plus qu'un trou sec, nu, sablonneux, sans rien pour s'asseoir ni sur quoi manger : c'était un trou de hobbit, ce qui implique le confort.",
    imageUrl: 'https://picsum.photos/400/600?random=1',
    category: {
      _id: '1',
      name: 'Fantasy',
      slug: 'fantasy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    tags: [
      {
        _id: '1',
        name: 'aventure',
        slug: 'aventure',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '2',
        name: 'épique',
        slug: 'epique',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    reviews: [
      {
        _id: '1',
        user: 'user1',
        rating: 5,
        comment:
          "Un chef-d'œuvre absolu ! Tolkien a créé un univers d'une richesse incroyable.",
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        _id: '2',
        user: 'user2',
        rating: 4,
        comment:
          'Excellent livre, même si parfois un peu long dans les descriptions.',
        createdAt: '2024-01-10T15:30:00Z',
      },
    ],
    averageRating: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const displayMedia = media || mockMedia;
  const userHasReviewed = displayMedia.reviews.some(
    review => review.user === user?._id
  );

  // Gestion des erreurs
  if (error) {
    return (
      <div className='page-container py-16'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Média introuvable
          </h1>
          <p className='text-gray-600 mb-4'>
            Le média que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link to='/catalog' className='btn-primary'>
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  // État de chargement
  if (isLoading) {
    return (
      <div className='page-container py-16'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Chargement du média...</p>
        </div>
      </div>
    );
  }

  // Icône selon le type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookOpenIcon className='h-5 w-5' />;
      case 'movie':
        return <FilmIcon className='h-5 w-5' />;
      case 'music':
        return <MusicalNoteIcon className='h-5 w-5' />;
      default:
        return <BookOpenIcon className='h-5 w-5' />;
    }
  };

  // Couleur selon le type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book':
        return 'bg-blue-100 text-blue-800';
      case 'movie':
        return 'bg-purple-100 text-purple-800';
      case 'music':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Gestion des favoris
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }
    toggleFavoriteMutation.mutate(displayMedia._id);
  };

  // Gestion de l'emprunt - DÉSACTIVÉE (gestion en présentiel uniquement)
  // const handleBorrow = () => {
  //   if (!isAuthenticated) {
  //     toast.error('Connectez-vous pour emprunter ce média');
  //     navigate('/login');
  //     return;
  //   }

  //   if (!displayMedia.available) {
  //     toast.error('Ce média n\'est pas disponible');
  //     return;
  //   }

  //   if (confirm(`Voulez-vous emprunter "${displayMedia.title}" ?`)) {
  //     borrowMediaMutation.mutate(displayMedia._id);
  //   }
  // };

  // Soumission d'un avis
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour laisser un avis');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReviewMutation.mutateAsync({
        mediaId: displayMedia._id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Affichage des étoiles
  const renderStars = (
    rating: number,
    interactive = false,
    onRatingChange?: (rating: number) => void
  ) => {
    return Array.from({ length: 5 }, (_, index) => {
      const StarComponent =
        index < Math.floor(rating) ? StarIconSolid : StarIcon;
      return (
        <StarComponent
          key={index}
          className={cn(
            'h-5 w-5 transition-colors',
            interactive ? 'cursor-pointer hover:text-yellow-400' : '',
            index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
          )}
          onClick={() => interactive && onRatingChange?.(index + 1)}
        />
      );
    });
  };

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='page-container py-8'>
        {/* Breadcrumb / Navigation */}
        <div className='mb-8'>
          <button
            onClick={() => navigate(-1)}
            className='inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors'
          >
            <ArrowLeftIcon className='h-4 w-4 mr-2' />
            Retour
          </button>
        </div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Colonne image et infos principales */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-8'>
              {/* Image */}
              <div className='aspect-[3/4] bg-gray-100'>
                {displayMedia.imageUrl ? (
                  <img
                    src={displayMedia.imageUrl}
                    alt={displayMedia.title}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
                    {getTypeIcon(displayMedia.type)}
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className='p-6 space-y-4'>
                {/* Badge type et disponibilité */}
                <div className='flex items-center justify-between'>
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      getTypeColor(displayMedia.type)
                    )}
                  >
                    {getTypeIcon(displayMedia.type)}
                    <span className='ml-1'>
                      {formatters.mediaType(displayMedia.type)}
                    </span>
                  </span>

                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      displayMedia.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}
                  >
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full mr-2',
                        displayMedia.available ? 'bg-green-500' : 'bg-red-500'
                      )}
                    />
                    {displayMedia.available ? 'Disponible' : 'Emprunté'}
                  </span>
                </div>

                {/* Actions */}
                <div className='space-y-3'>
                  {/* Affichage du statut sans possibilité d'emprunter */}
                  <div
                    className={cn(
                      'w-full px-4 py-3 rounded-md text-center font-medium',
                      displayMedia.available
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    )}
                  >
                    <ClockIcon className='h-4 w-4 inline mr-2' />
                    {displayMedia.available
                      ? 'Disponible en médiathèque'
                      : 'Actuellement emprunté'}
                  </div>

                  <div className='text-center text-xs text-gray-500 italic px-2'>
                    Les emprunts se font uniquement en présentiel à la
                    médiathèque
                  </div>

                  <button
                    onClick={handleToggleFavorite}
                    disabled={toggleFavoriteMutation.isPending}
                    className={cn(
                      'w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2',
                      isFavorite
                        ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus:ring-red-500'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
                      toggleFavoriteMutation.isPending &&
                        'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {toggleFavoriteMutation.isPending ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2'></div>
                        {isFavorite ? 'Suppression...' : 'Ajout...'}
                      </>
                    ) : isFavorite ? (
                      <>
                        <HeartIconSolid className='h-4 w-4 mr-2 text-red-500' />
                        Retirer des favoris
                      </>
                    ) : (
                      <>
                        <HeartIcon className='h-4 w-4 mr-2' />
                        Ajouter aux favoris
                      </>
                    )}
                  </button>
                </div>

                {/* Métadonnées */}
                <div className='space-y-2 pt-4 border-t border-gray-200'>
                  <div className='flex items-center text-sm text-gray-600'>
                    <UserIcon className='h-4 w-4 mr-2' />
                    <span>{displayMedia.author}</span>
                  </div>
                  <div className='flex items-center text-sm text-gray-600'>
                    <CalendarIcon className='h-4 w-4 mr-2' />
                    <span>{displayMedia.year}</span>
                  </div>
                  {displayMedia.category && (
                    <div className='flex items-center text-sm text-gray-600'>
                      <span className='font-medium'>Catégorie:</span>
                      <span className='ml-2'>{displayMedia.category.name}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {displayMedia.tags.length > 0 && (
                  <div className='pt-4 border-t border-gray-200'>
                    <div className='flex flex-wrap gap-2'>
                      {displayMedia.tags.map(tag => (
                        <Link
                          key={tag._id}
                          to={`/catalog?tags=${tag._id}`}
                          className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne contenu principal */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Titre et description */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
                {displayMedia.title}
              </h1>

              {/* Note moyenne */}
              {displayMedia.averageRating > 0 && (
                <div className='flex items-center space-x-2 mb-6'>
                  <div className='flex items-center space-x-1'>
                    {renderStars(displayMedia.averageRating)}
                  </div>
                  <span className='text-lg font-medium text-gray-900'>
                    {displayMedia.averageRating.toFixed(1)}
                  </span>
                  <span className='text-sm text-gray-500'>
                    ({displayMedia.reviews.length} avis)
                  </span>
                </div>
              )}

              {displayMedia.description && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    Description
                  </h3>
                  <p className='text-gray-700 leading-relaxed'>
                    {displayMedia.description}
                  </p>
                </div>
              )}
            </div>

            {/* Section avis */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-semibold text-gray-900 flex items-center'>
                  <ChatBubbleLeftEllipsisIcon className='h-5 w-5 mr-2' />
                  Avis ({displayMedia.reviews.length})
                </h3>

                {isAuthenticated && !userHasReviewed && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className='btn-primary text-sm'
                  >
                    <PlusIcon className='h-4 w-4 mr-1' />
                    Laisser un avis
                  </button>
                )}
              </div>

              {/* Formulaire d'ajout d'avis */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className='mb-6 p-4 bg-gray-50 rounded-lg'
                >
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Note
                      </label>
                      <div className='flex items-center space-x-1'>
                        {renderStars(reviewRating, true, setReviewRating)}
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Commentaire (optionnel)
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        rows={3}
                        className='input w-full resize-none'
                        placeholder='Partagez votre opinion sur ce média...'
                      />
                    </div>

                    <div className='flex items-center space-x-3'>
                      <button
                        type='submit'
                        disabled={isSubmittingReview}
                        className='btn-primary text-sm'
                      >
                        {isSubmittingReview ? 'Envoi...' : "Publier l'avis"}
                      </button>
                      <button
                        type='button'
                        onClick={() => setShowReviewForm(false)}
                        className='btn-secondary text-sm'
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Liste des avis */}
              {displayMedia.reviews.length > 0 ? (
                <div className='space-y-4'>
                  {displayMedia.reviews.map(review => (
                    <div
                      key={review._id}
                      className='border-b border-gray-100 pb-4 last:border-b-0'
                    >
                      <div className='flex items-start space-x-3'>
                        <div className='flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center'>
                          <span className='text-xs font-medium text-white'>
                            {review.user.toString().charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <div className='flex items-center space-x-1'>
                              {renderStars(review.rating)}
                            </div>
                            <span className='text-sm text-gray-500'>
                              {formatDate.timeAgo(review.createdAt)}
                            </span>
                          </div>
                          {review.comment && (
                            <p className='text-gray-700 text-sm leading-relaxed'>
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <ChatBubbleLeftEllipsisIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>Aucun avis pour l'instant</p>
                  {!isAuthenticated && (
                    <p className='text-sm text-gray-400 mt-2'>
                      <Link
                        to='/login'
                        className='text-primary-600 hover:text-primary-700'
                      >
                        Connectez-vous
                      </Link>{' '}
                      pour laisser le premier avis
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailPage;
