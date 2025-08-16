'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/slices/store';
import DashboardContent from '@/components/dashboard/DashboardContent';
import AdminLayout from '@/components/layout/AdminLayout';
import Image from 'next/image';
import { Images } from '@/constants/Images';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'idle' && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#52B788] to-[#16a34a]">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30">
              <Image
                src={Images.logos.appLogo}
                alt="AgriConnect Logo"
                width={80}
                height={80}
                className="animate-pulse"
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
          <p className="text-lg text-white font-medium">Loading AgriConnect...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}
