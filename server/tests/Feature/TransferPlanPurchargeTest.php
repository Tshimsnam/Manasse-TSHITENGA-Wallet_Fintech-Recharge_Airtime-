<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TransferPlanPurchargeTest extends TestCase
{
     use RefreshDatabase;

    public function test_user_can_transfer_plan_to_another_user()
    {
        // Créer deux utilisateurs
        $sender = User::factory()->create(['balance' => 10000]);
        $receiver = User::factory()->create([
            'phone' => '+243999777888',
            'airtime_balance' => 0,
        ]);

        // Créer un plan airtime
        $plan = Plan::create([
            'name' => 'Forfait Airtime 2000',
            'price' => 3000,
            'value' => 2000,
            'type' => 'airtime',
        ]);

        // Authentifier le sender
        $this->actingAs($sender);

        // Envoyer la requête
        $response = $this->postJson('/api/wallet/transferPlan', [
            'receiver_phone' => $receiver->phone,
            'plan_id' => $plan->id,
        ]);

        // Vérifier la réponse
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => 'Vous avez transféré le forfait "' . $plan->name . '" à "' . $receiver->name . '" votre solde actuel est de"' . ($sender->balance - $plan->price) . '"',
        ]);

        // Vérifier les soldes
        $this->assertEquals(7000, $sender->fresh()->balance); // 10000 - 3000
        $this->assertEquals(2000, $receiver->fresh()->airtime_balance);

        // Vérifier la transaction
        $this->assertDatabaseHas('transactions', [
            'user_id_from' => $sender->id,
            'user_id_to' => $receiver->id,
            'type' => 'transfer_plan',
            'amount' => $plan->price,
        ]);

        // Vérifier PlanPurchase
        $this->assertDatabaseHas('plan_purchases', [
            'user_id' => $receiver->id,
            'plan_id' => $plan->id,
        ]);
    }
}
