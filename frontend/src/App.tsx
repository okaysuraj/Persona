import { useState, useEffect } from 'react';
import type { Persona, Relationship, Message, UserFact, EpisodicMemory, PersonaCreateInput } from './types';
import { api } from './services/api';
import { Header } from './components/navigation/Header';
import { PersonaSelector } from './components/persona/PersonaSelector';
import { ChatInterface } from './components/chat/ChatInterface';
import { AmbientVoiceModal } from './components/voice/AmbientVoiceModal';
import { MemoryVaultModal } from './components/memory/MemoryVaultModal';

export function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [relationships, setRelationships] = useState<Record<string, Relationship>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [facts, setFacts] = useState<UserFact[]>([]);
  const [memories, setMemories] = useState<EpisodicMemory[]>([]);

  const [currentView, setCurrentView] = useState<'roster' | 'chat'>('roster');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingToken, setStreamingToken] = useState('');

  // Synchronize dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load initial personas
  useEffect(() => {
    async function init() {
      const loadedPersonas = await api.getPersonas();
      setPersonas(loadedPersonas);

      // Load relationships for all personas
      const relMap: Record<string, Relationship> = {};
      for (const p of loadedPersonas) {
        relMap[p.id] = await api.getRelationship(p.id);
      }
      setRelationships(relMap);

      // Set first persona as default active
      if (loadedPersonas.length > 0) {
        const first = loadedPersonas[0];
        setActivePersona(first);
        const msgs = await api.getMessages(first.id);
        setMessages(msgs);
        const f = await api.getUserFacts(first.id);
        setFacts(f);
        const m = await api.getEpisodicMemories(first.id);
        setMemories(m);
      }
    }
    init();
  }, []);

  // When active persona changes, load their conversation & memory state
  const handleSelectPersona = async (persona: Persona) => {
    setActivePersona(persona);
    setCurrentView('chat');

    const msgs = await api.getMessages(persona.id);
    setMessages(msgs);
    const f = await api.getUserFacts(persona.id);
    setFacts(f);
    const m = await api.getEpisodicMemories(persona.id);
    setMemories(m);
  };

  // Send message handler with real-time streaming
  const handleSendMessage = async (content: string) => {
    if (!activePersona) return;

    // Optimistically append user message to local state
    const optimisticUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: `conv-${activePersona.id}`,
      sender_type: 'user',
      content,
      media_type: 'text',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    setIsStreaming(true);
    setStreamingToken('');

    try {
      await api.sendMessage(
        activePersona,
        content,
        (token) => {
          setStreamingToken((prev) => prev + token);
        }
      );

      // Replace or finalize messages from store
      const updatedMsgs = await api.getMessages(activePersona.id);
      setMessages(updatedMsgs);

      // Refresh relationship state
      const updatedRel = await api.getRelationship(activePersona.id);
      setRelationships((prev) => ({
        ...prev,
        [activePersona.id]: updatedRel,
      }));
    } finally {
      setIsStreaming(false);
      setStreamingToken('');
    }
  };

  // Memory Vault actions
  const handleDeleteFact = async (factId: string) => {
    if (!activePersona) return;
    await api.deleteUserFact(activePersona.id, factId);
    const updatedFacts = await api.getUserFacts(activePersona.id);
    setFacts(updatedFacts);
  };

  const handleAddFact = async (
    category: UserFact['category'],
    key: string,
    value: string
  ) => {
    if (!activePersona) return;
    await api.addUserFact(activePersona.id, category, key, value);
    const updatedFacts = await api.getUserFacts(activePersona.id);
    setFacts(updatedFacts);
  };

  const handleCreatePersona = async (input: PersonaCreateInput) => {
    const created = await api.createPersona(input);
    const updatedList = await api.getPersonas();
    setPersonas(updatedList);
    const rel = await api.getRelationship(created.id);
    setRelationships((prev) => ({ ...prev, [created.id]: rel }));
    handleSelectPersona(created);
  };

  const currentRelationship = activePersona
    ? relationships[activePersona.id] || {
        persona_id: activePersona.id,
        intimacy_level: 20,
        intimacy_xp: 40,
        stage: 'Friend',
        mood_state: { joy: 0.8, empathy: 0.9, affection: 0.7, energy: 0.7, vulnerability: 0.6 },
        last_interaction_at: new Date().toISOString(),
      }
    : null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FAF8F5] text-[#141312] dark:bg-[#121211] dark:text-[#FAF8F5] transition-colors duration-200">
      {/* Floating Navigation Island */}
      <Header
        activePersona={currentView === 'chat' ? activePersona : null}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onSelectPersonas={() => setCurrentView('roster')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        factCount={facts.length}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'roster' || !activePersona || !currentRelationship ? (
          <PersonaSelector
            personas={personas}
            relationships={relationships}
            onSelectPersona={handleSelectPersona}
            onCreatePersona={handleCreatePersona}
          />
        ) : (
          <ChatInterface
            persona={activePersona}
            relationship={currentRelationship}
            messages={messages}
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            streamingToken={streamingToken}
          />
        )}
      </main>

      {/* Ambient Voice Call Modal */}
      {activePersona && (
        <AmbientVoiceModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          persona={activePersona}
        />
      )}

      {/* Memory Vault Modal */}
      {activePersona && (
        <MemoryVaultModal
          isOpen={isVaultOpen}
          onClose={() => setIsVaultOpen(false)}
          persona={activePersona}
          facts={facts}
          memories={memories}
          onDeleteFact={handleDeleteFact}
          onAddFact={handleAddFact}
        />
      )}
    </div>
  );
}

export default App;
