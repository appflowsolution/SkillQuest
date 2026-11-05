import { useState, useEffect } from 'react';
import { ShieldCheck, Delete, X, AlertCircle } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { verifyPin } from '../../services/statsService';

interface StatsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StatsAuthModal = ({ isOpen, onClose, onSuccess }: StatsAuthModalProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setShake(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Handle physical keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key >= '0' && e.key <= '9') {
        handleAddDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin]);

  if (!isOpen) return null;

  const handleAddDigit = (digit: string) => {
    if (pin.length >= 4) return;
    soundEngine.playTap();
    const nextPin = pin + digit;
    setPin(nextPin);
    setError(false);

    if (nextPin.length === 4) {
      // Validate
      setTimeout(() => {
        if (verifyPin(nextPin)) {
          soundEngine.playSuccess();
          onSuccess();
        } else {
          soundEngine.playGlitch();
          setError(true);
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin('');
          }, 600);
        }
      }, 150);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      soundEngine.playTap();
      setPin(prev => prev.slice(0, -1));
      setError(false);
    }
  };

  const handleClear = () => {
    soundEngine.playTap();
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-sm bg-[#002833] border-2 ${error ? 'border-rose-500' : 'border-[#00d2b4]/50'} rounded-3xl p-6 shadow-2xl relative select-none ${shake ? 'animate-bounce' : ''}`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00d2b4] to-[#009b84] p-0.5 shadow-lg shadow-teal-500/20 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-[#002f3c] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#00d2b4]" />
            </div>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">RBT & Clinical Access</h3>
          <p className="text-xs text-slate-300 mt-1">Enter your 4-digit PIN to access clinical analytics</p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div 
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error 
                    ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-500/50' 
                    : isFilled 
                      ? 'bg-[#00d2b4] scale-125 shadow-lg shadow-teal-400/50' 
                      : 'bg-white/20'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400 mb-4 animate-in fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>Incorrect PIN. Please try again.</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleAddDigit(digit)}
              className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xl font-black transition-all flex items-center justify-center shadow-md border border-white/10"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 text-xs font-black transition-all flex items-center justify-center"
          >
            CLEAR
          </button>
          <button
            onClick={() => handleAddDigit('0')}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xl font-black transition-all flex items-center justify-center shadow-md border border-white/10"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 transition-all flex items-center justify-center"
            title="Delete digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
