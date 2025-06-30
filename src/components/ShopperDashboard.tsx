import React, { useState } from 'react';
import { Search, MapPin, Clock, Star, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Store {
  id: string;
  name: string;
  image: string;
  deliveryTime: string;
  rating: number;
  reviewCount: number;
  cuisine: string;
  distance: string;
}

const mockStores: Store[] = [
  {
    id: '1',
    name: 'Sabor Colombiano',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    deliveryTime: '25–35 min',
    rating: 4.8,
    reviewCount: 124,
    cuisine: 'Colombian',
    distance: '1.2 km'
  },
  {
    id: '2',
    name: 'Casa de Arepas',
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
    deliveryTime: '30–45 min',
    rating: 4.6,
    reviewCount: 89,
    cuisine: 'Venezuelan',
    distance: '2.1 km'
  },
  {
    id: '3',
    name: 'Empanadas del Valle',
    image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
    deliveryTime: '20–30 min',
    rating: 4.9,
    reviewCount: 156,
    cuisine: 'Colombian',
    distance: '0.8 km'
  },
  {
    id: '4',
    name: 'Panadería Latina',
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400',
    deliveryTime: '15–25 min',
    rating: 4.7,
    reviewCount: 203,
    cuisine: 'Bakery',
    distance: '1.5 km'
  },
  {
    id: '5',
    name: 'Tacos y Más',
    image: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=400',
    deliveryTime: '35–50 min',
    rating: 4.5,
    reviewCount: 67,
    cuisine: 'Mexican',
    distance: '3.2 km'
  },
  {
    id: '6',
    name: 'Dulces Tradición',
    image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg?auto=compress&cs=tinysrgb&w=400',
    deliveryTime: '40–55 min',
    rating: 4.4,
    reviewCount: 45,
    cuisine: 'Desserts',
    distance: '4.1 km'
  }
];

export const ShopperDashboard = () => {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState('colombia');
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const countries = [
    { id: 'colombia', name: 'Colombia', active: true },
    { id: 'brazil', name: 'Brazil', active: false },
    { id: 'venezuela', name: 'Venezuela', active: false },
    { id: 'mexico', name: 'Mexico', active: false }
  ];

  const foodTypes = [
    { id: 'hot', name: 'Hot Food', icon: '🔥' },
    { id: 'frozen', name: 'Frozen', icon: '❄️' },
    { id: 'baked', name: 'Baked Goods', icon: '🥖' },
    { id: 'other', name: 'Other', icon: '🍽️' }
  ];

  const toggleFoodType = (typeId: string) => {
    setSelectedFoodTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleStoreClick = (storeId: string) => {
    window.location.hash = `#shopper-dashboard/${storeId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ultra-Minimalist Glassmorphism Header */}
      <div className="sticky top-4 z-40 mx-4">
        <div className="glassmorphism-header">
          {/* Subtle gradient accent at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-transparent opacity-60"></div>
          
          <div className="max-w-5xl mx-auto px-6 py-2">
            {/* Header Content */}
            <div className="space-y-2">
              {/* Title Row */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight font-heading">
                    Discover Local Flavors
                  </h1>
                  <p className="text-sm text-gray-600 tracking-wide font-normal">
                    Authentic Latin cuisine delivered to you
                  </p>
                </div>
                <button 
                  className="p-2 text-gray-600 hover:text-gray-900 lg:hidden rounded-md hover:bg-white/50 transition-all duration-200"
                  aria-label="Filter options"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search restaurants, dishes, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 border border-gray-200/60 rounded-md 
                    focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50
                    bg-white/70 backdrop-blur-sm placeholder:text-gray-500 placeholder:font-medium text-sm
                    transition-all duration-200 hover:border-gray-300/80 hover:bg-white/80"
                />
              </div>

              {/* Filter Pills */}
              <div className="space-y-1.5">
                {/* Countries Row */}
                <div className="flex flex-wrap gap-1.5 lg:gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider py-1.5 pr-2">
                    Countries
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {countries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => country.active && setSelectedCountry(country.id)}
                        disabled={!country.active}
                        className={`
                          premium-pill
                          ${country.active
                            ? selectedCountry === country.id
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'border border-gray-200/80 text-gray-600 hover:bg-white/60 hover:-translate-y-0.5'
                            : 'border border-gray-200/50 text-gray-400 cursor-not-allowed'
                          }
                        `}
                        aria-label={`Filter by ${country.name}${!country.active ? ' (coming soon)' : ''}`}
                      >
                        {country.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Food Types Row */}
                <div className="flex flex-wrap gap-1.5 lg:gap-2 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider py-1.5 pr-2">
                    Food Types
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {foodTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => toggleFoodType(type.id)}
                        className={`
                          premium-pill
                          ${selectedFoodTypes.includes(type.id)
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'border border-gray-200/80 text-gray-600 hover:bg-white/60 hover:-translate-y-0.5'
                          }
                        `}
                        aria-label={`Filter by ${type.name}`}
                      >
                        <span className="text-xs">{type.icon}</span>
                        <span className="hidden sm:inline">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Grid */}
      <div className="container mx-auto px-4 py-8 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Popular Restaurants Near You
          </h2>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            Vancouver, BC
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStores.map((store) => (
            <div
              key={store.id}
              onClick={() => handleStoreClick(store.id)}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden
                hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              tabIndex={0}
              role="button"
              aria-label={`View menu for ${store.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStoreClick(store.id);
                }
              }}
            >
              {/* Store Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                  <div className="flex items-center text-xs font-medium text-gray-700">
                    <Clock className="w-3 h-3 mr-1" />
                    {store.deliveryTime}
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                    {store.name}
                  </h3>
                  <div className="flex items-center ml-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700 ml-1">
                      {store.rating}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3">{store.cuisine}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {store.distance}
                  </div>
                  <div className="text-gray-500">
                    {store.reviewCount} reviews
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-primary-500 text-white rounded-xl font-medium
            hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 
            focus:ring-primary-500 focus:ring-offset-2">
            Load More Restaurants
          </button>
        </div>
      </div>
    </div>
  );
};