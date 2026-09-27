import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  userEmail: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  readByAdmin?: boolean;
  readByUser?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    sender: 'user',
    userEmail: 'nizarazzuhra@gmail.com',
    userName: 'Nizar Azzuhra',
    userAvatar: 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=5C3D28&color=ffffff',
    text: 'Halo Min, saya mau tanya apakah pesanan Ayam Bakar saya bisa request tanpa sambal pedas?',
    timestamp: '10:15 AM',
    readByAdmin: true,
    readByUser: true
  },
  {
    id: 'chat-2',
    sender: 'admin',
    userEmail: 'nizarazzuhra@gmail.com',
    userName: 'Admin CS Nefakky',
    text: 'Halo Kak Nizar! Tentu saja bisa. Catatan tim dapur kami sudah diperbarui untuk pesanan Anda.',
    timestamp: '10:18 AM',
    readByAdmin: true,
    readByUser: true
  }
];

const CHAT_STORE_FILE = path.join(process.cwd(), '.chat_store.json');

// Memory cache
let inMemoryChat: ChatMessage[] | null = null;

function loadChatStore(): ChatMessage[] {
  if (inMemoryChat !== null) return inMemoryChat;

  try {
    if (fs.existsSync(CHAT_STORE_FILE)) {
      const content = fs.readFileSync(CHAT_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryChat = parsed;
        return inMemoryChat;
      }
    }
  } catch (err) {
    console.warn('[API /api/chat] Gagal membaca chat_store.json:', err);
  }

  inMemoryChat = [...DEFAULT_CHAT_MESSAGES];
  saveChatStore(inMemoryChat);
  return inMemoryChat;
}

function saveChatStore(messages: ChatMessage[]) {
  inMemoryChat = messages;
  try {
    fs.writeFileSync(CHAT_STORE_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[API /api/chat] Gagal menyimpan chat_store.json:', err);
  }
}

export async function GET() {
  const messages = loadChatStore();
  return NextResponse.json({ success: true, messages }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, message, messages, userEmail, role } = body || {};
    let current = loadChatStore();

    if (action === 'send' && message) {
      const emailNorm = (message.userEmail || '').trim().toLowerCase();
      const newMsg: ChatMessage = {
        ...message,
        userEmail: emailNorm
      };

      if (!current.some(m => m.id === newMsg.id)) {
        current = [...current, newMsg];
        saveChatStore(current);
      }
      return NextResponse.json({ success: true, messages: current });
    }

    if (action === 'reply' && message) {
      const emailNorm = (userEmail || message.userEmail || '').trim().toLowerCase();
      const updated = current.map(m => {
        if (m.userEmail.toLowerCase() === emailNorm && m.sender === 'user' && !m.readByAdmin) {
          return { ...m, readByAdmin: true };
        }
        return m;
      });

      if (!updated.some(m => m.id === message.id)) {
        updated.push({
          ...message,
          userEmail: emailNorm
        });
      }

      current = updated;
      saveChatStore(current);
      return NextResponse.json({ success: true, messages: current });
    }

    if (action === 'markRead' && userEmail) {
      const emailNorm = userEmail.trim().toLowerCase();
      const updated = current.map(m => {
        if (m.userEmail.toLowerCase() === emailNorm) {
          if (role === 'admin' && !m.readByAdmin) {
            return { ...m, readByAdmin: true };
          } else if (role === 'user' && !m.readByUser) {
            return { ...m, readByUser: true };
          }
        }
        return m;
      });
      current = updated;
      saveChatStore(current);
      return NextResponse.json({ success: true, messages: current });
    }

    if (action === 'sync' && Array.isArray(messages)) {
      const existingIds = new Set(current.map(m => m.id));
      let changed = false;
      const merged = [...current];

      messages.forEach((m: ChatMessage) => {
        if (m && m.id && !existingIds.has(m.id)) {
          merged.push(m);
          existingIds.add(m.id);
          changed = true;
        }
      });

      if (changed) {
        current = merged;
        saveChatStore(current);
      }
      return NextResponse.json({ success: true, messages: current });
    }

    return NextResponse.json({ success: true, messages: current });
  } catch (err: any) {
    console.error('[API /api/chat] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
