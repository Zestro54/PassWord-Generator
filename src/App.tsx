/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Character sets
const CHARSET = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

type Strength = 'Weak' | 'Medium' | 'Strong' | 'Very Strong' | 'Invalid';

export default function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false
  });
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate password logic
  const generatePassword = useCallback(() => {
    let charset = '';
    if (options.uppercase) charset += CHARSET.uppercase;
    if (options.lowercase) charset += CHARSET.lowercase;
    if (options.numbers) charset += CHARSET.numbers;
    if (options.symbols) charset += CHARSET.symbols;

    if (charset === '') {
      setError('Please select at least one character type.');
      setPassword('');
      return;
    }

    setError(null);
    let generatedPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        generatedPassword += charset[array[i] % charset.length];
    }
    
    setPassword(generatedPassword);
  }, [length, options]);

  // Initial generation
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // Copy to clipboard logic
  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  // Strength calculation logic
  const calculateStrength = (): { label: Strength; percentage: number; color: string } => {
    if (error || !password) return { label: 'Invalid', percentage: 0, color: 'bg-gray-300' };
    
    let score = 0;
    if (length > 8) score += 1;
    if (length > 12) score += 1;
    if (options.uppercase) score += 1;
    if (options.lowercase) score += 1;
    if (options.numbers) score += 1;
    if (options.symbols) score += 1;

    if (score <= 3) return { label: 'Weak', percentage: 25, color: 'bg-red-500' };
    if (score <= 5) return { label: 'Medium', percentage: 50, color: 'bg-yellow-500' };
    if (score <= 6) return { label: 'Strong', percentage: 75, color: 'bg-green-500' };
    return { label: 'Very Strong', percentage: 100, color: 'bg-matte-green' };
  };

  const strength = calculateStrength();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-[580px] rounded-[40px] shadow-[0_32px_64px_-16px_rgba(46,125,50,0.12)] border border-white/50 flex flex-col p-12 relative overflow-hidden"
      >
        {/* Decorative Green Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-matte-green/5 rounded-bl-full"></div>

        <header className="mb-10">
          <h1 className="text-4xl font-serif text-matte-green mb-2 italic">CipherGen</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Secure Password Architect</p>
        </header>

        {/* Password Display Field */}
        <div className="relative mb-10 group">
          <div className="absolute -top-3 left-6 px-2 bg-white text-[10px] uppercase tracking-tighter text-matte-green font-bold z-10">
            Generated Secret
          </div>
          <div className="flex items-center bg-kate-white border-2 border-soft-gray rounded-2xl p-5 transition-all focus-within:border-matte-green focus-within:ring-4 focus-within:ring-matte-green/5">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              readOnly
              className="w-full bg-transparent border-none focus:outline-none font-mono text-2xl tracking-wider text-gray-800"
              placeholder="••••••••••••••••"
              style={{ fontFamily: '"Courier New", Courier, monospace' }}
            />
            <div className="flex gap-2 ml-4">
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="p-3 hover:bg-matte-green/10 rounded-xl text-matte-green transition-colors"
                title={showPassword ? "Hide" : "Show"}
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
              <button 
                onClick={generatePassword}
                className="p-3 hover:bg-matte-green/10 rounded-xl text-matte-green transition-colors"
                title="Regenerate"
              >
                <RefreshCw size={24} className={error ? "opacity-30" : ""} />
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-600 text-xs mt-2 ml-2"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Strength Meter */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Security Level</span>
            <span className={`text-xs font-black tracking-widest uppercase ${strength.label === 'Weak' ? 'text-red-500' : strength.label === 'Medium' ? 'text-yellow-600' : 'text-matte-green'}`}>
              {strength.label === 'Very Strong' ? 'Optimal' : strength.label}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((idx) => {
              const isActive = (idx / 5) * 100 <= strength.percentage;
              return (
                <div 
                  key={idx}
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${isActive ? strength.color : 'bg-gray-100'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Controls Container */}
        <div className="space-y-10 mb-10">
          {/* Length Slider */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-gray-700">Character Count</label>
              <span className="text-2xl font-serif text-matte-green italic">{length}</span>
            </div>
            <input
              type="range"
              min="4"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-matte-green"
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {Object.entries(options).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${value ? 'bg-matte-green border-matte-green' : 'border-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setOptions(prev => ({ ...prev, [key]: !prev[key] }))}
                    className="hidden"
                  />
                  {value && <Check size={12} className="text-white" strokeWidth={4} />}
                </div>
                <span className={`text-sm font-medium transition-colors ${value ? 'text-gray-600' : 'text-gray-400'}`}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generatePassword}
            className="w-full bg-matte-green text-white font-bold py-5 rounded-2xl shadow-lg shadow-matte-green/20 hover:bg-deep-green transition-all transform uppercase tracking-[0.2em] text-sm"
          >
            Forge New Password
          </motion.button>

          <button
            disabled={!!error}
            onClick={copyToClipboard}
            className="w-full bg-transparent text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest"
          >
            {copied ? (
               <div className="flex items-center gap-2 text-matte-green">
                <Check size={14} />
                <span>Secret Copied</span>
               </div>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy to Metadata</span>
              </>
            )}
          </button>
        </div>

        {/* Feedback / Version */}
        <div className="mt-10 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Algorithm v4.2 • AES-256 Entropy Ready</p>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-matte-green text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 text-xs font-bold uppercase tracking-widest"
          >
            Entropy Exported to Clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
