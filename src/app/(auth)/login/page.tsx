import { AuthForm } from '../../../components/auth/AuthForm';
import { SocialAuth } from '../../../components/auth/SocialAuth';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Login</h1>
      
      <AuthForm type="login" />
      <SocialAuth />
      
      <div className="text-center space-y-2">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
        <p>
          Forgot your password?{' '}
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Reset it here
          </Link>
        </p>
      </div>
    </div>
  );
}