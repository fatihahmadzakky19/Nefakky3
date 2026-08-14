<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'product_id',
        'customer_name',
        'customer_email',
        'rating',
        'comment',
        'image_url',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];
}
