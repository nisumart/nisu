import React from 'react';
import { CustomThumbnail } from '../types';
import { Layers } from 'lucide-react';

interface CustomThumbnailsProps {
  thumbnails: CustomThumbnail[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const CustomThumbnails: React.FC<CustomThumbnailsProps> = ({
  thumbnails,
  activeTag,
  onSelectTag,
}) => {
  if (!thumbnails || thumbnails.length === 0) {
    return null;
  }

  return (
    <section className="bg-white border-b border-slate-100 py-3 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Horizontal Scrollable Thumbnails Reel */}
        <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth">
          {/* 'All Items' Shortcut */}
          <button
            onClick={() => onSelectTag(null)}
            className="flex flex-col items-center group shrink-0 w-16 sm:w-20 cursor-pointer focus:outline-none"
          >
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center p-0.5 border-2 transition duration-200 ${
                activeTag === null
                  ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-xs'
                  : 'border-slate-200 bg-slate-50 group-hover:border-slate-300'
              }`}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  activeTag === null ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Layers className="w-6 h-6" />
              </div>
            </div>
            <span
              className={`mt-1.5 text-[11px] sm:text-xs font-semibold text-center leading-tight line-clamp-1 ${
                activeTag === null ? 'text-emerald-700 font-bold' : 'text-slate-700'
              }`}
            >
              All Items
            </span>
          </button>

          {/* Admin-Customizable Thumbnails */}
          {thumbnails.map((item) => {
            const isSelected = activeTag === item.tag;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTag(isSelected ? null : item.tag)}
                className="flex flex-col items-center group shrink-0 w-16 sm:w-20 cursor-pointer focus:outline-none transition"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 border-2 transition duration-200 overflow-hidden ${
                    isSelected
                      ? 'border-emerald-600 scale-105 shadow-md shadow-emerald-100 ring-2 ring-emerald-200'
                      : 'border-slate-200 group-hover:border-slate-400'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition duration-300 bg-slate-100"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs text-center leading-tight line-clamp-2 px-0.5 ${
                    isSelected
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-700 group-hover:text-slate-900 font-medium'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
