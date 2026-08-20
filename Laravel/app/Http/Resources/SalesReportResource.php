<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'year' => $this->year,
            'month_year' => $this->month_year,
            'gross_revenue' => (float) $this->gross_revenue,
            'net_profit' => (float) $this->net_profit,
            'total_orders' => (int) $this->total_orders,
            'aov' => $this->getAverageOrderValue(),
            'event_tag' => $this->event_tag,
            'is_bazar' => (bool) $this->is_bazar,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
