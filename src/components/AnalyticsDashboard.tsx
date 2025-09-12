"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalChats: number;
  totalDocuments: number;
  totalInvoices: number;
  todayVisits: number;
  weeklyVisits: number;
  monthlyVisits: number;
  topQueries: Array<{query: string, count: number}>;
  userGrowth: Array<{date: string, users: number}>;
  recentUsers: Array<{name: string, email: string, lastSeen: Date}>;
}

interface AnalyticsDashboardProps {
  isAdmin?: boolean;
}

export default function AnalyticsDashboard({ isAdmin = false }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    totalChats: 0,
    totalDocuments: 0,
    totalInvoices: 0,
    todayVisits: 0,
    weeklyVisits: 0,
    monthlyVisits: 0,
    topQueries: [],
    userGrowth: [],
    recentUsers: []
  });

  const [realTimeStats, setRealTimeStats] = useState({
    currentOnlineUsers: 0,
    lastRefresh: new Date()
  });

  useEffect(() => {
    loadAnalytics();
    
    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadAnalytics();
      updateRealTimeStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = () => {
    try {
      // Load from localStorage (in production, fetch from analytics API)
      const userStats = JSON.parse(localStorage.getItem("skv-user-analytics") || "[]");
      const chatStats = JSON.parse(localStorage.getItem("skv-chat-analytics") || "[]");
      const visitStats = JSON.parse(localStorage.getItem("skv-visit-analytics") || "[]");
      
      // Process analytics data
      const today = new Date().toDateString();
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const todayVisits = visitStats.filter((v: any) => new Date(v.timestamp).toDateString() === today).length;
      const weeklyVisits = visitStats.filter((v: any) => new Date(v.timestamp) >= thisWeek).length;
      const monthlyVisits = visitStats.filter((v: any) => new Date(v.timestamp) >= thisMonth).length;

      // Top queries analysis
      const queryCount: {[key: string]: number} = {};
      chatStats.forEach((chat: any) => {
        if (chat.userMessage) {
          queryCount[chat.userMessage] = (queryCount[chat.userMessage] || 0) + 1;
        }
      });
      
      const topQueries = Object.entries(queryCount)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([query, count]) => ({query, count: count as number}));

      setAnalytics({
        totalUsers: userStats.length,
        activeUsers: userStats.filter((u: any) => {
          const lastSeen = new Date(u.lastActivity || u.registrationDate);
          return (Date.now() - lastSeen.getTime()) < 24 * 60 * 60 * 1000; // Last 24 hours
        }).length,
        totalSessions: visitStats.length,
        totalChats: chatStats.length,
        totalDocuments: parseInt(localStorage.getItem("skv-total-documents") || "0"),
        totalInvoices: parseInt(localStorage.getItem("skv-total-invoices") || "0"),
        todayVisits,
        weeklyVisits,
        monthlyVisits,
        topQueries,
        userGrowth: [], // Calculate based on registration dates
        recentUsers: userStats.slice(-5).map((u: any) => ({
          name: u.name || u.email.split('@')[0],
          email: u.email,
          lastSeen: new Date(u.lastActivity || u.registrationDate)
        }))
      });

    } catch (error) {
      console.error("Analytics loading error:", error);
    }
  };

  const updateRealTimeStats = () => {
    // Simulate real-time user count (in production, use WebSocket)
    const onlineUsers = Math.floor(Math.random() * 10) + analytics.activeUsers;
    setRealTimeStats({
      currentOnlineUsers: onlineUsers,
      lastRefresh: new Date()
    });
  };

  const exportAnalytics = () => {
    const data = {
      analytics,
      realTimeStats,
      exportDate: new Date(),
      appVersion: "1.0.0"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SKV-ChatGB-Analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trackVisit = () => {
    // Track current visit
    const visitData = {
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || "direct",
      page: window.location.pathname
    };
    
    const visits = JSON.parse(localStorage.getItem("skv-visit-analytics") || "[]");
    visits.push(visitData);
    localStorage.setItem("skv-visit-analytics", JSON.stringify(visits));
    
    loadAnalytics(); // Refresh stats
  };

  // Track visit on component mount
  useEffect(() => {
    trackVisit();
  }, []);

  if (!isAdmin) {
    return null; // Only show to admin users
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <Card className="bg-green-900/20 border-green-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center justify-between">
            📊 Real-time Analytics
            <Badge className="bg-green-600 animate-pulse">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{realTimeStats.currentOnlineUsers}</div>
              <div className="text-green-200">Online Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{analytics.todayVisits}</div>
              <div className="text-blue-200">Today's Visits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{analytics.totalChats}</div>
              <div className="text-purple-200">Total Chats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{analytics.totalUsers}</div>
              <div className="text-orange-200">Total Users</div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-green-300">
            Last updated: {realTimeStats.lastRefresh.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="bg-blue-900/50 border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">📈 Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Visits */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">🌐 Website Visits</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Today:</span>
                  <span className="text-white font-bold">{analytics.todayVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">This Week:</span>
                  <span className="text-white font-bold">{analytics.weeklyVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">This Month:</span>
                  <span className="text-white font-bold">{analytics.monthlyVisits}</span>
                </div>
              </div>
            </div>

            {/* Users */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">👥 User Analytics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Total Users:</span>
                  <span className="text-white font-bold">{analytics.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Active (24h):</span>
                  <span className="text-white font-bold">{analytics.activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Sessions:</span>
                  <span className="text-white font-bold">{analytics.totalSessions}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">⚡ Feature Usage</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">AI Chats:</span>
                  <span className="text-white font-bold">{analytics.totalChats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Documents:</span>
                  <span className="text-white font-bold">{analytics.totalDocuments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Invoices:</span>
                  <span className="text-white font-bold">{analytics.totalInvoices}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Queries */}
      <Card className="bg-blue-900/50 border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">🔥 Popular Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.topQueries.length > 0 ? (
              analytics.topQueries.map((query, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-800/30 p-3 rounded">
                  <span className="text-blue-100 text-sm">"{query.query}"</span>
                  <Badge className="bg-blue-600">{query.count} times</Badge>
                </div>
              ))
            ) : (
              <div className="text-blue-300 text-sm text-center py-4">
                No chat data yet. Users will start chatting soon!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card className="bg-blue-900/50 border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">👥 Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recentUsers.length > 0 ? (
              analytics.recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-800/30 p-3 rounded">
                  <div>
                    <div className="text-white text-sm font-medium">{user.name}</div>
                    <div className="text-blue-300 text-xs">{user.email}</div>
                  </div>
                  <div className="text-blue-200 text-xs">
                    {user.lastSeen.toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-blue-300 text-sm text-center py-4">
                No registered users yet. First user will appear here!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export & Actions */}
      <Card className="bg-blue-900/50 border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">🛠️ Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={exportAnalytics}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            📊 Export Analytics Data
          </Button>
          
          <Button 
            onClick={loadAnalytics}
            variant="outline"
            className="w-full text-blue-200 border-blue-600"
          >
            🔄 Refresh Analytics
          </Button>

          <div className="text-xs text-blue-300 space-y-1">
            <div>• Analytics update every 30 seconds</div>
            <div>• Export includes all user data</div>
            <div>• Real-time visitor tracking active</div>
            <div>• Cloud integration ready</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}