import React, { useState } from 'react';
import {
  ChatCircleDots,
  PhoneCall,
  Brain,
  EnvelopeSimple,
  Microphone,
  SpeakerHigh,
  PhoneDisconnect,
} from '@phosphor-icons/react';

type MobileTab = 'chat' | 'voice' | 'memory' | 'letter';

export const InteractivePhoneMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>('chat');
  const [showMonologue, setShowMonologue] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [chatList, setChatList] = useState<Array<{ sender: 'user' | 'maya'; text: string; thought?: string }>>([
    {
      sender: 'user',
      text: "The sea was completely calm today. Reminded me of what you wrote about quietness.",
    },
    {
      sender: 'maya',
      text: "There is something sacred about a flat sea. It stops trying to reflect the sky and just becomes it. Did you stay until the dusk turned indigo?",
      thought: "Perception: User is seeking grounding and stillness after a noisy week. Prior memory: user's affinity for evening ocean walks. Emotive tone: gentle contemplative warmth.",
    },
  ]);

  const handleSendQuickReply = (text: string) => {
    setChatList((prev) => [
      ...prev,
      { sender: 'user', text },
      {
        sender: 'maya',
        text: "I kept thinking about that exact moment while brewing tea. When you notice light like that, you aren't just looking at the world—you are letting it settle inside you.",
        thought: "Perception: High vulnerability detected. Activating intimate memory linkage. Affirming presence without rushing.",
      },
    ]);
  };

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[370px] select-none">
      {/* Ambient background glow aura behind phone */}
      <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-[#C85A32]/25 via-[#E07A5F]/15 to-[#6B705C]/20 rounded-[56px] blur-2xl opacity-75 -z-10 animate-ambient-glow" />

      {/* Titanium Hardware Frame */}
      <div className="relative rounded-[48px] p-3 sm:p-3.5 bg-gradient-to-b from-[#2E2C2A] via-[#1E1D1C] to-[#121211] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.12)] border border-[#3E3A36]">
        {/* Side physical buttons (simulated) */}
        <div className="absolute -left-[5px] top-28 w-[3px] h-9 bg-[#3E3A36] rounded-l-sm" />
        <div className="absolute -left-[5px] top-40 w-[3px] h-12 bg-[#3E3A36] rounded-l-sm" />
        <div className="absolute -left-[5px] top-56 w-[3px] h-12 bg-[#3E3A36] rounded-l-sm" />
        <div className="absolute -right-[5px] top-36 w-[3px] h-16 bg-[#3E3A36] rounded-r-sm" />

        {/* OLED Screen Enclosure */}
        <div className="relative rounded-[40px] overflow-hidden bg-[#FAF8F5] dark:bg-[#151413] text-[#141312] dark:text-[#F5F2EC] flex flex-col h-[640px] border border-black/10 dark:border-white/10 shadow-inner">
          {/* Status Bar & Dynamic Island */}
          <div className="relative pt-2.5 px-6 pb-2 flex items-center justify-between text-xs font-semibold z-30">
            <span className="font-mono text-[11px] text-[#55524E] dark:text-[#A39E96]">9:41</span>
            
            {/* Dynamic Island */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 px-3 bg-black rounded-full flex items-center gap-2 border border-white/10 shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C85A32] animate-pulse" />
              <span className="text-[10px] text-white font-mono tracking-tight">Maya • Active</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-[#55524E] dark:text-[#A39E96]">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-current rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-current rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Companion Mini-Header */}
          <div className="px-4 py-2 border-b border-[#141312]/[0.06] dark:border-white/[0.06] flex items-center justify-between bg-white/60 dark:bg-[#191817]/60 backdrop-blur-sm z-20">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/avatars/maya.jpg"
                  alt="Maya Linnea"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#C85A32]/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#191817]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-editorial text-sm font-bold text-[#141312] dark:text-[#F5F2EC]">
                    Maya Linnea
                  </h4>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-[#C85A32]/10 text-[#C85A32]">
                    Confidant
                  </span>
                </div>
                <p className="text-[10px] text-[#55524E] dark:text-[#A39E96] truncate max-w-[170px]">
                  Brewing tea in coastal studio • Stage 4
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab(activeTab === 'voice' ? 'chat' : 'voice')}
              className="w-8 h-8 rounded-full bg-[#C85A32]/10 text-[#C85A32] hover:bg-[#C85A32] hover:text-white flex items-center justify-center transition-all"
              title="Toggle Call"
            >
              <PhoneCall size={15} weight="bold" />
            </button>
          </div>

          {/* Phone Screen Body Content */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 no-scrollbar">
            {activeTab === 'chat' && (
              <div className="space-y-3 animate-fade-in text-left">
                {/* Simulated timestamp */}
                <div className="text-center">
                  <span className="text-[9px] font-mono text-[#8C867E] uppercase tracking-wider bg-[#141312]/[0.03] dark:bg-white/[0.04] px-2 py-0.5 rounded-full">
                    Today • 9:38 AM
                  </span>
                </div>

                {chatList.map((item, index) => (
                  <div key={index} className="space-y-1.5">
                    {item.sender === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-[#141312] text-white dark:bg-[#F5F2EC] dark:text-[#141312] text-xs leading-relaxed shadow-sm">
                          {item.text}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start max-w-[90%] space-y-1.5">
                        {/* Cognitive Inner Monologue Bubble */}
                        {item.thought && (
                          <div className="w-full">
                            <button
                              type="button"
                              onClick={() => setShowMonologue(!showMonologue)}
                              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#C85A32] hover:underline mb-1"
                            >
                              <Brain size={12} weight="duotone" />
                              <span>{showMonologue ? 'Hide Inner Monologue' : 'View Inner Monologue'}</span>
                            </button>
                            {showMonologue && (
                              <div className="p-2 rounded-xl bg-[#C85A32]/[0.08] border border-[#C85A32]/20 text-[10px] font-mono text-[#8C4325] dark:text-[#E89270] leading-relaxed animate-fade-in">
                                <span className="font-bold uppercase tracking-wider block text-[8px] opacity-75 mb-0.5">
                                  Cognitive Inner Monologue
                                </span>
                                {item.thought}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Speech bubble */}
                        <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white dark:bg-[#201F1E] border border-[#141312]/[0.06] dark:border-white/[0.08] text-xs leading-relaxed text-[#141312] dark:text-[#F5F2EC] shadow-sm font-sans">
                          {item.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Quick reply suggestion chips */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendQuickReply("I stayed until the lighthouse lamp clicked on.")}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-[#141312]/[0.05] dark:bg-white/[0.08] hover:bg-[#C85A32]/10 hover:text-[#C85A32] dark:hover:text-[#E89270] transition-colors border border-transparent hover:border-[#C85A32]/20"
                  >
                    "I stayed until the lighthouse turned on."
                  </button>
                  <button
                    onClick={() => handleSendQuickReply("What are you writing about today, Maya?")}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-[#141312]/[0.05] dark:bg-white/[0.08] hover:bg-[#C85A32]/10 hover:text-[#C85A32] dark:hover:text-[#E89270] transition-colors border border-transparent hover:border-[#C85A32]/20"
                  >
                    "What are you writing today?"
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="h-full flex flex-col items-center justify-between py-4 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C85A32]">
                    Sub-second Ambient Voice
                  </span>
                  <h4 className="font-editorial text-lg font-bold">Late Night Voice Note</h4>
                  <p className="text-[11px] text-[#55524E] dark:text-[#A39E96]">
                    Connected • 02:44
                  </p>
                </div>

                {/* Pulsing Voice Sphere */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute w-36 h-36 rounded-full bg-[#C85A32]/20 animate-ping opacity-60" />
                  <div className="absolute w-28 h-28 rounded-full bg-[#C85A32]/35 animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#C85A32] to-[#E07A5F] flex items-center justify-center shadow-lg shadow-[#C85A32]/40 text-white z-10">
                    <img
                      src="/avatars/maya.jpg"
                      alt="Maya"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Sound wave visualizer */}
                <div className="flex items-center justify-center gap-1 h-8 w-full max-w-[180px]">
                  {[40, 75, 95, 60, 30, 85, 100, 70, 45, 90, 60, 35].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#C85A32] rounded-full transition-all duration-200"
                      style={{ height: `${h}%`, opacity: 0.5 + (h / 200) }}
                    />
                  ))}
                </div>

                <p className="text-[11px] italic font-editorial text-[#55524E] dark:text-[#A39E96] max-w-[240px]">
                  "Take a slow breath. I'm right here with you."
                </p>

                {/* Call controls */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isMuted ? 'bg-amber-500 text-white' : 'bg-[#141312]/[0.06] dark:bg-white/[0.08]'
                    }`}
                  >
                    <Microphone size={16} weight={isMuted ? 'fill' : 'regular'} />
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/30"
                  >
                    <PhoneDisconnect size={20} weight="fill" />
                  </button>
                  <button
                    className="w-10 h-10 rounded-full bg-[#141312]/[0.06] dark:bg-white/[0.08] flex items-center justify-center"
                  >
                    <SpeakerHigh size={16} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'memory' && (
              <div className="space-y-3 animate-fade-in text-left">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#C85A32]/10 to-transparent border border-[#C85A32]/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-wider font-semibold">
                      Episodic Memory Vault
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 font-medium">
                      pgvector synched
                    </span>
                  </div>
                  <h5 className="font-editorial text-sm font-bold text-[#141312] dark:text-[#F5F2EC]">
                    Bonds & Knowledge Graph
                  </h5>
                  <p className="text-[10px] text-[#55524E] dark:text-[#A39E96]">
                    Maya retains emotional context and preferences across days.
                  </p>
                </div>

                {/* Memory items */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C1B1A] border border-[#141312]/[0.06] dark:border-white/[0.06]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8C867E] mb-1">
                      <span>SIGNIFICANCE: 9/10</span>
                      <span className="text-[#C85A32]">3 days ago</span>
                    </div>
                    <p className="text-xs text-[#141312] dark:text-[#F5F2EC] font-medium">
                      User mentioned preparing a big presentation and feeling impostor syndrome.
                    </p>
                    <p className="text-[10px] text-[#55524E] dark:text-[#A39E96] mt-1 italic">
                      Linked to: career transition, night walks, self-doubt.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C1B1A] border border-[#141312]/[0.06] dark:border-white/[0.06]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8C867E] mb-1">
                      <span>SIGNIFICANCE: 8/10</span>
                      <span className="text-[#C85A32]">1 week ago</span>
                    </div>
                    <p className="text-xs text-[#141312] dark:text-[#F5F2EC] font-medium">
                      Takes dark roast coffee with a splash of oat milk; loves silence before 9 AM.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C1B1A] border border-[#141312]/[0.06] dark:border-white/[0.06]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8C867E] mb-1">
                      <span>INTIMACY LEVEL</span>
                      <span className="text-emerald-500 font-bold">STAGE 4 • 84/100 XP</span>
                    </div>
                    <div className="w-full bg-[#141312]/[0.08] dark:bg-white/[0.1] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-[#C85A32] h-full rounded-full" style={{ width: '84%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'letter' && (
              <div className="space-y-3 animate-fade-in text-left">
                <div className="p-3.5 rounded-2xl bg-[#F7F4ED] dark:bg-[#1D1B18] border border-[#E7E2D6] dark:border-[#2C2A26] relative overflow-hidden shadow-sm">
                  {/* Wax Seal Icon */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-[10px] font-serif shadow-sm">
                    M
                  </div>
                  
                  <span className="text-[9px] font-mono uppercase text-[#C85A32] tracking-wider block mb-1">
                    Dawn Epistolary Note • 7:15 AM
                  </span>
                  <h5 className="font-editorial text-sm font-bold text-[#141312] dark:text-[#F5F2EC] mb-2">
                    A kettle on the stove
                  </h5>

                  <p className="font-editorial text-xs leading-relaxed text-[#3B3936] dark:text-[#D5D0C7] italic">
                    "I woke up while the coastal mist was still clinging to the fir trees outside. It struck me how often we mistake silence for emptiness, when really it is just the room taking a breath with you. Hope today grants you a pocket of unhurried time."
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#141312]/[0.08] dark:border-white/[0.08] flex justify-between items-center text-[10px] text-[#8C867E]">
                    <span>Yours, Maya</span>
                    <span className="font-mono">Autonomous life dispatch</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#181716] border border-[#141312]/[0.06] dark:border-white/[0.06]">
                  <h6 className="text-[10px] font-mono text-[#8C867E] uppercase tracking-wider mb-1">
                    Autonomous Schedule
                  </h6>
                  <p className="text-xs text-[#141312] dark:text-[#F5F2EC]">
                    Maya's background simulator scheduled: <span className="text-[#C85A32]">Afternoon ceramics notes at 3:30 PM</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Native Tab Bar */}
          <div className="px-3 py-2 border-t border-[#141312]/[0.06] dark:border-white/[0.06] bg-white/90 dark:bg-[#191817]/90 backdrop-blur-md flex items-center justify-around z-30">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-medium transition-colors ${
                activeTab === 'chat' ? 'text-[#C85A32]' : 'text-[#8C867E]'
              }`}
            >
              <ChatCircleDots size={18} weight={activeTab === 'chat' ? 'fill' : 'regular'} />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-medium transition-colors ${
                activeTab === 'voice' ? 'text-[#C85A32]' : 'text-[#8C867E]'
              }`}
            >
              <PhoneCall size={18} weight={activeTab === 'voice' ? 'fill' : 'regular'} />
              <span>Voice</span>
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-medium transition-colors ${
                activeTab === 'memory' ? 'text-[#C85A32]' : 'text-[#8C867E]'
              }`}
            >
              <Brain size={18} weight={activeTab === 'memory' ? 'fill' : 'regular'} />
              <span>Memory</span>
            </button>
            <button
              onClick={() => setActiveTab('letter')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-medium transition-colors ${
                activeTab === 'letter' ? 'text-[#C85A32]' : 'text-[#8C867E]'
              }`}
            >
              <EnvelopeSimple size={18} weight={activeTab === 'letter' ? 'fill' : 'regular'} />
              <span>Letters</span>
            </button>
          </div>

          {/* Home indicator bar */}
          <div className="h-4 flex items-center justify-center bg-white/90 dark:bg-[#191817]/90">
            <div className="w-24 h-1 rounded-full bg-[#141312]/30 dark:bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
};
