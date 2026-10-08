import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface BannerSectionProps {
  banners: Banner[];
  onBannerClick?: (banner: Banner) => void;
}

export const BannerSection: React.FC<BannerSectionProps> = ({ banners, onBannerClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <div
        onClick={() => onBannerClick && onBannerClick(currentBanner)}
        className="relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md group cursor-pointer transition transform hover:shadow-lg min-h-[170px] sm:min-h-[220px] md:min-h-[260px] flex items-center"
      >
        {/* Background Image with Dark Gradient Overlay */}
        <img
          src={currentBanner.image}
          alt={currentBanner.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent" />

        {/* Content Box */}
        <div className="relative z-10 p-4 sm:p-7 max-w-lg">
          {currentBanner.badge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{currentBanner.badge}</span>
            </div>
          )}

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-xs">
            {currentBanner.title}
          </h2>

          {currentBanner.subtitle && (
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-md font-medium leading-relaxed">
              {currentBanner.subtitle}
            </p>
          )}

          <div className="mt-3 sm:mt-4 flex items-center gap-2">
            <span className="inline-flex items-center text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              Explore Deals →
            </span>
          </div>
        </div>

        {/* Arrows for multi-banners */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous banner"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition z-20 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next banner"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition z-20 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {banners.map((b, idx) => (
                <button
                  key={b.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
