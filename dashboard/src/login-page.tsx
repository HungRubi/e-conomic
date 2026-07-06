import { useAuth } from '@/auth/auth-context';
import { LoginForm } from '@/components/login-form';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { user } = useAuth();
  if (user) return <Navigate to='/' replace />;
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <LoginForm />
    </div>
  );
}
