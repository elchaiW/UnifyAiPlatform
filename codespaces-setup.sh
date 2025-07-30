#!/bin/bash

# Luminadoc iOS App Setup Script for GitHub Codespaces
echo "🚀 Setting up Luminadoc iOS development environment in GitHub Codespaces..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (required for React Native)
echo "📱 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install essential development tools
echo "🔧 Installing development tools..."
sudo apt-get install -y build-essential git curl watchman

# Install global npm packages
echo "📦 Installing global npm packages..."
npm install -g @expo/cli @react-native-community/cli eas-cli

# Create React Native project with Expo (recommended for Codespaces)
echo "📱 Creating Luminadoc React Native project..."
npx create-expo-app LuminadocApp --template typescript
cd LuminadocApp

# Install core dependencies
echo "📦 Installing core dependencies..."
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler

# Install Supabase and authentication
echo "🔐 Installing Supabase and authentication..."
npm install @supabase/supabase-js @react-native-async-storage/async-storage
npm install react-native-url-polyfill

# Install AI services
echo "🤖 Installing AI service SDKs..."
npm install @anthropic-ai/sdk @google/generative-ai openai

# Install UI components
echo "🎨 Installing UI components..."
npm install react-native-paper react-native-vector-icons
npx expo install react-native-elements

# Create project structure
echo "📁 Creating project structure..."
mkdir -p src/{components,screens,services,types,utils}
mkdir -p src/screens/{Auth,Chat,Dashboard}
mkdir -p src/services/{api,supabase,ai}
mkdir -p assets/{images,icons}

# Create environment variables file
echo "⚙️ Creating environment configuration..."
cat > .env << EOL
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://koxnemiudjbditxuojxw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveG5lbWl1ZGpiZGl0eHVvanh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDczMDIsImV4cCI6MjA2ODkyMzMwMn0.OxaHUwgkNjn51PQ8mrw_LR0Em0pBEXiQ6OaeMlt2Qds

# AI Service API Keys (replace with your actual keys)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key_here
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key_here
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_google_key_here

# Backend API URL (your current Luminadoc backend)
EXPO_PUBLIC_API_BASE_URL=https://78ec4688-dd28-4235-beed-f0ebdbfe0695-00-2b57xmtl00czy.picard.replit.dev
EOL

# Update app.json configuration
echo "📱 Configuring app.json..."
cat > app.json << EOL
{
  "expo": {
    "name": "Luminadoc",
    "slug": "luminadoc",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.luminadoc.app",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0f172a"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "replace-with-your-project-id"
      }
    }
  }
}
EOL

# Create Supabase service file
echo "🔐 Creating Supabase service..."
mkdir -p src/services/supabase
cat > src/services/supabase/client.ts << EOL
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
EOL

# Create basic auth screen
echo "🔐 Creating authentication screen..."
cat > src/screens/Auth/AuthScreen.tsx << EOL
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { supabase } from '../../services/supabase/client';

interface AuthScreenProps {
  navigation: any;
}

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      navigation.replace('Chat');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LUMINADOC</Text>
        <Text style={styles.subtitle}>Multi-AI Assistant Platform</Text>
        
        <TouchableOpacity
          style={[styles.signInButton, loading && styles.disabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 48,
  },
  signInButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
EOL

# Create basic chat screen
echo "💬 Creating chat screen..."
cat > src/screens/Chat/ChatScreen.tsx << EOL
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm a demo response. Connect me to your Luminadoc API!",
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LUMINADOC</Text>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask anything..."
            placeholderTextColor="#6b7280"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.disabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#374151',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
EOL

# Update App.tsx with navigation
echo "🧭 Setting up navigation..."
cat > App.tsx << EOL
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './src/services/supabase/client';
import AuthScreen from './src/screens/Auth/AuthScreen';
import ChatScreen from './src/screens/Chat/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? 'Chat' : 'Auth'}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
EOL

# Create development scripts
echo "📝 Creating package.json scripts..."
npm pkg set scripts.ios="expo run:ios"
npm pkg set scripts.android="expo run:android"
npm pkg set scripts.web="expo start --web"
npm pkg set scripts.dev="expo start"
npm pkg set scripts.build:ios="eas build --platform ios"
npm pkg set scripts.build:android="eas build --platform android"

# Initialize EAS (Expo Application Services)
echo "🚀 Initializing EAS build system..."
eas build:configure

echo ""
echo "✅ Luminadoc iOS app setup complete!"
echo ""
echo "🎉 Next steps:"
echo "1. cd LuminadocApp"
echo "2. Add your AI API keys to .env file"
echo "3. npm run dev (to start development server)"
echo "4. Open Expo Go app on your iPhone and scan QR code"
echo "5. Start developing your iOS app!"
echo ""
echo "📱 To build for App Store:"
echo "1. eas login"
echo "2. npm run build:ios"
echo "3. eas submit --platform ios"