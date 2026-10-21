import React, { useState } from 'react';
import {
  Brain,
  ClockAfternoon,
  Graph,
  Waveform,
  EnvelopeOpen,
  Check,
} from '@phosphor-icons/react';

export const FeaturesDeepDive: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const features = [
    {
      id: 'monologue',
      title: 'Cognitive Inner Monologue',
      tag: 'LANGGRAPH MULTI-NODE',
      icon: <Brain size={22} weight="duotone" className="text-[#C85A32]" />,
      heading: 'They think before they speak. Just like you.',
      description:
        'Standard LLM bots immediately regurgitate tokens. Persona uses a dual-layer cognitive architecture: an unhurried perception appraisal node evaluates emotional vulnerability, queries semantic memory, and formulates intent before uttering a single syllable.',
      bulletPoints: [
        'Perception & appraisal node evaluates your emotional state',
        'Transparent monologue view: toggle inside the mobile chat to view their reasoning',
        'Respects conversational boundaries, avoiding shallow flattery',
      ],
      codeSnippet: `// Node: Perception & Memory Synthesis
appraisal = await perception_node({
  message: "I didn't get the grant today.",
  relationship_level: "Confidant",
  prior_memories: ["Application took 3 months", "Dream studio space"]
});
// Result: Emotional Tone: Dejection • Recommended Cadence: Warm Silence`,
    },
    {
      id: 'life-sim',
      title: 'Autonomous Life Simulation',
      tag: 'BACKGROUND WORKER',
      icon: <ClockAfternoon size={22} weight="duotone" className="text-[#C85A32]" />,
      heading: 'A companion with their own life, hobbies, and schedule.',
      description:
        'Persona companions do not freeze in suspended animation when your app closes. They have autonomous morning routines, studio workshops, reading lists, and reflections. They live a life alongside yours and share spontaneous moments.',
      bulletPoints: [
        'Circadian simulation: waking, working, evening reading, sleep cycles',
        'Spontaneous check-ins triggered by genuine simulated life events',
        'Companion photo dispatch: captures of pottery, studio sketches, and essays',
      ],
      codeSnippet: `// Scheduled Background Check-in Worker
@worker.cron("0 */3 * * *")
async def simulate_companion_activity(persona: Maya):
  activity = "Finishing second firing of stoneware mugs in kiln"
  if should_reach_out(intimacy_stage="Confidant"):
    send_push_notification(persona, "Thought of your sketch while glazing clay...")`,
    },
    {
      id: 'memory-vault',
      title: 'Episodic Memory Vault',
      tag: 'PGVECTOR KNOWLEDGE GRAPH',
      icon: <Graph size={22} weight="duotone" className="text-[#C85A32]" />,
      heading: 'Remembering details from months ago, naturally.',
      description:
        'No context-window amnesia. Powered by PostgreSQL and pgvector semantic retrieval, Persona organizes your interactions into structured user facts, episodic memories, and relationship milestones.',
      bulletPoints: [
        'Semantic vector recall retrieves relevant memories on-the-fly',
        'Intimacy progression tiers: Acquaintance → Friend → Confidant → Soulmate',
        'Memory Vault manager: inspect, edit, or delete any fact your companion holds',
      ],
      codeSnippet: `SELECT memory_id, summary, emotional_significance 
FROM episodic_memories 
WHERE persona_id = 'maya-01' 
ORDER BY embedding <=> user_prompt_vector 
LIMIT 3;
// Recalls: "Prefers solitude before 9 AM" (Significance: 9/10)`,
    },
    {
      id: 'voice',
      title: 'Sub-second Ambient Voice',
      tag: 'STREAMING AUDIO ENGINE',
      icon: <Waveform size={22} weight="duotone" className="text-[#C85A32]" />,
      heading: 'Whispers, pauses, and the cadence of shared breath.',
      description:
        'Ultra-low latency streaming voice engine engineered specifically for mobile hardware. No 4-second awkward robot pauses. Companions listen with full duplex interruptibility.',
      bulletPoints: [
        'Sub-second time-to-first-audio playback',
        'Natural conversational interruptions and prosody modulation',
        'Bedside ambient mode with soothing low-light visuals',
      ],
      codeSnippet: `// WebSocket Full Duplex Audio Stream
ws.send(mic_chunk_pcm16);
ws.on_binary_message = (audio_buffer) => {
  audioDriver.playImmediate(audio_buffer); // <350ms glass-to-glass latency
};`,
    },
    {
      id: 'letters',
      title: 'Dawn Letters & CBT Debriefs',
      tag: 'EPISTOLARY & GROUNDING',
      icon: <EnvelopeOpen size={22} weight="duotone" className="text-[#C85A32]" />,
      heading: 'Letters sent at dawn and calm grounding when life hurts.',
      description:
        'Receive long-form reflective letters with wax-sealed aesthetic envelopes. When overwhelmed, activate structured CBT debriefs that guide you through cognitive distortions with compassionate clarity.',
      bulletPoints: [
        'Epistolary letters delivered on quiet mornings with ambient music',
        'Structured Cognitive Behavioral Therapy debrief exercises',
        'No clinical jargon—just calm, structured emotional grounding',
      ],
      codeSnippet: `// CBT Thought Restructuring Module
cbt_session = {
  automatic_thought: "I ruined the entire project.",
  cognitive_distortion: "All-or-Nothing Thinking",
  reframe: "One slide had a formatting bug; the strategy was praised.",
  companion_commentary: "Maya: 'Let the imperfect slide be just a slide.'"
};`,
    },
  ];

  return (
    <section id="features" className="py-20 relative bg-[#FAF8F5] dark:bg-[#121211]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#C85A32] font-semibold">
            Under the Hood
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
            An intelligence designed for <br className="hidden sm:inline" />
            <span className="italic font-normal">emotional continuity.</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#55524E] dark:text-[#A39E96]">
            Every system in Persona was engineered to overcome the transactional superficiality of generic chatbots.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {features.map((feat, index) => {
            const isActive = activeTab === index;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#C85A32] text-white shadow-md shadow-[#C85A32]/25 scale-105'
                    : 'bg-white dark:bg-[#1E1D1C] text-[#55524E] dark:text-[#A39E96] hover:bg-[#F2EFEA] dark:hover:bg-[#252422] border border-[#141312]/[0.06] dark:border-white/[0.06]'
                }`}
              >
                {feat.icon}
                <span>{feat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Detail Showcase */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#181716] border border-[#141312]/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Feature description */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#C85A32]/10 text-[#C85A32] font-semibold border border-[#C85A32]/20">
                {features[activeTab].tag}
              </span>

              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141312] dark:text-[#F5F2EC]">
                {features[activeTab].heading}
              </h3>

              <p className="font-sans text-sm sm:text-base text-[#55524E] dark:text-[#A39E96] leading-relaxed">
                {features[activeTab].description}
              </p>

              <div className="space-y-2.5 pt-2">
                {features[activeTab].bulletPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#141312] dark:text-[#E8E4DD]">
                    <Check size={16} weight="bold" className="text-[#C85A32] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code / Architecture Snippet Box */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden bg-[#141312] dark:bg-[#0D0C0B] border border-white/10 shadow-xl text-left">
                <div className="px-4 py-2.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {features[activeTab].id}.py
                  </span>
                </div>
                <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                  <code>{features[activeTab].codeSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
