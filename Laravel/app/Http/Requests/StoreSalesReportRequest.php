<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'year' => 'nullable|string|max:10',
            'month_year' => 'required|string|max:50',
            'gross_revenue' => 'required|numeric|min:0',
            'net_profit' => 'required|numeric|min:0',
            'total_orders' => 'required|integer|min:0',
            'event_tag' => 'nullable|string|max:150',
            'is_bazar' => 'nullable|boolean',
        ];
    }
}
