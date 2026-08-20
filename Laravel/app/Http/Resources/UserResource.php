<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uid' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'avatar' => $this->avatar,
            'addresses' => $this->whenLoaded('addresses', function () {
                return $this->addresses->map(function ($addr) {
                    return [
                        'id' => (string) $addr->id,
                        'label' => $addr->label,
                        'receiverName' => $addr->receiver_name,
                        'receiverPhone' => $addr->receiver_phone,
                        'address' => $addr->address,
                        'isDefault' => (bool) $addr->is_default,
                    ];
                });
            }),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
