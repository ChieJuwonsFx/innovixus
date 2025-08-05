import { AuthForm } from '@/components/auth/AuthForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <p>Enter your email to receive a password reset link</p>
      
      <AuthForm type="forgot-password" />
      
      <p className="text-center">
        Remember your password?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}