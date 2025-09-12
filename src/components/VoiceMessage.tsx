"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VoiceMessageProps {
  onVoiceMessage: (message: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export default function VoiceMessage({ onVoiceMessage, isListening, setIsListening }: VoiceMessageProps) {
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      
      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        if (event.results[current].isFinal) {
          onVoiceMessage(transcriptText);
          setTranscript("");
          setIsListening(false);
        }
      };
      
      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript("");
      };
      
      // Handle end
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language, onVoiceMessage, setIsListening]);

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      setIsListening(true);
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const languageOptions = [
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "ar-AE", name: "Arabic", flag: "🇦🇪" },
    { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
    { code: "ur-PK", name: "Urdu", flag: "🇵🇰" },
  ];

  if (!isSupported) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-3">
          <div className="text-red-700 text-sm">
            🎤 Voice messaging not supported in this browser. Please use Chrome or Safari.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-900/50 border-blue-700">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-medium text-sm">🎤 Voice Message</h4>
          <Badge className={isListening ? "bg-red-600" : "bg-green-600"}>
            {isListening ? "Listening..." : "Ready"}
          </Badge>
        </div>
        
        {/* Language Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-blue-200 text-xs">Language:</span>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-blue-800 text-white text-xs p-1 rounded border-blue-600"
          >
            {languageOptions.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-blue-800/50 p-2 rounded text-blue-100 text-sm">
            <div className="text-xs text-blue-300 mb-1">Listening:</div>
            <div>"{transcript}"</div>
          </div>
        )}

        {/* Voice Controls */}
        <div className="flex space-x-2">
          {!isListening ? (
            <Button
              onClick={startListening}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              🎤 Start Speaking
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              ⏹️ Stop Recording
            </Button>
          )}
        </div>

        {/* Voice Tips */}
        <div className="text-xs text-blue-300">
          <div className="mb-1">💡 Voice Tips:</div>
          <div>• Speak clearly और naturally</div>
          <div>• Hindi-English mix भी okay है</div>
          <div>• "Company setup kaise kare" बोलें</div>
          <div>• "Golden visa ke bare mein batao"</div>
        </div>
      </CardContent>
    </Card>
  );
}