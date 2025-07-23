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

  // unify images array
  const getPostImages = () => {
    if (!post) return [];
    const { images, mediaType, mediaUrl, thumbnailUrl } = post;
    if (images && Array.isArray(images) && images.length) {
      return images;
    }
    if (mediaType === 'IMAGE' && mediaUrl) return [mediaUrl];
    if (mediaType === 'VIDEO' && thumbnailUrl) return [thumbnailUrl];
    for (const key of ['media_url','thumbnail_url','image_url','url']) {
      if (typeof post[key] === 'string') return [post[key]];
    }
    return [];
  };

  // bottom-to-top numbering
  const number = totalPosts - index;
  const TITLE = `BLOG #${number}`;

  const formatDate = ds => {
    const d = ds ? new Date(ds) : new Date();
    if (isNaN(d)) return ds || '';
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCaption = txt => {
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
  const isVideo = post.mediaType === 'VIDEO' && !!post.mediaUrl;
  const currentSrc = images[currentImageIndex];

  const onLoad = () => setImageLoaded(true);
  const onError = () => { setImageLoaded(true); setImageError(true); };

  // pick up either camelCase or snake_case
  const likeCount = post.likeCount ?? post.like_count;
  const commentsCount = post.commentsCount ?? post.comments_count;

  return (
    <div className={styles.postContainer}>
      <header className={styles.postHeader}>
        <h2 className={styles.postTitle}>{TITLE}</h2>
        <div className={styles.postMeta}>
          <span>{formatDate(post.date || post.timestamp)}</span>
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
            <video className={styles.media} controls poster={post.thumbnailUrl}>
              <source src={post.mediaUrl} type="video/mp4" />
            </video>
          ) : currentSrc ? (
            <img
              className={`${styles.media} ${imageLoaded && !imageError ? styles.loaded : ''}`}
              src={currentSrc}
              alt={`Imagem ${currentImageIndex+1}/${images.length}`}
              onLoad={onLoad}
              onError={onError}
              loading="lazy"
            />
          ) : (
            <div className={styles.noMedia}>Mídia não disponível</div>
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
              aria-label={`Ir para imagem ${idx+1}`}
              onClick={() => setCurrentImageIndex(idx)}
            />
          ))}
        </div>
      )}

      {post.caption && (
        <div
          className={styles.caption}
          dangerouslySetInnerHTML={{ __html: formatCaption(post.caption) }}
        />
      )}

      {/* Likes & Comments Count */}
      <footer className={styles.postStats}>
        {likeCount != null && <span>❤️ {likeCount.toLocaleString('pt-BR')}</span>}
        {commentsCount != null && <span>💬 {commentsCount.toLocaleString('pt-BR')}</span>}
      </footer>

      {/* Comments List */}
      {Array.isArray(post.comments) && post.comments.length > 0 && (
        <div className={styles.commentsSection}>
          {post.comments.map((c, i) => (
            <div key={i} className={styles.comment}>
              {c.username && <span className={styles.commentUser}>@{c.username}</span>}
              {c.text && <span className={styles.commentText}> {c.text}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstagramPost;
