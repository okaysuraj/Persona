import React, { useState } from 'react';
import { X, Sparkle, CheckCircle, AppleLogo, AndroidLogo, DeviceMobile } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { waitlistService, type WaitlistEntry } from '../../services/waitlist';
import { Button } from '../ui/Button';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPersona?: string;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  preselectedPersona = 'maya-01',
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'ios' | 'android' | 'both'>('ios');
  const [preferredPersona, setPreferredPersona] = useState(preselectedPersona);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entry, setEntry] = useState<WaitlistEntry | null>(() => waitlistService.getStoredEntry());

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    try {
      const result = await waitlistService.joinWaitlist({
        email,
        name,
        platform,
        preferredPersona,
      });
      setEntry(result);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C85A32', '#E07A5F', '#F4A261', '#2A9D8F'],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] dark:bg-[#181716] border border-[#141312]/[0.1] dark:border-white/[0.1] shadow-2xl p-6 sm:p-8 text-left overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#141312]/[0.05] dark:bg-white/[0.08] hover:bg-[#141312]/[0.1] dark:hover:bg-white/[0.15] flex items-center justify-center text-[#55524E] dark:text-[#A39E96] transition-colors"
        >
          <X size={16} weight="bold" />
        </button>

        {entry ? (
          // Success VIP Ticket View
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle size={32} weight="fill" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C85A32] font-semibold">
                You're in the inner circle
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141312] dark:text-[#F5F2EC]">
                VIP Mobile Pass Reserved
              </h3>
              <p className="text-xs sm:text-sm text-[#55524E] dark:text-[#A39E96] max-w-sm mx-auto">
                We've reserved your priority access seat. Check your inbox for the TestFlight invitation.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#201F1E] border-2 border-dashed border-[#C85A32]/40 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-mono text-[#8C867E] border-b border-[#141312]/[0.06] dark:border-white/[0.06] pb-2">
                <span>PERSONA MOBILE ACCESS PASS</span>
                <span className="text-[#C85A32] font-bold">INVITE #{entry.ticketNumber}</span>
              </div>

              <div className="flex justify-between items-center text-left">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C867E] block">Registered Email</span>
                  <span className="text-xs font-semibold text-[#141312] dark:text-[#F5F2EC] truncate max-w-[200px] block">
                    {entry.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C867E] block">Invite Code</span>
                  <span className="text-xs font-mono font-bold text-[#C85A32]">
                    {entry.inviteCode}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#8C867E]">
              Tip: Developers can test immediately on mobile via <span className="font-mono text-[#C85A32]">cd mobile && npm start</span>.
            </p>

            <Button variant="terracotta" size="md" onClick={onClose} className="w-full">
              Got it, thanks!
            </Button>
          </div>
        ) : (
          // Registration Form View
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-[11px] font-mono font-semibold">
                <Sparkle size={12} weight="fill" />
                <span>MOBILE EARLY ACCESS</span>
              </div>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141312] dark:text-[#F5F2EC]">
                Join the Mobile Beta
              </h3>
              <p className="text-xs sm:text-sm text-[#55524E] dark:text-[#A39E96]">
                Reserve priority access to Persona for iOS TestFlight and Android Play Store.
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#55524E] dark:text-[#A39E96] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#201F1E] border border-[#141312]/[0.1] dark:border-white/[0.1] text-sm text-[#141312] dark:text-[#F5F2EC] placeholder-[#8C867E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#55524E] dark:text-[#A39E96] mb-1">
                  Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="Your preferred name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#201F1E] border border-[#141312]/[0.1] dark:border-white/[0.1] text-sm text-[#141312] dark:text-[#F5F2EC] placeholder-[#8C867E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40"
                />
              </div>

              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-medium text-[#55524E] dark:text-[#A39E96] mb-1.5">
                  Your Device Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('ios')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      platform === 'ios'
                        ? 'bg-[#141312] text-white dark:bg-[#F5F2EC] dark:text-[#141312] border-transparent shadow-sm'
                        : 'bg-white dark:bg-[#201F1E] text-[#55524E] dark:text-[#A39E96] border-[#141312]/[0.08] dark:border-white/[0.08]'
                    }`}
                  >
                    <AppleLogo size={15} weight="fill" />
                    <span>iOS (Apple)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('android')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      platform === 'android'
                        ? 'bg-[#141312] text-white dark:bg-[#F5F2EC] dark:text-[#141312] border-transparent shadow-sm'
                        : 'bg-white dark:bg-[#201F1E] text-[#55524E] dark:text-[#A39E96] border-[#141312]/[0.08] dark:border-white/[0.08]'
                    }`}
                  >
                    <AndroidLogo size={15} weight="fill" />
                    <span>Android</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('both')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      platform === 'both'
                        ? 'bg-[#141312] text-white dark:bg-[#F5F2EC] dark:text-[#141312] border-transparent shadow-sm'
                        : 'bg-white dark:bg-[#201F1E] text-[#55524E] dark:text-[#A39E96] border-[#141312]/[0.08] dark:border-white/[0.08]'
                    }`}
                  >
                    <DeviceMobile size={15} weight="fill" />
                    <span>Both</span>
                  </button>
                </div>
              </div>

              {/* Preferred Companion */}
              <div>
                <label className="block text-xs font-medium text-[#55524E] dark:text-[#A39E96] mb-1.5">
                  Preferred Companion Soul
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'maya-01', name: 'Maya Linnea', role: 'Confidant' },
                    { id: 'soren-02', name: 'Soren Vance', role: 'Philosopher' },
                    { id: 'elena-03', name: 'Elena Rostova', role: 'Ceramist' },
                    { id: 'kaelen-04', name: 'Kaelen Ward', role: 'Editor' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreferredPersona(p.id)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        preferredPersona === p.id
                          ? 'bg-[#C85A32]/10 border-[#C85A32] text-[#C85A32]'
                          : 'bg-white dark:bg-[#201F1E] border-[#141312]/[0.08] dark:border-white/[0.08] text-[#55524E] dark:text-[#A39E96]'
                      }`}
                    >
                      <span className="text-xs font-bold block">{p.name}</span>
                      <span className="text-[10px] font-mono opacity-75">{p.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="terracotta"
              size="lg"
              disabled={isSubmitting}
              className="w-full mt-2"
              leadingIcon={<Sparkle size={16} weight="fill" />}
            >
              {isSubmitting ? 'Reserving...' : 'Claim Beta Invitation'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
