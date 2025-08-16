'use client';
import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  RequestPage,
  CheckCircle,
  Schedule,
  Warning,
  Assessment,
  LocationOn,
  Description,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { APIService } from '@/utils/apiService';
import { AppConfig } from '@/config/config';

interface DashboardStats {
  totalFarmers: number;
  activeRequests: number;
  collectionCenters: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalReports: number;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  status: string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch soil testing requests
      const requestsResponse = await APIService.getInstance().get(AppConfig.serviceUrls.soilTesting.requests);
      const requests = requestsResponse.data.data || [];

      // Fetch soil collection centers
      const centersResponse = await APIService.getInstance().get(AppConfig.serviceUrls.soilCollection.centers);
      const centers = centersResponse.data.data || [];

      // Fetch soil testing reports
      const reportsResponse = await APIService.getInstance().get(AppConfig.serviceUrls.soilTesting.reports);
      const reports = reportsResponse.data.data || [];

      // Calculate stats
      const pendingRequests = requests.filter((req: any) => req.status === 'pending').length;
      const approvedRequests = requests.filter((req: any) => req.status === 'approved').length;
      const rejectedRequests = requests.filter((req: any) => req.status === 'rejected').length;

      const dashboardStats: DashboardStats = {
        totalFarmers: requests.length > 0 ? new Set(requests.map((req: any) => req.farmer_id)).size : 0,
        activeRequests: requests.filter((req: any) => req.status === 'pending' || req.status === 'approved').length,
        collectionCenters: centers.length,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalReports: reports.length,
      };

      setStats(dashboardStats);

      // Generate recent activities from real data
      const activities: RecentActivity[] = [];
      
      // Add recent requests
      requests.slice(0, 3).forEach((req: any) => {
        const status = req.status;
        let icon, color, action;
        
        switch (status) {
          case 'approved':
            icon = <CheckCircle />;
            color = '#059669';
            action = 'Soil testing request approved';
            break;
          case 'rejected':
            icon = <Warning />;
            color = '#dc2626';
            action = 'Soil testing request rejected';
            break;
          default:
            icon = <Schedule />;
            color = '#d97706';
            action = 'New soil testing request received';
        }

        activities.push({
          id: req.id,
          action,
          user: `Farmer #${req.farmer_id}`,
          time: new Date(req.created_at).toLocaleDateString(),
          status,
          icon,
          color,
        });
      });

      // Add recent reports if any
      if (reports.length > 0) {
        activities.push({
          id: reports[0].id,
          action: 'New soil testing report generated',
          user: `Field Officer #${reports[0].field_officer_id}`,
          time: new Date(reports[0].created_at).toLocaleDateString(),
          status: 'completed',
          icon: <CheckCircle />,
          color: '#059669',
        });
      }

      setRecentActivities(activities.slice(0, 5));

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ mb: 4 }}>
        <Alert severity="info">No data available</Alert>
      </Box>
    );
  }

  const statsData = [
    {
      title: 'Total Farmers',
      value: stats.totalFarmers.toString(),
      change: '+0%',
      trend: 'up',
      icon: <People />,
      color: '#2563eb',
    },
    {
      title: 'Active Requests',
      value: stats.activeRequests.toString(),
      change: '+0%',
      trend: 'up',
      icon: <RequestPage />,
      color: '#059669',
    },
    {
      title: 'Collection Centers',
      value: stats.collectionCenters.toString(),
      change: '+0',
      trend: 'up',
      icon: <LocationOn />,
      color: '#d97706',
    },
    {
      title: 'Total Reports',
      value: stats.totalReports.toString(),
      change: '+0',
      trend: 'up',
      icon: <Assessment />,
      color: '#dc2626',
    },
  ];

  const requestStatusData = [
    { name: 'Pending', value: stats.pendingRequests, color: '#d97706' },
    { name: 'Approved', value: stats.approvedRequests, color: '#059669' },
    { name: 'Rejected', value: stats.rejectedRequests, color: '#dc2626' },
  ];

  const monthlyData = [
    { month: 'Jan', requests: 4, completed: 0 },
    { month: 'Feb', requests: 0, completed: 0 },
    { month: 'Mar', requests: 3, completed: 3 },
    { month: 'Apr', requests: 0, completed: 0 },
    { month: 'May', requests: 1, completed: 6 },
    { month: 'Jun', requests: 0, completed: 0 },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage AgriConnect soil testing services
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {statsData.map((stat) => (
          <Card key={stat.title} sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: `${stat.color}15`,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
                <Chip
                  label={stat.change}
                  size="small"
                  color={stat.trend === 'up' ? 'success' : 'error'}
                  icon={<TrendingUp />}
                />
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Monthly Requests Chart */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Monthly Service Requests
          </Typography>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#2563eb" name="Requests" />
              <Bar dataKey="completed" fill="#059669" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Request Status Distribution */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Request Status Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={requestStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {requestStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2 }}>
            {requestStatusData.map((item) => (
              <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    mr: 1,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item.name}: {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mt: 3 }}>
        {/* Recent Activities */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Activities
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: activity.color }}>
                    {activity.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.user}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                  <Chip 
                    label={activity.status} 
                    size="small" 
                    color={getStatusColor(activity.status) as any} 
                  />
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No recent activities
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RequestPage />}
              sx={{ height: 80, flexDirection: 'column', textAlign: 'center' }}
              href="/soil-management/requests"
              component="a"
            >
              <Typography variant="body2" fontWeight={500}>
                View Requests
              </Typography>
            </Button>
            <Button
              variant="outlined"
              startIcon={<Description />}
              sx={{ height: 80, flexDirection: 'column', textAlign: 'center' }}
              href="/soil-management/reports"
              component="a"
            >
              <Typography variant="body2" fontWeight={500}>
                View Reports
              </Typography>
            </Button>
            <Button
              variant="outlined"
              startIcon={<LocationOn />}
              sx={{ height: 80, flexDirection: 'column', textAlign: 'center' }}
              href="/soil-management/collection-centers"
              component="a"
            >
              <Typography variant="body2" fontWeight={500}>
                Centers
              </Typography>
            </Button>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
              sx={{ height: 80, flexDirection: 'column', textAlign: 'center' }}
              href="/soil-management/analytics"
              component="a"
            >
              <Typography variant="body2" fontWeight={500}>
                Analytics
              </Typography>
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
