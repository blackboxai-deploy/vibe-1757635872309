// Speech Recognition for SKV.ChatGB
// Supports multiple languages: English, Hindi, Arabic, Urdu

export interface SpeechRecognitionConfig {
  language: 'en' | 'ar' | 'hi' | 'ur';
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export class VoiceChatManager {
  private recognition: any = null;
  private isListening = false;
  
  constructor() {
    // Check browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
    }
  }

  // Start listening for voice input
  startListening(config: SpeechRecognitionConfig, onResult: (transcript: string) => void, onError?: (error: string) => void) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    // Configure recognition based on selected language
    this.recognition.lang = this.getLanguageCode(config.language);
    this.recognition.continuous = config.continuous;
    this.recognition.interimResults = config.interimResults;
    this.recognition.maxAlternatives = config.maxAlternatives;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice recognition started');
    };

    this.recognition.onresult = (event: any) => {
      let transcript = '';
      
      // Get the most recent result
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      if (transcript.trim()) {
        // Convert to business-friendly format
        const processedTranscript = this.processBusinessQuery(transcript, config.language);
        onResult(processedTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const errorMessage = this.getErrorMessage(event.error, config.language);
      onError?.(errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      onError?.('Failed to start voice recognition');
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Get language code for speech recognition
  private getLanguageCode(language: 'en' | 'ar' | 'hi' | 'ur'): string {
    const languageCodes = {
      en: 'en-US',           // English (US)
      ar: 'ar-AE',           // Arabic (UAE)  
      hi: 'hi-IN',           // Hindi (India)
      ur: 'ur-PK'            // Urdu (Pakistan)
    };
    
    return languageCodes[language] || 'en-US';
  }

  // Process business-related voice queries
  private processBusinessQuery(transcript: string, language: 'en' | 'ar' | 'hi' | 'ur'): string {
    let processed = transcript.toLowerCase().trim();
    
    // Common business term corrections
    const corrections: { [key: string]: string } = {
      // English corrections
      'setup': 'setup',
      'set up': 'setup', 
      'business': 'business',
      'visa': 'visa',
      'golden visa': 'golden visa',
      'employment visa': 'employment visa',
      'vat registration': 'VAT registration',
      'tax': 'tax',
      'documents': 'documents',
      'invoice': 'invoice',
      
      // Hindi corrections
      'व्यापार': 'business',
      'कंपनी': 'company',
      'वीज़ा': 'visa',
      'दस्तावेज़': 'documents',
      'टैक्स': 'tax',
      
      // Common voice recognition mistakes
      'golden we said': 'golden visa',
      'we eighty registration': 'VAT registration',
      'in voice': 'invoice',
      'doc you meant': 'documents'
    };

    // Apply corrections
    Object.entries(corrections).forEach(([mistake, correction]) => {
      processed = processed.replace(new RegExp(mistake, 'gi'), correction);
    });

    // Capitalize first letter
    return processed.charAt(0).toUpperCase() + processed.slice(1);
  }

  // Get user-friendly error messages
  private getErrorMessage(error: string, language: 'en' | 'ar' | 'hi' | 'ur'): string {
    const errorMessages = {
      en: {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not accessible. Please check permissions.',
        'not-allowed': 'Microphone permission denied. Please enable in browser settings.',
        'network': 'Network error. Please check internet connection.',
        'default': 'Voice recognition failed. Please try typing your message.'
      },
      hi: {
        'no-speech': 'आवाज़ नहीं सुनाई दी। कृपया दोबारा कोशिश करें।',
        'audio-capture': 'माइक्रोफोन उपलब्ध नहीं। Permission check करें।', 
        'not-allowed': 'माइक्रोफोन permission नहीं मिली। Browser settings में enable करें।',
        'network': 'Network error। Internet connection check करें।',
        'default': 'Voice recognition failed। Message type करने की कोशिश करें।'
      },
      ar: {
        'no-speech': 'لم يتم اكتشاف صوت. يرجى المحاولة مرة أخرى.',
        'audio-capture': 'الميكروفون غير متاح. تحقق من الأذونات.',
        'not-allowed': 'تم رفض إذن الميكروفون. يرجى تمكينه في إعدادات المتصفح.',
        'network': 'خطأ في الشبكة. تحقق من اتصال الإنترنت.',
        'default': 'فشل التعرف على الصوت. يرجى محاولة كتابة الرسالة.'
      },
      ur: {
        'default': 'Voice recognition ناکام۔ پیغام ٹائپ کرنے کی کوشش کریں۔'
      }
    };

    const messages = errorMessages[language] || errorMessages.en;
    return messages[error as keyof typeof messages] || messages.default;
  }

  // Check if voice recognition is supported
  isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }
}