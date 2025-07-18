<?php

namespace App\Models;

use App\Models\PlanPurchase;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'type',
        'price',
        'value'
    ];

    public function purchases()
    {
        return $this->hasMany(PlanPurchase::class);
    }
}
