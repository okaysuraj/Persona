import { useState, useEffect, lazy, Suspense } from 'react';
import type { Persona, Relationship, Message, UserFact, EpisodicMemory, PersonaCreateInput, BillingStatus } from './types';
import { api } from './services/api';
import { Header } from './components/navigation/Header';
import { PersonaSelector } from './components/persona/PersonaSelector';
import { ChatInterface } from './components/chat/ChatInterface';

// Lazy-loaded modal dialogs for minimal initial bundle and reduced heap memory usage
const AmbientVoiceModal = lazy(() => import('./components/voice/AmbientVoiceModal').then((m) => ({ default: m.AmbientVoiceModal })));
const MemoryVaultModal = lazy(() => import('./components/memory/MemoryVaultModal').then((m) => ({ default: m.MemoryVaultModal })));
const PaywallModal = lazy(() => import('./components/billing/PaywallModal').then((m) => ({ default: m.PaywallModal })));
const MomentsGalleryModal = lazy(() => import('./components/moments/MomentsGalleryModal').then((m) => ({ default: m.MomentsGalleryModal })));
const StoriesFeedModal = lazy(() => import('./components/stories/StoriesFeedModal').then((m) => ({ default: m.StoriesFeedModal })));
const AnalyticsDashboardModal = lazy(() => import('./components/analytics/AnalyticsDashboardModal').then((m) => ({ default: m.AnalyticsDashboardModal })));
const LettersModal = lazy(() => import('./components/letters/LettersModal').then((m) => ({ default: m.LettersModal })));
const TogetherModeModal = lazy(() => import('./components/together/TogetherModeModal').then((m) => ({ default: m.TogetherModeModal })));
const LoungeModal = lazy(() => import('./components/lounge/LoungeModal').then((m) => ({ default: m.LoungeModal })));
const CompanionLifeModal = lazy(() => import('./components/lifesim/CompanionLifeModal').then((m) => ({ default: m.CompanionLifeModal })));
const CBTDebriefModal = lazy(() => import('./components/cbt/CBTDebriefModal').then((m) => ({ default: m.CBTDebriefModal })));
const AuthModal = lazy(() => import('./components/auth/AuthModal').then((m) => ({ default: m.AuthModal })));

type Dialog = 'auth' | 'vault' | 'voice' | 'paywall' | 'moments' | 'stories' | 'analytics' | 'letters' | 'together' | 'lounge' | 'life' | 'cbt';

export function App() {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [relationships, setRelationships] = useState<Record<string, Relationship>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [facts, setFacts] = useState<UserFact[]>([]);
  const [memories, setMemories] = useState<EpisodicMemory[]>([]);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);

  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; display_name: string } | null>(() => api.getCurrentUser());

  const [currentView, setCurrentView] = useState<'roster' | 'chat'>('roster');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('persona_theme');
      return saved ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingToken, setStreamingToken] = useState('');

  // Keep the persisted preference and document theme in sync.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem('persona_theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // Private browsing can disable persistent storage.
    }
  }, [isDarkMode]);

  // Load initial personas and billing status
  useEffect(() => {
    async function init() {
      const loadedPersonas = await api.getPersonas();
      setPersonas(loadedPersonas);

      // Load relationships for all personas
      const entries = await Promise.all(loadedPersonas.map(async (persona) => (
        [persona.id, await api.getRelationship(persona.id)] as const
      )));
      setRelationships(Object.fromEntries(entries));

      // Load initial billing status
      const billing = await api.getBillingStatus();
      setBillingStatus(billing);

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

  const handleImportCard = async (cardData: any) => {
    const imported = await api.importCharacterCard(cardData);
    const updatedList = await api.getPersonas();
    setPersonas(updatedList);
    const rel = await api.getRelationship(imported.id);
    setRelationships((prev) => ({ ...prev, [imported.id]: rel }));
    handleSelectPersona(imported);
  };

  const handleUpgrade = async (tier: 'plus' | 'vip', period: 'monthly' | 'yearly') => {
    await api.createCheckoutSession(tier, period);
    const updated = await api.getBillingStatus();
    setBillingStatus(updated);
    setDialog(null);
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

  const handleLoginSuccess = async (user: { id: string; email: string; display_name: string }) => {
    setCurrentUser(user);
    // Reload personas and state for newly authenticated user
    const loadedPersonas = await api.getPersonas();
    setPersonas(loadedPersonas);
    if (loadedPersonas.length > 0) {
      handleSelectPersona(loadedPersonas[0]);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FAF8F5] text-[#141312] dark:bg-[#121211] dark:text-[#FAF8F5] transition-colors duration-200">
      {/* Floating Navigation Island */}
      <Header
        activePersona={currentView === 'chat' ? activePersona : null}
        currentUser={currentUser}
        onOpenAuth={() => setDialog('auth')}
        onLogout={handleLogout}
        onOpenVault={() => setDialog('vault')}
        onOpenVoice={() => setDialog('voice')}
        onOpenPaywall={() => setDialog('paywall')}
        onOpenMoments={() => setDialog('moments')}
        onOpenStories={() => setDialog('stories')}
        onOpenAnalytics={() => setDialog('analytics')}
        onOpenLetters={() => setDialog('letters')}
        onOpenTogether={() => setDialog('together')}
        onOpenLounge={() => setDialog('lounge')}
        onOpenLifeSim={() => setDialog('life')}
        onOpenCBT={() => setDialog('cbt')}
        onSelectPersonas={() => setCurrentView('roster')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        factCount={facts.length}
        subscriptionTier={billingStatus?.subscription_tier || 'free'}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'roster' || !activePersona || !currentRelationship ? (
          <PersonaSelector
            personas={personas}
            relationships={relationships}
            onSelectPersona={handleSelectPersona}
            onCreatePersona={handleCreatePersona}
            onImportCard={handleImportCard}
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

      {/* Mount dialogs only while open. */}
      <Suspense fallback={null}>
        {dialog === 'auth' && (
          <AuthModal
            isOpen={dialog === 'auth'}
            onClose={() => setDialog(null)}
            onSuccess={handleLoginSuccess}
          />
        )}

        {dialog === 'lounge' && (
          <LoungeModal
            isOpen={dialog === 'lounge'}
            onClose={() => setDialog(null)}
            personas={personas}
          />
        )}

        {dialog === 'life' && activePersona && (
          <CompanionLifeModal
            isOpen={dialog === 'life'}
            onClose={() => setDialog(null)}
            persona={activePersona}
          />
        )}

        {dialog === 'cbt' && activePersona && (
          <CBTDebriefModal
            isOpen={dialog === 'cbt'}
            onClose={() => setDialog(null)}
            persona={activePersona}
          />
        )}

        {dialog === 'letters' && activePersona && (
          <LettersModal
            isOpen={dialog === 'letters'}
            onClose={() => setDialog(null)}
            persona={activePersona}
          />
        )}

        {dialog === 'together' && activePersona && (
          <TogetherModeModal
            isOpen={dialog === 'together'}
            onClose={() => setDialog(null)}
            persona={activePersona}
          />
        )}

        {dialog === 'moments' && activePersona && (
          <MomentsGalleryModal
            isOpen={dialog === 'moments'}
            onClose={() => setDialog(null)}
            persona={activePersona}
          />
        )}

        {dialog === 'stories' && (
          <StoriesFeedModal
            isOpen={dialog === 'stories'}
            onClose={() => setDialog(null)}
            onReplyToStory={(personaId, reply) => {
              const target = personas.find((p) => p.id === personaId) || activePersona;
              if (target) {
                handleSelectPersona(target);
                handleSendMessage(reply);
              }
            }}
          />
        )}

        {dialog === 'analytics' && (
          <AnalyticsDashboardModal
            isOpen={dialog === 'analytics'}
            onClose={() => setDialog(null)}
          />
        )}

        {dialog === 'voice' && activePersona && (
          <AmbientVoiceModal
            isOpen={dialog === 'voice'}
            onClose={() => setDialog(null)}
            persona={activePersona}
          />
        )}

        {dialog === 'vault' && activePersona && (
          <MemoryVaultModal
            isOpen={dialog === 'vault'}
            onClose={() => setDialog(null)}
            persona={activePersona}
            facts={facts}
            memories={memories}
            onDeleteFact={handleDeleteFact}
            onAddFact={handleAddFact}
          />
        )}

        {dialog === 'paywall' && (
          <PaywallModal
            isOpen={dialog === 'paywall'}
            onClose={() => setDialog(null)}
            billingStatus={billingStatus}
            onUpgrade={handleUpgrade}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
