'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dna, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate credentials
      if (userId.trim() === '' || password.trim() === '') {
        setError('Please enter both User ID and Password');
        setLoading(false);
        return;
      }

      // Check credentials (hardcoded for now)
      if (userId === 'admin' && password === '1234') {
        // Store admin session in localStorage
        localStorage.setItem('adminSession', JSON.stringify({
          userId: userId,
          loginTime: new Date().toISOString(),
          authenticated: true,
        }));

        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError('Invalid User ID or Password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Dna className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Portal</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 ml-2">{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* User ID Field */}
            <div className="space-y-2">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-10 h-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Demo: <code className="bg-gray-100 px-2 py-1 rounded">admin</code></p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin(e as any);
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Demo: <code className="bg-gray-100 px-2 py-1 rounded">1234</code></p>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-semibold text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Authenticating...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <CheckCircle2 className="h-4 w-4 inline mr-2 text-blue-600" />
              <strong>Demo Credentials:</strong><br />
              User ID: <code>admin</code><br />
              Password: <code>1234</code>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              This is a secure admin portal. Unauthorized access is prohibited.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
