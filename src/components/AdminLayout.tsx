import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  BarChart3, 
  ShoppingCart, 
  LogOut, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY_NAME } from '../config/company';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: 'store' | 'products' | 'metrics' | 'orders';
}

export const AdminLayout = ({ children, currentPage }: AdminLayoutProps) => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.hash = '#login';
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const menuItems = [
    { id: 'store', label: t('admin.menu.store'), icon: Store, hash: '#dashboard' },
    { id: 'products', label: t('admin.menu.products'), icon: Package, hash: '#dashboard/products' },
    { id: 'metrics', label: t('admin.menu.metrics'), icon: BarChart3, hash: '#dashboard/metrics' },
    { id: 'orders', label: t('admin.menu.orders'), icon: ShoppingCart, hash: '#dashboard/orders' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`
          bg-white border-r border-gray-200 fixed h-full
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className={`
          h-16 flex items-center border-b border-gray-200
          transition-all duration-300
          ${isCollapsed ? 'px-4 justify-center' : 'px-6'}
        `}>
          {isCollapsed ? (
            logoError ? (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">
                  {COMPANY_NAME.charAt(0)}
                </span>
              </div>
            ) : (
              <img 
                src="/logo_lulo.png" 
                alt={COMPANY_NAME}
                className="h-8 w-8 object-contain"
                onError={handleLogoError}
              />
            )
          ) : (
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {COMPANY_NAME}
            </h1>
          )}
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.hash}
                  className={`
                    flex items-center rounded-lg
                    transition-all duration-200
                    ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-2'}
                    ${currentPage === item.id 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={`
                    flex-shrink-0
                    transition-all duration-200
                    ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}
                  `} />
                  <span className={`
                    transition-all duration-200
                    ${isCollapsed ? 'hidden' : 'block'}
                  `}>
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className={`
            flex items-center text-gray-600
            transition-all duration-200
            ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-2'}
          `}>
            <User className={`
              flex-shrink-0
              ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}
            `} />
            <span className={`text-sm truncate ${isCollapsed ? 'hidden' : 'block'}`}>
              {currentUser?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full text-gray-600
              hover:bg-gray-50 hover:text-gray-900 rounded-lg
              transition-all duration-200
              ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-2'}
            `}
          >
            <LogOut className={`
              flex-shrink-0
              ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}
            `} />
            <span className={isCollapsed ? 'hidden' : 'block'}>
              {t('admin.logout')}
            </span>
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            absolute -right-3 top-20
            bg-white border border-gray-200 rounded-full p-1
            text-gray-500 hover:text-gray-700
            transition-all duration-200
            hover:bg-gray-50
          `}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 transition-all duration-300
        ${isCollapsed ? 'ml-20' : 'ml-64'}
      `}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};