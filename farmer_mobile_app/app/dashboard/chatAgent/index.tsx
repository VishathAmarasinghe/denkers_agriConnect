import { router } from 'expo-router';
import { useEffect } from 'react';

export default function ChatAgentScreen() {
  useEffect(() => {
    // Redirect to agent selection screen
    router.replace('/dashboard/chatAgent/agentSelection');
  }, []);

  return null;
}
