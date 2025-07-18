<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
      protected $fillable = [
        'user_id_from',
        'user_id_to',
        'type',
        'amount',
        'description',
    ];
}
