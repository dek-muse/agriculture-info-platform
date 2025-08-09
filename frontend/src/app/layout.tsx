'use client';

import { AuthProvider, useAuth } from '../Context/AuthContext';
import { DarkModeProvider } from '../Context/DarkModeProvide';
import Header from '@/components/Header';
import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();  // Assuming your AuthContext provides a loading flag

  const authPages = ['/auth/signin', '/auth/signup'];
  const isAuthPage = authPages.includes(pathname);

  // Redirect to signin if not authenticated and not on auth pages
  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.replace('/auth/signin');
    }
  }, [loading, user, isAuthPage, router]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {!isAuthPage && user && <Header />}
      {children}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DarkModeProvider>
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
