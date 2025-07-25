import React, { useState } from 'react';
import { Mail, ChevronRight, CheckCircle, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';

interface InvitationGateProps {
  onValidCode: () => void;
}

// Hardcoded invitation codes for now
const VALID_CODES = [
  'LULOCART2024',
  'LATINMARKET',
  'EXCLUSIVE01',
  'BETA2024',
  'EARLYACCESS'
];

type ViewState = 'code' | 'email' | 'success';

export const InvitationGate: React.FC<InvitationGateProps> = ({ onValidCode }) => {
  const [currentView, setCurrentView] = useState<ViewState>('code');
  const [invitationCode, setInvitationCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateCode = (code: string): boolean => {
    return VALID_CODES.includes(code.toUpperCase());
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (validateCode(invitationCode)) {
      // Store valid code in localStorage for future visits
      localStorage.setItem('lulocart_invitation_code', invitationCode);
      onValidCode();
    } else {
      setError('Invalid invitation code. Please try again or request access below.');
      setTimeout(() => {
        setCurrentView('email');
      }, 2000);
    }
    
    setIsLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Replace with actual API call to store email
    console.log('Email submitted for invitation:', email);
    
    setCurrentView('success');
    setIsLoading(false);
  };

  const resetToCode = () => {
    setCurrentView('code');
    setError('');
    setEmail('');
    setInvitationCode('');
  };

  // Development helper - add to window for easy testing
  if (typeof window !== 'undefined') {
    (window as any).clearInvitationGate = () => {
      localStorage.removeItem('lulocart_invitation_code');
      window.location.reload();
    };
  }

  // Latin food images for the animated background
  const latinFoodImages = [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', // Tacos
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop', // Empanadas
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop', // Paella
    'https://images.unsplash.com/photo-1541544181051-e46607463f10?w=400&h=300&fit=crop', // Ceviche
    'https://images.unsplash.com/photo-1567003323695-b69fb4aacbc4?w=400&h=300&fit=crop', // Quesadillas
    'https://images.unsplash.com/photo-1594741816392-5b6d3cfb70b8?w=400&h=300&fit=crop', // Churros
    'https://images.unsplash.com/photo-1615870216519-2f9fa2afe556?w=400&h=300&fit=crop', // Arepas
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', // Tamales
    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop', // Tres leches
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=300&fit=crop', // Mole
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop', // Pupusas
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', // Fajitas
    'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?w=400&h=300&fit=crop', // Tostones
    'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400&h=300&fit=crop', // Elote
    'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop', // Pozole
    'https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=400&h=300&fit=crop', // Chilaquiles
  ];

  // Generate rows of images
  const generateImageRows = () => {
    const rows = [];
    const imagesPerRow = 8;
    const totalRows = 6;

    for (let row = 0; row < totalRows; row++) {
      const rowImages = [];
      const isEvenRow = row % 2 === 0;
      
      // Create enough images to fill the row and enable seamless scrolling
      for (let i = 0; i < imagesPerRow * 2; i++) {
        const imageIndex = (row * imagesPerRow + i) % latinFoodImages.length;
        rowImages.push(
          <div
            key={`${row}-${i}`}
            className="flex-shrink-0 w-48 h-32 mx-2 rounded-2xl overflow-hidden shadow-lg transform transition-transform hover:scale-105"
            style={{
              transform: `rotate(${Math.random() * 10 - 5}deg)`,
            }}
          >
            <img
              src={latinFoodImages[imageIndex]}
              alt="Latin Food"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        );
      }

      rows.push(
        <div
          key={row}
          className={`absolute flex items-center ${
            isEvenRow ? 'animate-slide-right' : 'animate-slide-left'
          }`}
          style={{
            top: `${row * 110 + 50}px`,
            left: isEvenRow ? '-50%' : '50%',
            animationDelay: `${row * 0.5}s`,
            animationDuration: '40s',
          }}
        >
          {rowImages}
        </div>
      );
    }

    return rows;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated food background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {generateImageRows()}
      </div>

      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Ambient light effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#C8E400] to-[#A3C700] rounded-2xl shadow-lg mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              LuloCart
            </h1>
            <p className="text-gray-600 text-lg">
              Exclusive Latin Market Experience
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-500 font-medium">Curated • Authentic • Premium</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-500 hover:shadow-3xl hover:bg-white/98">
            {currentView === 'code' && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">
                    Enter your invitation code to access the exclusive marketplace
                  </p>
                </div>

                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="invitation-code" className="block text-sm font-medium text-gray-700 mb-2">
                      Invitation Code
                    </label>
                    <input
                      id="invitation-code"
                      type="text"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      placeholder="Enter your code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#C8E400] focus:border-transparent transition-all duration-200 text-center text-lg font-mono tracking-wider uppercase"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl animate-shake">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !invitationCode.trim()}
                    className="w-full bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white py-3 px-6 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#A3C700] hover:to-[#8AB000] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        Access Marketplace
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">Don't have an invitation code?</p>
                  <button
                    onClick={() => setCurrentView('email')}
                    className="text-[#C8E400] hover:text-[#A3C700] font-medium transition-colors duration-200 underline decoration-2 underline-offset-2"
                  >
                    Request access
                  </button>
                </div>
              </div>
            )}

            {currentView === 'email' && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#C8E400]/10 rounded-xl mb-4">
                    <Mail className="w-6 h-6 text-[#C8E400]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Request Access
                  </h2>
                  <p className="text-gray-600">
                    Join the waitlist for exclusive access to our curated Latin marketplace
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#C8E400] focus:border-transparent transition-all duration-200"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl animate-shake">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full bg-gradient-to-r from-[#C8E400] to-[#A3C700] text-white py-3 px-6 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#A3C700] hover:to-[#8AB000] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Request Invitation
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <button
                    onClick={resetToCode}
                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
                  >
                    ← Back to invitation code
                  </button>
                </div>
              </div>
            )}

            {currentView === 'success' && (
              <div className="text-center space-y-6 animate-slide-up">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Request Submitted!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Thank you for your interest in LuloCart. We'll review your request and send you an invitation code soon.
                  </p>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 text-sm">
                      <strong>What's next?</strong> We'll notify you via email once your invitation is ready. 
                      In the meantime, follow us on social media for updates!
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetToCode}
                  className="text-[#C8E400] hover:text-[#A3C700] font-medium transition-colors duration-200 underline decoration-2 underline-offset-2"
                >
                  Try another invitation code
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>© 2024 LuloCart. Bringing authentic Latin flavors to your doorstep.</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes slide-right {
          0% { transform: translateX(-100vw); }
          100% { transform: translateX(100vw); }
        }
        
        @keyframes slide-left {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100vw); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-slide-right {
          animation: slide-right linear infinite;
        }
        
        .animate-slide-left {
          animation: slide-left linear infinite;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        /* Optimize animations for performance */
        .animate-slide-right, .animate-slide-left {
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};