// InstagramPost.jsx
import React, { useState, useEffect } from 'react';
import styles from './InstagramPost.module.css';

const InstagramPost = ({ post, index, totalPosts }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // DEBUG: inspect your post object
  useEffect(() => {
    console.log('🔍 InstagramPost.post:', post);
  }, [post]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoaded(false);
    setImageError(false);
  }, [post.id]);

  // Updated to work with your new API structure
  const getPostImages = () => {
    if (!post) return [];

    // Your API returns an 'images' array - use that first
    if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      return post.images;
    }

    // Fallback for single media items based on mediaType
    if (post.mediaType === 'IMAGE' && post.media_url) {
      return [post.media_url];
    }

    if (post.mediaType === 'VIDEO' && post.thumbnail_url) {
      return [post.thumbnail_url];
    }

    // Additional fallbacks for different field naming conventions
    const fallbackFields = ['media_url', 'thumbnail_url', 'image_url', 'url'];
    for (const field of fallbackFields) {
      if (typeof post[field] === 'string') {
        return [post[field]];
      }
    }

    return [];
  };

  // bottom-to-top numbering
  const number = totalPosts - index;
  const TITLE = post.titulo || `BLOG #${number}`;

  const formatDate = (dateString) => {
    // Your API returns 'data' field with timestamp
    const dateToFormat = dateString || post.data || post.timestamp;
    const d = dateToFormat ? new Date(dateToFormat) : new Date();

    if (isNaN(d)) return dateToFormat || '';

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCaption = (txt) => {
    if (!txt) return '';
    return txt
      .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
      .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
      .replace(/\n/g, '<br>');
  };

  if (!post) return <div className={styles.placeholder}>Carregando...</div>;
  if (post.error) return <div className={styles.error}>Erro: {post.error}</div>;

  const images = getPostImages();
  const hasMultiple = images.length > 1;
  const isVideo = post.mediaType === 'VIDEO';
  const currentSrc = images[currentImageIndex];

  const onLoad = () => setImageLoaded(true);
  const onError = () => {
    setImageLoaded(true);
    setImageError(true);
    console.error('Erro ao carregar imagem:', currentSrc);
  };

  // Your API doesn't return like/comment counts, but keeping for future compatibility
  const likeCount = post.likeCount ?? post.like_count;
  const commentsCount = post.commentsCount ?? post.comments_count;

  return (
    <div className={styles.postContainer}>
      <header className={styles.postHeader}>
        <h2 className={styles.postTitle}>{TITLE}</h2>
        <div className={styles.postMeta}>
          <span>{formatDate()}</span>
          {post.username && <span>@{post.username}</span>}
        </div>
      </header>

      <div className={styles.mediaContainer}>
        {hasMultiple && (
          <button
            className={styles.navButton}
            aria-label="Anterior"
            onClick={() => setCurrentImageIndex(i => (i - 1 + images.length) % images.length)}
          >
            ‹
          </button>
        )}

        <div className={styles.mediaWrapper}>
          {isVideo ? (
            <video
              className={styles.media}
              controls
              poster={images[0]} // Use first image as poster
              onLoadedData={() => setImageLoaded(true)}
            >
              <source src={post.media_url} type="video/mp4" />
              Seu navegador não suporta o elemento de vídeo.
            </video>
          ) : currentSrc ? (
            <img
              className={`${styles.media} ${imageLoaded && !imageError ? styles.loaded : ''}`}
              src={currentSrc}
              alt={post.titulo || `Imagem ${currentImageIndex + 1}/${images.length}`}
              onLoad={onLoad}
              onError={onError}
              loading="lazy"
            />
          ) : (
            <div className={styles.noMedia}>Mídia não disponível</div>
          )}

          {!imageLoaded && !imageError && (
            <div className={styles.loadingSpinner}>Carregando...</div>
          )}

          {imageError && (
            <div className={styles.errorMessage}>
              Erro ao carregar imagem
            </div>
          )}
        </div>

        {hasMultiple && (
          <button
            className={styles.navButton}
            aria-label="Próxima"
            onClick={() => setCurrentImageIndex(i => (i + 1) % images.length)}
          >
            ›
          </button>
        )}
      </div>

      {hasMultiple && (
        <div className={styles.dots}>
          {images.map((_, idx) => (
            <button
              key={idx}
              className={idx === currentImageIndex ? styles.activeDot : styles.dot}
              aria-label={`Ir para imagem ${idx + 1}`}
              onClick={() => setCurrentImageIndex(idx)}
            />
          ))}
        </div>
      )}

      {/* Use 'legenda' field from your API */}
      {post.legenda && (
        <div
          className={styles.caption}
          dangerouslySetInnerHTML={{ __html: formatCaption(post.legenda) }}
        />
      )}

      {/* Likes & Comments Count - keeping for future compatibility */}
      {(likeCount != null || commentsCount != null) && (
        <footer className={styles.postStats}>
          {likeCount != null && <span>❤️ {likeCount.toLocaleString('pt-BR')}</span>}
          {commentsCount != null && <span>💬 {commentsCount.toLocaleString('pt-BR')}</span>}
        </footer>
      )}

      {/* Comments List - keeping for future compatibility */}
      {Array.isArray(post.comments) && post.comments.length > 0 && (
        <div className={styles.commentsSection}>
          <h4>Comentários:</h4>
          {post.comments.map((c, i) => (
            <div key={i} className={styles.comment}>
              {c.username && <span className={styles.commentUser}>@{c.username}</span>}
              {c.text && <span className={styles.commentText}> {c.text}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Add link to original Instagram post */}
      {post.permalink && (
        <footer className={styles.postFooter}>
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramLink}
          >
            Ver no Instagram →
          </a>
        </footer>
      )}
    </div>
  );
};

export default InstagramPost;