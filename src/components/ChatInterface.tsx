"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
// import VoiceMessage from "@/components/VoiceMessage";
// import UserAuth from "@/components/UserAuth";  
// import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import "../styles/chat.css";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  aiProvider?: "gpt" | "grok" | "deepseek" | "claude" | "current";
  department?: string;
}

interface ChatInterfaceProps {
  onStatsUpdate: (stats: any) => void;
}

export default function ChatInterface({ onStatsUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: `مرحباً! 🙋‍♂️ أهلاً وسهلاً بك في SKV.ChatGB! 

Hello! Welcome to SKV.ChatGB! 👋

मैं आपका AI असिस्टेंट हूं UAE बिजनेस सेवाओं के लिए!

I'm your friendly AI assistant specializing in UAE business services! 😊

🎯 **मैं आपकी मदद कर सकता हूं:**
✅ Business Setup & Company Registration (कंपनी रजिस्ट्रेशन)
✅ Visa Services - Employment, Family, Golden Visa (वीजा सेवाएं) 
✅ Tax & VAT Registration (टैक्स और VAT)
✅ Document Processing & Attestation (दस्तावेज़ प्रोसेसिंग)
✅ Bank Account Opening (बैंक अकाउंट खोलना)
✅ Ejari & Municipality Services (इजारी सेवाएं)

💰 **शुरुआती कीमतें:**
• Business Setup: AED 15,000 से शुरू
• Golden Visa: AED 25,000 से शुरू  
• Employment Visa: AED 3,500 से शुरू
• VAT Registration: AED 2,000 से शुरू

🗣️ **आप पूछ सकते हैं:**
• "UAE में business कैसे शुरू करें?"
• "Visa के लिए कौन से documents चाहिए?"
• "Golden visa के लिए क्या requirements हैं?"
• "Bank account कैसे खोलें?"

Ready to help you succeed in UAE! 🚀
आपका सवाल क्या है? How can I help you today? 😊`,
      sender: "ai",
      timestamp: new Date(),
      aiProvider: "gpt",
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
   const [selectedAI, setSelectedAI] = useState<"gpt" | "grok" | "deepseek" | "claude" | "current">("current");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
    const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

   const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    
    // Fallback to scroll into view
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  };

  useEffect(() => {
    // Scroll immediately when messages change
    scrollToBottom();
    
    // Also scroll after a short delay to ensure DOM updates
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 200);

    return () => clearTimeout(timer);
  }, [messages, isLoading]);

   const aiProviders = {
    gpt: { name: "ChatGPT", color: "bg-green-600", icon: "🤖" },
    grok: { name: "Grok", color: "bg-purple-600", icon: "⚡" },
    deepseek: { name: "DeepSeek", color: "bg-blue-600", icon: "🔍" },
    claude: { name: "Claude 4 Sonnet", color: "bg-orange-600", icon: "🧠" },
    current: { name: "Current AI", color: "bg-red-600", icon: "💬" },
  };

   const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Scroll after user message is added
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          aiProvider: selectedAI,
          language: selectedLanguage,
          context: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm sorry, I couldn't process your request right now. Please try again.",
        sender: "ai",
        timestamp: new Date(),
        aiProvider: selectedAI,
        department: data.department,
      };

       setMessages(prev => [...prev, aiMessage]);

      // Scroll after AI response is added
      setTimeout(() => {
        scrollToBottom();
      }, 300);

      // Update stats
      onStatsUpdate((prevStats: any) => {
        const newStats = { ...prevStats, totalChats: prevStats.totalChats + 1 };
        localStorage.setItem("skv-chatbot-stats", JSON.stringify(newStats));
        return newStats;
      });

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing technical difficulties. Please try again or contact our support team at info@skvbusiness.com",
        sender: "ai",
        timestamp: new Date(),
        aiProvider: selectedAI,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

   const quickActions = [
    "How to start business in UAE?",
    "What documents needed for visa?",
    "How much cost for company setup?",
    "VAT registration kaise kare?",
    "Golden visa ke liye kya chahiye?",
    "Bank account kaise khole?",
    "Ejari registration process?",
    "Labor card processing time?",
    "Tax services ke bare mein batao",
    "Family visa requirements?",
    "Freezone vs Mainland difference?",
    "Document attestation process?"
  ];

   const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const handleVoiceMessage = (voiceText: string) => {
    setInputMessage(voiceText);
    // Auto-send voice message
    setTimeout(() => {
      handleSendMessage();
    }, 500);
  };

 

 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Chat Area */}
      <div className="lg:col-span-3">
         <Card className="bg-blue-900 border-blue-800 h-[650px] flex flex-col shadow-lg">
          <CardHeader className="flex-shrink-0 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-white">SKV.ChatGB</CardTitle>
                <Badge 
                  className={`${aiProviders[selectedAI].color} text-white`}
                >
                  {aiProviders[selectedAI].name}
                </Badge>
                <Badge variant="outline" className="text-blue-200 border-blue-400">
                  {selectedLanguage.toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm text-blue-200">
                {messages.length} messages
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
               <div 
              ref={chatContainerRef}
              className="flex-1 px-4 overflow-y-auto chat-container smooth-scroll" 
              style={{ 
                maxHeight: "calc(100vh - 400px)"
              }}
            >
              <div className="space-y-4 pb-4 min-h-full">
                 {messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} message-enter`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`max-w-[80%] ${
                      message.sender === "user" 
                        ? "bg-blue-600 text-white" 
                        : "bg-blue-900/50 text-blue-100"
                    } rounded-lg p-3`}>
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.aiProvider && (
                          <span>{aiProviders[message.aiProvider]?.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                  {isLoading && (
                  <div className="flex justify-start mb-4 typing-indicator">
                    <div className="bg-blue-900/50 text-blue-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                        <span className="text-xs text-blue-300">AI typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>

              {/* Input Area */}
            <div className="p-4 border-t border-blue-700">
              <div className="flex items-center space-x-3">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about business setup, visas, tax services... 🎤"
                  className="bg-blue-900/50 border-blue-600 text-white placeholder:text-blue-300"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Sending..." : "Send"}
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-blue-300 text-center">
                💬 Type your business questions here
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Sidebar */}
      <div className="space-y-4">
         {/* User Login Coming Soon */}
        <Card className="bg-green-900/20 border-green-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">👤 User Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-green-200">
              <div>🎤 <strong>Voice Messages</strong> - Coming soon!</div>
              <div>👤 <strong>User Login</strong> - Email registration</div>
              <div>📊 <strong>Analytics</strong> - Usage tracking</div>
              <div>☁️ <strong>Cloud Storage</strong> - Professional backup</div>
              <div>🔍 <strong>Admin Dashboard</strong> - Business intelligence</div>
            </div>
          </CardContent>
        </Card>

 

        {/* Mobile Install Guide */}
        <Card className="bg-blue-900 border-blue-800 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">📱 Install Mobile App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-blue-200 text-sm">
              Install SKV.ChatGB as mobile app for instant access
            </p>
            
            <div className="bg-blue-800/50 p-3 rounded-lg text-xs text-blue-200">
              <p className="font-medium text-white mb-1">📱 Installation Steps:</p>
              <p><strong>iPhone:</strong> Safari → Share (⬆️) → Add to Home Screen</p>
              <p><strong>Android:</strong> Chrome → Menu (⋮) → Add to home screen</p>
            </div>
            
            <Button 
              onClick={() => {
                const userAgent = navigator.userAgent.toLowerCase();
                const isIOS = /iphone|ipad|ipod/.test(userAgent);
                const isAndroid = /android/.test(userAgent);
                
                let message = "";
                if (isIOS) {
                  message = "🍎 iPhone Installation:\n\n1. Safari में यह page खुला है ✅\n2. Bottom में Share button (⬆️) tap करें\n3. 'Add to Home Screen' select करें\n4. 'Add' confirm करें\n5. Home screen पर icon दिख जाएगा! 🎉";
                } else if (isAndroid) {
                  message = "🤖 Android Installation:\n\n1. Chrome में यह page खुला है ✅\n2. Top-right में menu (⋮) tap करें\n3. 'Add to home screen' select करें\n4. 'Install' confirm करें\n5. App drawer में icon मिल जाएगा! 🎉";
                } else {
                  message = "💻 Desktop Installation:\n\n1. Chrome/Edge में यह page खुला है ✅\n2. Address bar में install icon देखें\n3. Install icon click करें\n4. 'Install' confirm करें\n5. Desktop app बन जाएगा! 🎉";
                }
                alert(message);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              Show Install Steps
            </Button>
            
            <div className="text-xs text-blue-300">
              ✅ Offline support • ✅ Fast loading • ✅ Home screen icon
            </div>
          </CardContent>
        </Card>

        {/* AI & Language Settings */}
        <Card className="bg-blue-900 border-blue-800 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-blue-200 text-sm mb-2 block">AI Provider</label>
               <Select value={selectedAI} onValueChange={(value) => setSelectedAI(value as "gpt" | "grok" | "deepseek" | "claude" | "current")}>
                <SelectTrigger className="bg-blue-900/50 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 border-blue-600">
                  {Object.entries(aiProviders).map(([key, provider]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      {provider.icon} {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-blue-200 text-sm mb-2 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="bg-blue-900/50 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 border-blue-600">
                  <SelectItem value="en" className="text-white">🇺🇸 English</SelectItem>
                  <SelectItem value="ar" className="text-white">🇦🇪 العربية</SelectItem>
                  <SelectItem value="hi" className="text-white">🇮🇳 हिंदी</SelectItem>
                  <SelectItem value="ur" className="text-white">🇵🇰 اردو</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quick Questions */}
        <Card className="bg-blue-900 border-blue-800 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Quick Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                 onClick={() => handleQuickQuestion(question)}
                className="w-full text-left text-blue-200 hover:text-white hover:bg-blue-700 justify-start p-2 h-auto"
              >
                {question}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-blue-900 border-blue-800 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-white font-medium">General</div>
              <div className="text-blue-200">info@skvbusiness.com</div>
            </div>
            <div className="border-t border-blue-600 pt-2">
              <div className="text-white font-medium mb-2">Departments</div>
              <div className="space-y-1 text-blue-200 text-xs">
                <div>🏢 Tax: mohit@skvbusiness.com</div>
                <div>📋 Legal: sunil@skvbusiness.com</div>
                <div>🌍 Global: nikita@skvbusiness.com</div>
                <div>✈️ Visa: rahul@skvbusiness.com</div>
              </div>
            </div>
          </CardContent>
         </Card>

 
      </div>
    </div>
  );
}