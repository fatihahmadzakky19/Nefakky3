/**
 * ============================================================================
 * UTILITY: soundNotification.ts (src/lib/soundNotification.ts)
 * DESKRIPSI: Sintesis audio Web Audio API murni untuk notifikasi realtime
 *            (balasan CS Live Chat, pesanan baru, status pengiriman).
 *            100% mandiri tanpa file audio eksternal, anti-404, dan instan.
 * ============================================================================
 */

/**
 * Memainkan nada notifikasi balasan Customer Support (CS) yang elegan & ramah.
 * Pola nada: 3 nada harmonik menaik (F5 -> A5 -> C6 / F Major Arpeggio).
 */
export function playChatNotificationSound(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Jika audio context dalam kondisi suspended (kebijakan browser autoplay), resume
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Nada 1: F5 (698.46 Hz) - Nada pembuka lembut
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Nada 2: A5 (880.00 Hz) - Nada tengah harmonik
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.001, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.48);

    // Nada 3: C6 (1046.50 Hz) - Nada puncak manis & jernih
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1046.5, now + 0.24);
    gain3.gain.setValueAtTime(0.001, now + 0.24);
    gain3.gain.exponentialRampToValueAtTime(0.25, now + 0.28);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.24);
    osc3.stop(now + 0.65);

    // Bersihkan context setelah suara selesai
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
  } catch (err) {
    // Abaikan jika browser memblokir audio otomatis tanpa interaksi awal
  }
}

/**
 * Menampilkan notifikasi sistem desktop (Web Notification API) jika diizinkan browser.
 */
export function showSystemNotification(title: string, body: string, onClick?: () => void): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  try {
    if (Notification.permission === 'granted') {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'nefakky_chat_reply'
      });
      if (onClick) {
        notif.onclick = () => {
          window.focus();
          onClick();
          notif.close();
        };
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          const notif = new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'nefakky_chat_reply'
          });
          if (onClick) {
            notif.onclick = () => {
              window.focus();
              onClick();
              notif.close();
            };
          }
        }
      });
    }
  } catch (err) {
    // Abaikan error pada browser yang membatasi API
  }
}
