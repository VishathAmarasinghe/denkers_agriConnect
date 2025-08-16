import { APPLICATION_FARMER } from '@/config/config';
import { useAppSelector } from '@/slice/store';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import FarmerTabBar from '@/components/navigation/FarmerTabBar';

export default function Layout() {
	const authSlice = useAppSelector(state => state?.auth);
	const roles = authSlice?.roles || [];

	return (
		<View className="flex-1 bg-transparent">
			<Tabs
				screenOptions={{
					headerShown: false,
					sceneStyle: { backgroundColor: 'transparent' },
					tabBarActiveTintColor: '#FFFFFF',
					tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
				}}
				tabBar={(props) => <FarmerTabBar {...props} />}
			>
				{/* HOME TAB - always available to avoid empty Tabs */}
				<Tabs.Screen
					name="home"
					options={{
						title: 'Home',
						headerShown: false,
					}}
				/>

				{/* SOIL TEST TAB */}
				{roles.includes(APPLICATION_FARMER) && (
					<Tabs.Screen
						name="soilManagement"
						options={{
							title: 'Soil Test',
							headerShown: false,
						}}
					/>
				)}

				{/* OFFICERS TAB */}
				{roles.includes(APPLICATION_FARMER) && (
					<Tabs.Screen
						name="fieldVisit"
						options={{
							title: 'Officers',
							headerShown: false,
						}}
					/>
				)}

				{/* MACHINES TAB */}
				{roles.includes(APPLICATION_FARMER) && (
					<Tabs.Screen
						name="machineRent"
						options={{
							title: 'Machines',
							headerShown: false,
						}}
					/>
				)}

				{/* HARVEST TAB */}
				{roles.includes(APPLICATION_FARMER) && (
					<Tabs.Screen
						name="harvestHub"
						options={{
							title: 'Harvest',
							headerShown: false,
						}}
					/>
				)}

				{/* Chat is not part of tabs; accessible via floating button only */}
			</Tabs>
		</View>
	);
}
