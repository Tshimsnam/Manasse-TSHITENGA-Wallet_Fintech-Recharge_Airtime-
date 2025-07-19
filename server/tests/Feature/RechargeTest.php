<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RechargeTest extends TestCase
{
   use RefreshDatabase;

    public function test_user_can_recharge_account()
    {
        //Crée un utilisateur avec un solde de départ
        $user = User::factory()->create([
            'balance' => 1000,
        ]);

        // Authentifier l'utilisateur
        $this->actingAs($user);

        // Envoie de la requête de recharge
        $response = $this->postJson('/api/wallet/recharge', [
            'amount' => 5000,
        ]);

        // Vérifie que la requête a réussi
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => 'Recharge réussie',
            'balance' => 6000, // 1000 + 5000
        ]);

        // Vérifie que le solde a bien été mis à jour
        $this->assertEquals(6000, $user->fresh()->balance);

        // Vérifie que la transaction a bien été enregistrée
        $this->assertDatabaseHas('transactions', [
            'user_id_from' => $user->id,
            'type' => 'recharge',
            'amount' => 5000,
            'description' => 'Recharge de compte',
        ]);
    }
}
