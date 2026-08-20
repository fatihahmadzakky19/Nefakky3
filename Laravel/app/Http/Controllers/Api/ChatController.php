<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreChatRequest;
use App\Http\Resources\ChatMessageResource;
use App\Models\ChatMessage;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller ChatController
 * Mengelola Percakapan Customer Support / Live Chat Bantuan Pelanggan.
 */
class ChatController extends Controller
{
    use ApiResponseTrait;

    /**
     * Menampilkan riwayat percakapan (Bisa difilter berdasarkan email pelanggan)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ChatMessage::query();

        if ($request->filled('user_email')) {
            $query->where('user_email', $request->user_email);
        }

        $messages = $query->orderBy('created_at', 'asc')->get();

        return $this->successResponse(ChatMessageResource::collection($messages), 'Riwayat percakapan berhasil diambil');
    }

    /**
     * Mengirimkan pesan chat baru
     */
    public function store(StoreChatRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['chat_id'])) {
            $data['chat_id'] = 'chat-' . time() . '-' . rand(100, 999);
        }

        if (empty($data['timestamp'])) {
            $data['timestamp'] = now()->format('H:i A');
        }

        if ($data['sender'] === 'user') {
            $data['read_by_user'] = true;
            $data['read_by_admin'] = false;
        } else {
            $data['read_by_admin'] = true;
            $data['read_by_user'] = false;
        }

        $message = ChatMessage::create($data);

        return $this->createdResponse(new ChatMessageResource($message), 'Pesan berhasil dikirimkan');
    }

    /**
     * Menandai pesan sebagai telah dibaca
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $request->validate([
            'user_email' => 'required|email',
            'reader' => 'required|in:user,admin',
        ]);

        $query = ChatMessage::where('user_email', $request->user_email);

        if ($request->reader === 'admin') {
            $query->where('read_by_admin', false)->update(['read_by_admin' => true]);
        } else {
            $query->where('read_by_user', false)->update(['read_by_user' => true]);
        }

        return $this->successResponse(null, 'Pesan telah ditandai terbaca');
    }
}
