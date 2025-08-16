'use client';
import { createContext, useContext, ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import { logout } from '@/slices/authSlice/auth';

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  nic: string;
  role: string;
  first_name: string;
  last_name: string;
  location_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, status } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Mock API call - replace with actual update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For now, just return success - in real implementation, you'd update Redux state
      console.log('Profile update:', data);
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      logout: handleLogout,
      updateProfile,
      isLoading: status === 'loading',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
