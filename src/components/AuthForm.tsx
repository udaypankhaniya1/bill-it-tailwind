
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice';
import { mockUser } from '@/utils/supabaseClient';

interface AuthFormProps {
  isLogin?: boolean;
}

const AuthForm = ({ isLogin = true }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we'd connect to Supabase here
    // For now, we'll just simulate a login
    dispatch(loginStart());
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, always succeed
      dispatch(loginSuccess(mockUser));
      
      toast({
        title: isLogin ? "Login successful" : "Account created",
        description: "Welcome to InvoiceMaster",
      });
      
      navigate('/dashboard');
    } catch (error) {
      dispatch(loginFailure("Authentication failed"));
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "Please check your credentials and try again",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isLogin ? 'Login' : 'Create an Account'}
        </CardTitle>
        <CardDescription className="text-center">
          {isLogin
            ? 'Enter your email and password to access your account'
            : 'Fill in the details below to create your account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {isLogin && (
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Password reset",
                      description: "This feature requires Supabase integration",
                    });
                  }}
                >
                  Forgot password?
                </a>
              )}
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <a
            href={isLogin ? '/signup' : '/login'}
            className="underline font-medium text-primary hover:text-primary/80"
            onClick={(e) => {
              e.preventDefault();
              navigate(isLogin ? '/signup' : '/login');
            }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
