<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $primaryKey = 'review_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'review_id',
        'author_name',
        'author_email',
        'author_badge',
        'avatar',
        'rating',
        'date',
        'product_name',
        'product_image',
        'comment',
        'likes_count',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
        'likes_count' => 'integer',
    ];
}
