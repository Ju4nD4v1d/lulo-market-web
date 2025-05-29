import React from 'react';
import { 
  Store, 
  Package, 
  BarChart3, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  User 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COMPANY_NAME } from '../config/company';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: 'store' | 'products' | 'metrics' | 'orders';
}

export const AdminLayout = ({ children, currentPage }: AdminLayoutProps) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.hash = '#login';
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const menuItems = [
    { id: 'store', label: 'Store', icon: Store, hash: '#dashboard' },
    { id: 'products', label: 'Products', icon: Package, hash: '#dashboard/products' },
    { id: 'metrics', label: 'Metrics', icon: BarChart3, hash: '#dashboard/metrics' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, hash: '#dashboard/orders' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">{COMPANY_NAME}</h1>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.hash}
                  className={`
                    flex items-center px-4 py-2 rounded-lg
                    transition-colors duration-200
                    ${currentPage === item.id 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center px-4 py-2 text-gray-600">
            <User className="w-5 h-5 mr-3" />
            <span className="text-sm truncate">{currentUser?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};