'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail, resetPassword, updatePassword } from '@/lib/supabase/auth';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const SuccessMessage = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <div className="p-3 rounded-lg text-sm text-center bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" role="alert">
      {message}
    </div>
  );
};

const InputError = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
};

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const calculatePasswordStrength = (password: string): { score: number; label: string } => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password)
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = (passedChecks / 5) * 100;

  let label = 'Sangat Lemah';
  if (passedChecks === 5) label = 'Kuat';
  else if (passedChecks === 4) label = 'Sedang';
  else if (passedChecks === 3) label = 'Lemah';
  else if (passedChecks >= 1) label = 'Sangat Lemah';

  return { score, label };
};

const isPasswordStrong = (password: string): boolean => {
  const hasLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  return hasLength && hasLowercase && hasUppercase && hasNumbers && hasSymbols;
};

interface AuthFormProps {
  type: 'login' | 'register' | 'forgot-password' | 'update-password';
  onSuccess?: () => void;
  onPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AuthForm = ({ type, onSuccess, onPasswordChange }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (type !== 'update-password' && (!email.trim() || !emailRegex.test(email))) {
      newErrors.email = 'Harap masukkan alamat email yang valid.';
    }
    
    if (type === 'register' && !name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi.';
    }
    
    if ((type === 'login' || type === 'register' || type === 'update-password')) {
        if (!password.trim()) {
            newErrors.password = 'Kata sandi wajib diisi.';
        } else if ((type === 'register' || type === 'update-password') && !isPasswordStrong(password)) {
            newErrors.password = 'Password harus mengandung: 8+ karakter, huruf besar & kecil, angka, dan simbol.';
        }
    }
    
    if ((type === 'register' || type === 'update-password') && password !== confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
    }
    
    if (type === 'forgot-password' && !email.trim()) {
      newErrors.email = 'Email wajib diisi untuk reset password.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleAuthAction = async () => {
    setErrors({});
    
    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage('');

    try {
      let result;
      switch (type) {
        case 'login':
          result = await signInWithEmail(email, password);
          if (!result.error) {
            window.location.href = '/';
          }
          break;
        case 'register':
          result = await signUpWithEmail(email, password, name);
          if (!result.error) {
            setSuccessMessage('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.');
            setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
          }
          break;
        case 'forgot-password':
          result = await resetPassword(email);
          if (!result.error) {
            setSuccessMessage('Tautan reset kata sandi telah dikirim ke email Anda.');
            setEmail('');
          }
          break;
        case 'update-password':
          result = await updatePassword(password);
          if (!result.error) {
            setSuccessMessage('Kata sandi berhasil diperbarui! Mengalihkan ke halaman login...');
            setTimeout(() => router.push('/login'), 2000);
          }
          break;
      }

      if (result?.error) {
        handleAuthError(result.error instanceof Error ? result.error : new Error(String(result.error || 'An unknown error occurred')));
      } else if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('An unexpected error occurred:', error);
      setErrors({ general: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: Error) => {
    if (error.message.includes('Invalid login credentials')) {
      setErrors({ general: 'Email atau kata sandi salah.' });
    } else if (error.message.includes('Email not confirmed')) {
      setErrors({ email: 'Email belum diverifikasi. Silakan periksa kotak masuk Anda.' });
    } else if (error.message.includes('User already registered')) {
      setErrors({ email: 'Email ini sudah terdaftar. Silakan masuk.' });
    } else if (error.message.includes('Password should be at least')) {
      setErrors({ password: 'Kata sandi terlalu pendek. Minimal 8 karakter.' });
    } else {
      setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
  };
  
  const getButtonText = (type: string): string => ({
    login: 'Masuk',
    register: 'Buat Akun',
    'forgot-password': 'Kirim Tautan Reset',
    'update-password': 'Perbarui Kata Sandi',
  }[type] || 'Submit');

  const passwordStrength = password ? calculatePasswordStrength(password) : { score: 0, label: '' };

  const inputClasses = "w-full p-3 border rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400";
  const passwordInputClasses = `${inputClasses} pr-12`;
  const labelClasses = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";
  const buttonClasses = "w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200";

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }} className="space-y-5">
      <SuccessMessage message={successMessage} />
      
      {type === 'register' && (
        <div>
          <label htmlFor="name" className={labelClasses}>Nama Lengkap</label>
          <input 
            id="name" 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            disabled={isLoading} 
            className={inputClasses} 
            placeholder="John Doe"
          />
          <InputError message={errors.name || ''} />
        </div>
      )}

      {type !== 'update-password' && (
        <div>
          <label htmlFor="email" className={labelClasses}>Alamat Email</label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={isLoading} 
            className={inputClasses} 
            placeholder="anda@email.com"
          />
          <InputError message={errors.email || ''} />
        </div>
      )}

      {(type === 'login' || type === 'register' || type === 'update-password') && (
        <div className="relative">
          <label htmlFor="password" className={labelClasses}>
            {type === 'update-password' ? 'Kata Sandi Baru' : 'Kata Sandi'}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { 
                setPassword(e.target.value); 
                if (onPasswordChange) onPasswordChange(e); 
              }}
              disabled={isLoading}
              className={passwordInputClasses}
              placeholder="••••••••"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <InputError message={errors.password || ''} />
          {type === 'login' && <InputError message={errors.general || ''} />}
        </div>
      )}

      {(type === 'register' || type === 'update-password') && (
        <div className="relative">
          <label htmlFor="confirmPassword" className={labelClasses}>Konfirmasi Kata Sandi</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className={passwordInputClasses}
              placeholder="••••••••"
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <InputError message={errors.confirmPassword || ''} />
          
          {(type === 'register' || type === 'update-password') && password && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Kekuatan Password:</span>
                <span className={`font-medium ${
                  passwordStrength.score === 100 ? 'text-green-600 dark:text-green-400' :
                  passwordStrength.score >= 80 ? 'text-blue-600 dark:text-blue-400' :
                  passwordStrength.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                  passwordStrength.score >= 40 ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.score === 100 ? 'bg-green-500' :
                    passwordStrength.score >= 80 ? 'bg-blue-500' :
                    passwordStrength.score >= 60 ? 'bg-yellow-500' :
                    passwordStrength.score >= 40 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Password kuat harus memiliki: 8+ karakter, huruf besar, huruf kecil, angka & simbol
              </div>
            </div>
          )}
        </div>
      )}

      {errors.general && type !== 'login' && (
        <InputError message={errors.general} />
      )}

      <button type="submit" disabled={isLoading} className={buttonClasses}>
        {isLoading ? <><SpinnerIcon /> Memproses...</> : getButtonText(type)}
      </button>
    </form>
  );
};