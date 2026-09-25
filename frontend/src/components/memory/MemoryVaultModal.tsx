import { useState } from 'react';
import type { Persona, UserFact, EpisodicMemory } from '../../types';
import { Button } from '../ui/Button';
import {
  Books,
  Trash,
  Plus,
  ShieldCheck,
  X,
  BookmarkSimple,
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
  const [activeTab, setActiveTab] = useState<'facts' | 'milestones'>('facts');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<UserFact['category']>('preferences');

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
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/[0.08] dark:border-white/[0.1] shadow-2xl overflow-hidden">
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
                What {persona.name} has learned and preserved about you.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#78746E] hover:bg-[#141312]/[0.05] dark:hover:bg-white/[0.08] transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

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

          {/* Category Filter Chips - Accessible on all screen sizes */}
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

        {/* Add Fact Form */}
        {showAddForm && activeTab === 'facts' && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 sm:p-5 mx-3 sm:mx-6 mt-3 sm:mt-4 rounded-2xl bg-white dark:bg-[#1F1D1B] border border-[#C85A32]/20 space-y-3 shrink-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-[#C85A32] uppercase tracking-wider">
                Store Fact in Long-Term Memory
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#8C877F] hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="text-xs rounded-xl p-2.5 bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/10 dark:border-white/10 text-[#141312] dark:text-[#F5F2EC]"
              >
                <option value="preferences">Preferences</option>
                <option value="habits">Habits</option>
                <option value="secrets">Secrets</option>
                <option value="life">Life Circumstances</option>
                <option value="work">Work & Craft</option>
              </select>
              <input
                type="text"
                placeholder="Topic / Key (e.g. Favorite tea)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="text-xs sm:col-span-2 rounded-xl p-2.5 bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/10 dark:border-white/10 text-[#141312] dark:text-[#F5F2EC]"
              />
            </div>
            <textarea
              placeholder="What should the companion remember? (e.g. Enjoys chamomile tea while reading late at night)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              rows={2}
              className="w-full text-xs rounded-xl p-2.5 bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/10 dark:border-white/10 text-[#141312] dark:text-[#F5F2EC] resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="terracotta" size="sm">
                Commit to Vault
              </Button>
            </div>
          </form>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {activeTab === 'facts' ? (
            <>
              {filteredFacts.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#8C877F]">
                  No memory facts in this category yet.
                </div>
              ) : (
                filteredFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="group flex items-start justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1C1A19] border border-[#141312]/[0.06] dark:border-white/[0.08] hover:border-[#C85A32]/30 transition-all shadow-[0_1px_4px_rgba(0,0,0,0.02)] gap-2"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                            categoryBadges[fact.category] || categoryBadges.preferences
                          }`}
                        >
                          {fact.category}
                        </span>
                        <span className="text-xs font-semibold text-[#141312] dark:text-[#F5F2EC] truncate">
                          {fact.key}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#4A4742] dark:text-[#D4CEC5] leading-relaxed">
                        {fact.value}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5 text-[10px] font-mono text-[#8C877F]">
                        <span>Confidence: {Math.round(fact.confidence * 100)}%</span>
                        <span>•</span>
                        <span>
                          {new Date(fact.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Touch-accessible delete button on mobile */}
                    <button
                      onClick={() => onDeleteFact(fact.id)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all shrink-0 active:scale-95"
                      title="Erase fact (Privacy agency)"
                      aria-label="Delete memory fact"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))
              )}
            </>
          ) : (
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
                    <p className="text-[10px] sm:text-[11px] font-mono text-[#8C877F]">
                      {new Date(mem.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))
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
