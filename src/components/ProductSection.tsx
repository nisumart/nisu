import React, { useState, useMemo } from 'react';
import { Product, CustomThumbnail } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, X, Search } from 'lucide-react';

interface ProductSectionProps {
  products: Product[];
  thumbnails: CustomThumbnail[];
  activeThumbnailTag: string | null;
  onClearThumbnailTag: () => void;
  searchQuery: string;
  onClearSearch: () => void;
  wishlistIds: string[];
  cartProductIds: string[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'popular';
type PriceFilter = 'all' | 'under-500' | '500-1000' | 'above-1000';

export const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  thumbnails,
  activeThumbnailTag,
  onClearThumbnailTag,
  searchQuery,
  onClearSearch,
  wishlistIds,
  cartProductIds,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');

  const activeThumbnail = useMemo(() => {
    return thumbnails.find((t) => t.tag === activeThumbnailTag);
  }, [thumbnails, activeThumbnailTag]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Must be active
        if (p.isAvailable === false) return false;

        // When search query is entered, search across ALL products by Name or Product ID
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesId = p.productId.toLowerCase().includes(q);
          const matchesDesc = p.description ? p.description.toLowerCase().includes(q) : false;
          if (!matchesName && !matchesId && !matchesDesc) return false;
        } else if (activeThumbnailTag) {
          // If no search query, filter by custom thumbnail tag
          if (p.thumbnailTag !== activeThumbnailTag) {
            const matchTag =
              p.thumbnailTag && p.thumbnailTag.toLowerCase() === activeThumbnailTag.toLowerCase();
            if (!matchTag) return false;
          }
        }

        // Price filter
        if (priceFilter === 'under-500' && p.price >= 500) return false;
        if (priceFilter === '500-1000' && (p.price < 500 || p.price > 1000)) return false;
        if (priceFilter === 'above-1000' && p.price <= 1000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'popular') return (b.originalPrice || b.price) - (a.originalPrice || a.price);
        return 0;
      });
  }, [products, searchQuery, activeThumbnailTag, priceFilter, sortBy]);

  return (
    <section id="products-catalog" className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Section Header & Active Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeThumbnail
                ? activeThumbnail.title
                : 'Explore Products'}
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredProducts.length} items
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            Original NISUMART products with verified Madhya Pradesh delivery
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Price Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                priceFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPriceFilter('under-500')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                priceFilter === 'under-500' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Under ₹500
            </button>
            <button
              onClick={() => setPriceFilter('500-1000')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                priceFilter === '500-1000' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ₹500 - ₹1000
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            aria-label="Sort products"
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Best Discounts</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags Bar */}
      {(searchQuery || (activeThumbnailTag && !searchQuery) || priceFilter !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap mb-4 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-800">Active Filter:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-white text-emerald-800 text-xs px-2 py-0.5 rounded border border-emerald-200 font-medium">
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={onClearSearch}
                className="hover:text-rose-600 p-0.5 cursor-pointer"
                title="Remove search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {!searchQuery && activeThumbnail && (
            <span className="inline-flex items-center gap-1 bg-white text-emerald-800 text-xs px-2 py-0.5 rounded border border-emerald-200 font-medium">
              <span>Section: {activeThumbnail.title}</span>
              <button
                onClick={onClearThumbnailTag}
                className="hover:text-rose-600 p-0.5 cursor-pointer"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {priceFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-white text-emerald-800 text-xs px-2 py-0.5 rounded border border-emerald-200 font-medium">
              <span>Price: {priceFilter === 'under-500' ? '< ₹500' : '₹500 - ₹1000'}</span>
              <button
                onClick={() => setPriceFilter('all')}
                className="hover:text-rose-600 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={() => {
              onClearThumbnailTag();
              onClearSearch();
              setPriceFilter('all');
            }}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-semibold ml-auto cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Two-Column Mobile Grid (Responsive to 3-4 cols) */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              isInCart={cartProductIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find any products matching "${searchQuery}". Please check the spelling or try searching for a different item or Product ID.`
              : 'No products available under the selected filters.'}
          </p>
          <button
            onClick={() => {
              onClearThumbnailTag();
              onClearSearch();
              setPriceFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition cursor-pointer"
          >
            View All Products
          </button>
        </div>
      )}
    </section>
  );
};
