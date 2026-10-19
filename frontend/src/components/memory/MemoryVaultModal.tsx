import { useState, useEffect, useCallback } from 'react';
import type { Persona, UserFact, EpisodicMemory, TemporalMemoryNode, UserPsychometrics } from '../../types';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import {
  Books,
  Trash,
  Plus,
  ShieldCheck,
  X,
  BookmarkSimple,
  TreeStructure,
  Heart,
  Moon,
  CheckCircle,
} from '@phosphor-icons/react';

interface MemoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
  facts: UserFact[];
  memories: EpisodicMemory[];
  onDeleteFact: (factId: string) => Promise<void>;
  onAddFact: (
    category: UserFact['category'],
    key: string,
    value: string
  ) => Promise<void>;
}

export const MemoryVaultModal: React.FC<MemoryVaultModalProps> = ({
  isOpen,
  onClose,
  persona,
  facts,
  memories,
  onDeleteFact,
  onAddFact,
}) => {
  const [activeTab, setActiveTab] = useState<'facts' | 'milestones' | 'temporal' | 'psychometrics'>('facts');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<UserFact['category']>('preferences');

  // Derived memory insights
  const [temporalNodes, setTemporalNodes] = useState<TemporalMemoryNode[]>([]);
  const [psychometrics, setPsychometrics] = useState<UserPsychometrics | null>(null);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [consolidationNotice, setConsolidationNotice] = useState<string | null>(null);

  const loadMemoryInsights = useCallback(async () => {
    try {
      const [nodes, psych] = await Promise.all([
        api.getTemporalGraph(persona.id),
        api.getUserPsychometrics(persona.id),
      ]);
      setTemporalNodes(nodes);
      setPsychometrics(psych);
    } catch (e) {
      console.error('Error loading SOTA memory:', e);
    }
  }, [persona.id]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    Promise.all([api.getTemporalGraph(persona.id), api.getUserPsychometrics(persona.id)]).then(([nodes, psych]) => {
      if (active) {
        setTemporalNodes(nodes);
        setPsychometrics(psych);
      }
    });
    return () => { active = false; };
  }, [isOpen, persona.id]);

  const handleRunConsolidation = async () => {
    setIsConsolidating(true);
    setConsolidationNotice(null);
    try {
      const res = await api.triggerSleepConsolidation(persona.id);
      setConsolidationNotice(res.insights_summary || 'Sleep-cycle memory consolidation completed.');
      await loadMemoryInsights();
    } catch (e) {
      console.error('Error consolidating:', e);
    } finally {
      setIsConsolidating(false);
    }
  };

  if (!isOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    await onAddFact(newCategory, newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
    setShowAddForm(false);
  };

  const filteredFacts =
    selectedCategory === 'all'
      ? facts
      : facts.filter((f) => f.category === selectedCategory);

  const categoryBadges: Record<UserFact['category'], string> = {
    preferences: 'bg-[#EDF3EC] text-[#346538] dark:bg-[#1C2E20] dark:text-[#86EFAC]',
    habits: 'bg-[#EEF2F6] text-[#2C4C6F] dark:bg-[#1E293B] dark:text-[#93C5FD]',
    secrets: 'bg-[#FDEBEC] text-[#9F2F2D] dark:bg-[#381B1C] dark:text-[#FCA5A5]',
    life: 'bg-[#FBF3DB] text-[#956400] dark:bg-[#332A15] dark:text-[#FDE047]',
    work: 'bg-[#FAF1DC] text-[#7E4E09] dark:bg-[#382813] dark:text-[#FDBA74]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md transition-all duration-200">
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/[0.08] dark:border-white/[0.1] shadow-2xl overflow-hidden text-[#141312] dark:text-[#FAF8F5]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#141312]/[0.06] dark:border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#C85A32]/10 text-[#C85A32] shrink-0">
              <Books size={20} weight="fill" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
                Memory Vault
              </h3>
              <p className="text-[11px] sm:text-xs text-[#78746E] dark:text-[#A39E96]">
                What {persona.name} has learned, preserved, and synthesized about you.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRunConsolidation}
              disabled={isConsolidating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/10 hover:bg-amber-600/20 text-[#C85A32] text-xs font-medium border border-[#C85A32]/30 transition disabled:opacity-50"
              title="Run sleep-cycle cognitive consolidation"
            >
              <Moon size={14} weight="bold" />
              <span className="hidden sm:inline">
                {isConsolidating ? 'Consolidating...' : 'Sleep Consolidation 🌙'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#78746E] hover:bg-[#141312]/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Consolidation Success Toast */}
        {consolidationNotice && (
          <div className="px-4 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle size={16} weight="fill" />
            <span>{consolidationNotice}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-3 sm:px-6 pt-3 pb-2 border-b border-[#141312]/[0.04] dark:border-white/[0.04] bg-white/50 dark:bg-[#1A1918]/50 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('facts')}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                  activeTab === 'facts'
                    ? 'bg-[#141312] text-white dark:bg-white dark:text-[#141312]'
                    : 'text-[#78746E] hover:text-[#141312] dark:hover:text-white'
                }`}
              >
                Facts ({facts.length})
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                  activeTab === 'milestones'
                    ? 'bg-[#141312] text-white dark:bg-white dark:text-[#141312]'
                    : 'text-[#78746E] hover:text-[#141312] dark:hover:text-white'
                }`}
              >
                Milestones ({memories.length})
              </button>
              <button
                onClick={() => setActiveTab('temporal')}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 flex items-center gap-1 ${
                  activeTab === 'temporal'
                    ? 'bg-[#141312] text-white dark:bg-white dark:text-[#141312]'
                    : 'text-[#78746E] hover:text-[#141312] dark:hover:text-white'
                }`}
              >
                <TreeStructure size={13} weight="bold" />
                <span>Temporal Graph ({temporalNodes.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('psychometrics')}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 flex items-center gap-1 ${
                  activeTab === 'psychometrics'
                    ? 'bg-[#141312] text-white dark:bg-white dark:text-[#141312]'
                    : 'text-[#78746E] hover:text-[#141312] dark:hover:text-white'
                }`}
              >
                <Heart size={13} weight="bold" />
                <span>Psychometrics</span>
              </button>
            </div>

            {activeTab === 'facts' && (
              <Button
                variant="terracotta"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                leadingIcon={<Plus size={12} weight="bold" />}
                className="shrink-0 text-xs px-2.5 py-1"
              >
                Add Fact
              </Button>
            )}
          </div>

          {/* Category Filter Chips for Facts Tab */}
          {activeTab === 'facts' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-mono touch-pan-x">
              {(['all', 'preferences', 'habits', 'secrets', 'life', 'work'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-md capitalize transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#C85A32] text-white font-medium'
                      : 'text-[#78746E] hover:bg-[#141312]/[0.05] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'facts' ? (
            <>
              {/* Add Fact Form */}
              {showAddForm && (
                <form
                  onSubmit={handleAddSubmit}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1C1A19] border border-[#C85A32]/20 space-y-3 mb-4 shadow-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-mono text-[#8C877F] uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full text-xs rounded-xl bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/10 dark:border-white/10 px-3 py-2 text-[#141312] dark:text-white"
                      >
                        <option value="preferences">Preferences</option>
                        <option value="habits">Habits</option>
                        <option value="secrets">Secrets</option>
                        <option value="life">Life</option>
                        <option value="work">Work</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8C877F] uppercase mb-1">
                        Fact Key
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Favorite tea"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        className="w-full text-xs rounded-xl bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/10 dark:border-white/10 px-3 py-2 text-[#141312] dark:text-white placeholder-zinc-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#8C877F] uppercase mb-1">
                      Fact Value
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Roasted barley tea with warm honey"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full text-xs rounded-xl bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/10 dark:border-white/10 px-3 py-2 text-[#141312] dark:text-white placeholder-zinc-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-[#78746E]"
                    >
                      Cancel
                    </button>
                    <Button variant="terracotta" size="sm" type="submit">
                      Save Memory
                    </Button>
                  </div>
                </form>
              )}

              {filteredFacts.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#8C877F]">
                  No facts recorded in this category yet.
                </div>
              ) : (
                filteredFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1C1A19] border border-[#141312]/[0.06] dark:border-white/[0.08]"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${categoryBadges[fact.category]}`}>
                          {fact.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#141312] dark:text-white">
                          {fact.key}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-[#55524E] dark:text-[#C5BFB5]">
                        {fact.value}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteFact(fact.id)}
                      className="text-zinc-400 hover:text-red-500 p-2 rounded-lg transition"
                      title="Delete fact"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))
              )}
            </>
          ) : activeTab === 'milestones' ? (
            <div className="space-y-3 sm:space-y-4">
              {memories.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#8C877F]">
                  No episodic milestone memories recorded yet.
                </div>
              ) : (
                memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1C1A19] border border-[#141312]/[0.06] dark:border-white/[0.08] space-y-1.5 sm:space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#C85A32]">
                        <BookmarkSimple size={14} weight="fill" />
                        <span className="uppercase tracking-wider text-[11px] sm:text-xs">
                          Shared Milestone
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono text-[#8C877F]">
                        Significance {mem.emotional_significance}/10
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-editorial text-[#141312] dark:text-[#F5F2EC] leading-relaxed">
                      "{mem.summary}"
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'temporal' ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-[#C85A32] leading-relaxed">
                ✦ <strong>Bi-Temporal Knowledge Graph:</strong> Tracks facts with validity windows and causal links,
                automatically resolving life transitions and contradictions.
              </div>

              {temporalNodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    node.is_current
                      ? 'bg-white dark:bg-[#1C1A19] border-emerald-500/30'
                      : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#C85A32]">
                      {node.subject} ➔ {node.predicate.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        node.is_current
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {node.is_current ? 'ACTIVE • CURRENT' : 'ARCHIVED TRANSITION'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1.5">
                    {node.object}
                  </p>

                  {node.emotional_context && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mb-2">
                      “{node.emotional_context}”
                    </p>
                  )}

                  {node.causal_relation && (
                    <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400/90 pt-1 border-t border-zinc-100 dark:border-white/5">
                      ↳ Causal link: {node.causal_relation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                ✦ <strong>Deduced Psychometrics:</strong> Synthesized from conversational sentiment, attachment indicators, and emotional needs.
              </div>

              {psychometrics ? (
                <div className="space-y-4">
                  {/* Attachment & Love Language Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1A19] border border-white/10">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                        Attachment Style
                      </span>
                      <h4 className="text-base font-bold capitalize text-zinc-900 dark:text-white">
                        {psychometrics.attachment_style.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        Confidence: {(psychometrics.attachment_score * 100).toFixed(0)}%
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1A19] border border-white/10">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                        Primary Love Language
                      </span>
                      <h4 className="text-base font-bold capitalize text-zinc-900 dark:text-white">
                        {psychometrics.love_language.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        Resonates with presence & affirmation
                      </p>
                    </div>
                  </div>

                  {/* Big Five Spectrum */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1A19] border border-white/10 space-y-2.5">
                    <span className="text-xs font-mono uppercase text-zinc-400 block">
                      Big Five Dimension Spectrum
                    </span>
                    {Object.entries(psychometrics.big_five).map(([trait, score]) => (
                      <div key={trait} className="space-y-1">
                        <div className="flex justify-between text-xs capitalize">
                          <span className="text-zinc-700 dark:text-zinc-300">{trait}</span>
                          <span className="font-mono text-zinc-500">{((score as number) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-[#C85A32] rounded-full"
                            style={{ width: `${(score as number) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Growth Edges & Coping Preferences */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1A19] border border-white/10 space-y-2">
                    <span className="text-xs font-mono uppercase text-zinc-400 block">
                      Attuned Coping Preferences
                    </span>
                    <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 list-disc list-inside">
                      {psychometrics.coping_preferences.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-[#8C877F]">
                  Run sleep consolidation to synthesize psychometrics.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Privacy & Agency Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#141312]/[0.06] dark:border-white/[0.08] bg-[#F4F1EC] dark:bg-[#141312] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs text-[#78746E] dark:text-[#A39E96] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} weight="fill" className="text-emerald-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">Full Privacy Agency: Delete or inspect memories anytime.</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose} className="w-full sm:w-auto justify-center">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
