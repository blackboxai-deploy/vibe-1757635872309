"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  loginTime: Date;
  lastActivity: Date;
  totalChats: number;
  totalDocuments: number;
  totalInvoices: number;
}

interface UserAuthProps {
  onUserLogin: (user: User) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function UserAuth({ onUserLogin, currentUser, onLogout }: UserAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    company: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-login from localStorage if available
  useEffect(() => {
    const savedUser = localStorage.getItem("skv-chatgb-user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      onUserLogin(userData);
    }
  }, [onUserLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate authentication (in production, use real auth API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!formData.email || !formData.name) {
        setError("Email and name are required");
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        company: formData.company,
        loginTime: new Date(),
        lastActivity: new Date(),
        totalChats: 0,
        totalDocuments: 0,
        totalInvoices: 0
      };

      // Save to localStorage (in production, save to database)
      localStorage.setItem("skv-chatgb-user", JSON.stringify(newUser));
      
      // Track user registration
      const userStats = JSON.parse(localStorage.getItem("skv-user-analytics") || "[]");
      userStats.push({
        userId: newUser.id,
        email: newUser.email,
        registrationDate: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || "direct"
      });
      localStorage.setItem("skv-user-analytics", JSON.stringify(userStats));

      onUserLogin(newUser);

    } catch (error) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("skv-chatgb-user");
    onLogout();
  };

  // If user is logged in, show user info
  if (currentUser) {
    return (
      <Card className="bg-blue-900 border-blue-800 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center justify-between">
            👤 Welcome Back!
            <Badge className="bg-green-600">Online</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-blue-200">Name:</span>
              <div className="text-white font-medium">{currentUser.name}</div>
            </div>
            <div>
              <span className="text-blue-200">Email:</span>
              <div className="text-white font-medium">{currentUser.email}</div>
            </div>
            {currentUser.company && (
              <div>
                <span className="text-blue-200">Company:</span>
                <div className="text-white font-medium">{currentUser.company}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-800/50 p-2 rounded text-center">
              <div className="text-white font-bold">{currentUser.totalChats}</div>
              <div className="text-blue-200">Chats</div>
            </div>
            <div className="bg-blue-800/50 p-2 rounded text-center">
              <div className="text-white font-bold">{currentUser.totalDocuments}</div>
              <div className="text-blue-200">Docs</div>
            </div>
            <div className="bg-blue-800/50 p-2 rounded text-center">
              <div className="text-white font-bold">{currentUser.totalInvoices}</div>
              <div className="text-blue-200">Invoices</div>
            </div>
          </div>

          <Button 
            onClick={handleLogout}
            variant="outline" 
            size="sm" 
            className="w-full text-blue-200 border-blue-600 hover:bg-blue-800"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Login/Register form
  return (
    <Card className="bg-blue-900 border-blue-800 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">
          👤 User Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={isLogin ? "login" : "register"} onValueChange={(v) => setIsLogin(v === "login")}>
          <TabsList className="grid w-full grid-cols-2 bg-blue-800">
            <TabsTrigger value="login" className="text-white data-[state=active]:bg-blue-600">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="text-white data-[state=active]:bg-blue-600">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="email" className="text-blue-200 text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your@email.com"
                  className="bg-blue-800/50 border-blue-600 text-white placeholder:text-blue-300"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="name" className="text-blue-200 text-sm">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your name"
                  className="bg-blue-800/50 border-blue-600 text-white placeholder:text-blue-300"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs">{error}</div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Logging in..." : "Login / Quick Access"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="reg-email" className="text-blue-200 text-sm">Email *</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="business@email.com"
                  className="bg-blue-800/50 border-blue-600 text-white placeholder:text-blue-300"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reg-name" className="text-blue-200 text-sm">Full Name *</Label>
                <Input
                  id="reg-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your full name"
                  className="bg-blue-800/50 border-blue-600 text-white placeholder:text-blue-300"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-blue-200 text-sm">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+971 50 123 4567"
                  className="bg-blue-800/50 border-blue-600 text-white placeholder:text-blue-300"
                />
              </div>

              <div>
                <Label htmlFor="company" className="text-blue-200 text-sm">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Company name"
                  className="bg-blue-800/50 border-blue-600 text-white placeholder:text-blue-300"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs">{error}</div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-xs text-blue-300">
          <div>✅ Free account creation</div>
          <div>✅ Secure data storage</div>
          <div>✅ Personalized experience</div>
          <div>✅ Usage analytics included</div>
        </div>
      </CardContent>
    </Card>
  );
}