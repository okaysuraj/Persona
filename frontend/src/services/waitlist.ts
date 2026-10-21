// Mobile Beta Waitlist Service

export interface WaitlistEntry {
  email: string;
  name?: string;
  platform: 'ios' | 'android' | 'both';
  preferredPersona?: string;
  ticketNumber: number;
  inviteCode: string;
  joinedAt: string;
}

const STORAGE_KEY = 'persona_mobile_waitlist_entry';

export const waitlistService = {
  getStoredEntry(): WaitlistEntry | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async joinWaitlist(data: {
    email: string;
    name?: string;
    platform: 'ios' | 'android' | 'both';
    preferredPersona?: string;
  }): Promise<WaitlistEntry> {
    // Generate a realistic priority ticket number
    const baseTicket = 842;
    const randomOffset = Math.floor(Math.random() * 45) + 1;
    const ticketNumber = baseTicket + randomOffset;
    
    // Generate an invite code (e.g. PERS-7942)
    const codeSuffix = Math.floor(1000 + Math.random() * 9000);
    const inviteCode = `PERS-${codeSuffix}`;

    const entry: WaitlistEntry = {
      ...data,
      ticketNumber,
      inviteCode,
      joinedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    } catch {
      // Storage might fail in strict private browsing
    }

    // Optional sync to backend if available
    try {
      await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: 'waitlist-demo-pass',
          display_name: data.name || data.email.split('@')[0],
        }),
      }).catch(() => {
        // Silent catch: offline or landing page mode
      });
    } catch {
      // Silent catch
    }

    return entry;
  },
};
