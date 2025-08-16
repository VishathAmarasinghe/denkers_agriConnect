import { AppConfig } from '@/config/config';
import { checkAuthToken } from '@/slice/authSlice/Auth';
import { store, useAppDispatch, useAppSelector } from '@/slice/store';
import { State } from '@/types/types';
import { APIService } from '@/utils/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-get-random-values';
import { Provider } from 'react-redux';

const HomeScreen = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state?.auth);

  APIService.initialize(AppConfig.serviceUrls.authentication);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
      if (storedToken) {
        dispatch(checkAuthToken());
      }
      setLoading(false);
    };
    initializeAuth();
  }, [dispatch]);

  useEffect(() => {}, [auth?.status, auth?.mode, auth?.userInfo?.userID]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      {__DEV__ ? (
        <Redirect href="/dashboard/tabs/home" />
      ) : token ? (
        auth?.status === State.success ? (
          <Redirect href="/dashboard/tabs/home" />
        ) : (
          <Redirect href="/auth/landingScreen" />
        )
      ) : (
        <Redirect href="/auth/landingScreen" />
      )}
    </Provider>
  );
};

export default HomeScreen;
