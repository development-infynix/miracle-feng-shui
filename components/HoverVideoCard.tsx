'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface HoverVideoCardProps {
  id?: string;
  title: string;
  image: string;
  videoUrl?: string;
  slug: string;
  className?: string;
  isFavorited?: boolean;
  onToggleWishlist?: (id: string, e: React.MouseEvent) => void;
}

export function HoverVideoCard({
  id = 'card-video',
  title,
  image,
  videoUrl,
  slug,
  className = '',
  isFavorited = false,
  onToggleWishlist,
}: HoverVideoCardProps) {
  const { showGuestToast, userLoggedIn } = useCart();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [internalFav, setInternalFav] = useState(false);

  const isFav = onToggleWishlist ? isFavorited : internalFav;

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log('Video play error:', err);
          });
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(id, e);
    } else {
      setInternalFav((prev) => {
        const next = !prev;
        if (next && !userLoggedIn) {
          showGuestToast(
            "Don't lose this favourite!",
            'to add to your wishlist.',
            'favorite'
          );
        }
        return next;
      });
    }
  };

  return (
    <Link
      href={`/shop?category=${encodeURIComponent(slug)}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[#F0EFEB] shadow-2xs hover:shadow-md transition-all flex flex-col justify-end no-underline ${className}`}
    >
      {/* Poster Image */}
      <img
        src={image}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-103 ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Hover-play Video */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isPlaying ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
          }`}
          onPlay={() => setIsPlaying(true)}
        />
      )}

      {/* Wishlist Heart Button on Hover */}
      <button
        type="button"
        aria-label={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={handleWishlistClick}
        style={{ backgroundColor: '#ffffff' }}
        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200 z-30 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer border border-black/10"
      >
        <i
          className={`text-[13px] transition-colors ${
            isFav
              ? 'fa-solid fa-heart text-[#A84218]'
              : 'fa-regular fa-heart text-etsy-dark hover:text-[#A84218]'
          }`}
        />
      </button>

      {/* Play Icon Badge */}
      {videoUrl && (
        <div
          className={`absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs text-etsy-dark flex items-center justify-center shadow-md transition-all duration-300 z-20 pointer-events-none ${
            isPlaying ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
          }`}
        >
          <i className="fa-solid fa-play text-[11px] text-[#222222] ml-0.5" />
        </div>
      )}
    </Link>
  );
}
