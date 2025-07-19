<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TransferTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    use RefreshDatabase;

    public function test_user_can_transfer_money()
    {
        // on Cree deux utilisateurs
        $sender = User::factory()->create(['balance' => 10000]);
        $receiver = User::factory()->create(['balance' => 2000, 'phone' => '+243999888777']);

        //Authentifier le sender
        $this->actingAs($sender);

        // Envoyer une requête POST
        $response = $this->postJson('/api/transfer', [
            'receiver_phone' => $receiver->phone,
            'amount' => 3000,
        ]);

        //Assertions
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'success' => true,
            'message' => 'Transfert effectué avec succès',
            'currency' => 'USD',
            'recipient' => '+243999888777',
            'new_balance' => '7000.00',
        ]);
        //Vérifier que les balances ont été mises à jour
        $this->assertEquals(7000, $sender->fresh()->balance);
        $this->assertEquals(5000, $receiver->fresh()->balance);

        //Vérifier que la transaction a été créée
        $this->assertDatabaseHas('transactions', [
            'user_id_from' => $sender->id,
            'user_id_to' => $receiver->id,
            'type' => 'transfer',
            'amount' => 3000,
        ]);
    }
}
