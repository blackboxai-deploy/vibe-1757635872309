"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  onVoiceMessage: (audioBlob: Blob) => void;
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  const startVoiceRecognition = () => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Voice recognition इस browser में available नहीं है। Chrome/Safari use करें।');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      
      // Process business terms
      const processed = transcript.toLowerCase()
        .replace('golden we said', 'golden visa')
        .replace('we eighty', 'VAT')
        .replace('business set up', 'business setup')
        .replace('employment we said', 'employment visa');
      
      const finalTranscript = processed.charAt(0).toUpperCase() + processed.slice(1);
      onTranscript(finalTranscript);
      
      setTimeout(() => {
        setIsProcessing(false);
        setIsRecording(false);
      }, 500);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (error) {
      alert('Microphone access denied। Browser में permission enable करें।');
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      size="sm"
      onClick={startVoiceRecognition}
      disabled={isRecording || isProcessing}
      className={`${
        isRecording 
          ? "bg-red-600 animate-pulse" 
          : isProcessing
            ? "bg-yellow-600"
            : "bg-green-600 hover:bg-green-700"
      }`}
      title="Click to start voice recording"
    >
      <div className="flex items-center space-x-1">
        <span>🎤</span>
        <span className="text-xs">
          {isRecording ? "Listening..." : isProcessing ? "Processing..." : "Voice"}
        </span>
      </div>
    </Button>
  );
}