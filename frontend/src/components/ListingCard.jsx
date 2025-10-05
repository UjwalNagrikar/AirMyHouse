import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListingBar = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: '🏘️', filter: '' },
    { id: 'beachfront', name: 'Beachfront', icon: '🏖️', filter: 'beachfront' },
    { id: 'trending', name: 'Trending', icon: '🔥', filter: 'trending' },
    { id: 'cabins', name: 'Cabins', icon: '🏕️', filter: 'cabin' },
    { id: 'luxury', name: 'Luxury', icon: '💎', filter: 'luxury' },
    { id: 'amazing-views', name: 'Amazing Views', icon: '🌄', filter: 'views' },
    { id: 'lakefront', name: 'Lakefront', icon: '🏞️', filter: 'lakefront' },
    { id: 'countryside', name: 'Countryside', icon: '🌾', filter: 'countryside' },
    { id: 'iconic-cities', name: 'Iconic Cities', icon: '🏙️', filter: 'city' },
    { id: 'tiny-homes', name: 'Tiny Homes', icon: '🏠', filter: 'tiny' },
    { id: 'treehouses', name: 'Treehouses', icon: '🌲', filter: 'treehouse' },
    { id: 'design', name: 'Design', icon: '🎨', filter: 'design' },
    { id: 'pools', name: 'Amazing Pools', icon: '🏊', filter: 'pool' },
    { id: 'islands', name: 'Islands', icon: '🏝️', filter: 'island' },
    { id: 'skiing', name: 'Skiing', icon: '⛷️', filter: 'ski' },
    { id: 'camping', name: 'Camping', icon: '⛺', filter: 'camping' },
    { id: 'surfing', name: 'Surfing', icon: '🏄', filter: 'surf' },
    { id: 'national-parks', name: 'National Parks', icon: '🏞️', filter: 'park' },
  ];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id);
    if (category.filter) {
      navigate(`/search?category=${category.filter}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Scroll Container */}
        <div className="relative">
          {/* Left Gradient Overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          
          {/* Categories */}
          <div className="flex gap-8 overflow-x-auto scrollbar-hide py-4 scroll-smooth">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`flex flex-col items-center gap-2 min-w-fit group transition-all ${
                  selectedCategory === category.id
                    ? 'opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {/* Icon */}
                <div
                  className={`text-2xl transform transition-transform group-hover:scale-110 ${
                    selectedCategory === category.id ? 'scale-110' : ''
                  }`}
                >
                  {category.icon}
                </div>
                
                {/* Label */}
                <span
                  className={`text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'text-gray-900'
                      : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                >
                  {category.name}
                </span>
                
                {/* Active Indicator */}
                {selectedCategory === category.id && (
                  <div className="w-full h-0.5 bg-gray-900 rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          {/* Right Gradient Overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        </div>

        {/* Filter Button */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-white shadow-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span className="text-sm font-semibold">Filters</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ListingBar;