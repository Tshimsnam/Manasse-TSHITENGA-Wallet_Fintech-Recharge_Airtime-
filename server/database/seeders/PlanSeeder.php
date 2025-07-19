<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('plans')->insert([
            [
                'name' => 'Airtime $1',
                'type' => 'airtime',
                'price' => 1.00,
                'value' => 1000, // 1000 unités (ou selon ta logique)
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Airtime $2',
                'type' => 'airtime',
                'price' => 2.00,
                'value' => 2000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Data 1GB',
                'type' => 'data',
                'price' => 1.50,
                'value' => 1024,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Data 2GB',
                'type' => 'data',
                'price' => 2.50,
                'value' => 2048,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
