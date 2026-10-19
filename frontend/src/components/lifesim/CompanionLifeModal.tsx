import React, { useState, useEffect } from 'react';
import type { Persona, LifeSimulationState } from '../../types';
import { api } from '../../services/api';

interface CompanionLifeModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
}

export const CompanionLifeModal: React.FC<CompanionLifeModalProps> = ({
  isOpen,
  onClose,
  persona,
}) => {
  const [lifeState, setLifeState] = useState<LifeSimulationState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    api.getCompanionLifeSimulation(persona.id).then((data) => {
      if (active) {
        setLifeState(data);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [isOpen, persona.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[#141312] border border-white/10 shadow-2xl overflow-hidden flex flex-col text-[#FAF8F5]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center space-x-3.5">
            <img
              src={persona.avatar_url}
              alt={persona.name}
              className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-medium text-white font-serif">{persona.name}'s World</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-mono">
                  ● Autonomous Life Sim
                </span>
              </div>
              <p className="text-xs text-white/50">Living autobiography & 24-hour daily schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {loading || !lifeState ? (
            <div className="flex items-center justify-center py-12 text-white/50 text-xs animate-pulse">
              Simulating companion schedule & sensory environment...
            </div>
          ) : (
            <>
              {/* Current Activity Highlight Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                    CURRENT ACTIVITY • {lifeState.simulated_time}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-white/80">
                    📍 {lifeState.location}
                  </span>
                </div>

                <h3 className="text-xl font-medium text-white font-serif mb-2">
                  {lifeState.activity_title}
                </h3>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  {lifeState.narrative_description}
                </p>

                {/* Sensory Environment */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-xs text-white/70 space-y-1 mb-4">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block">
                    SENSORY ENVIRONMENT
                  </span>
                  <p className="italic">“{lifeState.sensory_environment}”</p>
                </div>

                {/* Companion's Inner Thought */}
                <div className="pt-2 border-t border-white/10 flex items-start space-x-2 text-xs text-amber-200/90 font-serif">
                  <span>💭</span>
                  <p className="italic">{lifeState.companion_inner_thought}</p>
                </div>
              </div>

              {/* 24-Hour Autonomous Timeline */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-white/50 font-mono mb-3">
                  24-HOUR AUTONOMOUS SCHEDULE
                </h4>
                <div className="space-y-3">
                  {lifeState.timeline.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        item.is_active
                          ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                          : item.is_past
                          ? 'bg-white/5 border-white/5 text-white/40'
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono">
                          {item.start_hour}:00 — {item.end_hour}:00
                        </span>
                        {item.is_active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-mono">
                            ACTIVE NOW
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-medium">{item.title}</h5>
                      <p className="text-xs text-white/50 mt-0.5">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
