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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric shapes inspired by Latin patterns */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)`,
        }}></div>
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
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 transition-all duration-500 hover:shadow-3xl">
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

      <style jsx>{`
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
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};