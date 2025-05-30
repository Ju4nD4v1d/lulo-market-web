import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Users, Package } from 'lucide-react';

const mockData = {
  dailyRevenue: [
    { name: 'Mon', value: 1200 },
    { name: 'Tue', value: 900 },
    { name: 'Wed', value: 1600 },
    { name: 'Thu', value: 1400 },
    { name: 'Fri', value: 2100 },
    { name: 'Sat', value: 1800 },
    { name: 'Sun', value: 1100 }
  ],
  topProducts: [
    { name: 'Product A', sales: 45 },
    { name: 'Product B', sales: 38 },
    { name: 'Product C', sales: 31 },
    { name: 'Product D', sales: 25 },
    { name: 'Product E', sales: 22 }
  ]
};

const StatCard = ({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: string }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {trend && (
          <p className="text-green-600 text-sm mt-1">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className="bg-primary-50 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
    </div>
  </div>
);

export const MetricsDashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$9,876"
          icon={DollarSign}
          trend="+12.5% from last month"
        />
        <StatCard
          title="Orders"
          value="156"
          icon={ShoppingBag}
          trend="+8.2% from last month"
        />
        <StatCard
          title="Products Sold"
          value="892"
          icon={Package}
          trend="+15.3% from last month"
        />
        <StatCard
          title="Active Customers"
          value="432"
          icon={Users}
          trend="+5.7% from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#5A7302" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#C8E400" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};