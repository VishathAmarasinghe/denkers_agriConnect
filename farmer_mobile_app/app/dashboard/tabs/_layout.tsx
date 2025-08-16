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
						tabBarIcon: ({ focused, color }) => (
							<View style={{
								backgroundColor: focused ? 'rgba(255,255,255,0.2)' : 'transparent',
								borderRadius: 12,
								padding: 8,
								width: 40,
								height: 40,
								alignItems: 'center',
								justifyContent: 'center',
							}}>
								<Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
							</View>
						),
					}}
				/>

				{/* SOIL TEST TAB */}
				{roles.includes(APPLICATION_FARMER) && (
					<Tabs.Screen
						name="soilManagement"
						options={{
							title: 'Soil Test',
							headerShown: false,
							tabBarIcon: ({ focused, color }) => (
								<View style={{
									backgroundColor: focused ? 'rgba(255,255,255,0.2)' : 'transparent',
									borderRadius: 12,
									padding: 8,
									width: 40,
									height: 40,
									alignItems: 'center',
									justifyContent: 'center',
								}}>
									<Ionicons name={focused ? 'flask' : 'flask-outline'} size={22} color={color} />
								</View>
							),
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
							tabBarIcon: ({ focused, color }) => (
								<View style={{
									backgroundColor: focused ? 'rgba(255,255,255,0.2)' : 'transparent',
									borderRadius: 12,
									padding: 8,
									width: 40,
									height: 40,
									alignItems: 'center',
									justifyContent: 'center',
								}}>
									<Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
								</View>
							),
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
							tabBarIcon: ({ focused, color }) => (
								<View style={{
									backgroundColor: focused ? 'rgba(255,255,255,0.2)' : 'transparent',
									borderRadius: 12,
									padding: 8,
									width: 40,
									height: 40,
									alignItems: 'center',
									justifyContent: 'center',
								}}>
									<Ionicons name={focused ? 'car' : 'car-outline'} size={22} color={color} />
								</View>
							),
						}}
					/>
				)}

				{/* HARVEST TAB (visible in dev always for easier testing) */}
				{(roles.includes(APPLICATION_FARMER) || __DEV__) && (
					<Tabs.Screen
						name="harvestHub"
						options={{
							title: 'Harvest',
							headerShown: false,
							tabBarIcon: ({ focused, color }) => (
								<View style={{
									backgroundColor: focused ? 'rgba(255,255,255,0.2)' : 'transparent',
									borderRadius: 12,
									padding: 8,
									width: 40,
									height: 40,
									alignItems: 'center',
									justifyContent: 'center',
								}}>
									<Ionicons name={focused ? 'business' : 'business-outline'} size={22} color={color} />
								</View>
							),
						}}
					/>
				)}

				{/* Chat is not part of tabs; accessible via floating button only */}
			</Tabs>
		</View>
	);
}
