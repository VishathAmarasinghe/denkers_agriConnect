import { APPLICATION_FARMER } from '@/config/config';
import { useAppSelector } from '@/slice/store';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function Layout() {
	const authSlice = useAppSelector(state => state?.auth);
	const roles = authSlice?.roles || [];

	return (
		<View className="flex-1 bg-transparent">
			<Tabs
				screenOptions={() => ({
					headerShown: false,
					sceneStyle: { backgroundColor: 'transparent' },
					tabBarActiveTintColor: '#FFFFFF',
					tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
					tabBarStyle: {
						width: '100%',
						backgroundColor: 'transparent',
						borderTopLeftRadius: 32,
						borderTopRightRadius: 32,
						paddingBottom: 16,
						paddingTop: 12,
						overflow: 'visible',
						height: 100,
						justifyContent: 'space-between',
						alignSelf: 'center',
						flexDirection: 'row',
						marginBottom: 0,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: -8 },
						shadowOpacity: 0.15,
						shadowRadius: 16,
						elevation: 12,
						borderTopWidth: 0,
						paddingHorizontal: 20,
					},
					tabBarBackground: () => <TabBarBackground />,
					tabBarLabelStyle: {
						fontSize: 11,
						fontWeight: '600',
						marginTop: 6,
						color: 'inherit',
						letterSpacing: 0.5,
					},
					tabBarIconStyle: { marginBottom: 2 },
				})}
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

				{/* HARVEST TAB */}
				{roles.includes(APPLICATION_FARMER) && (
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
