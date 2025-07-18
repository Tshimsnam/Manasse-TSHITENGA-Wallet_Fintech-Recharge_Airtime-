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

    public function sender()
    {
        return $this->belongsTo(User::class, 'user_id_from');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'user_id_to');
    }
}
