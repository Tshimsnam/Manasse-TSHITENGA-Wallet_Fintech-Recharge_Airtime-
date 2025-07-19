<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_correct_credentials()
    {
        $user = User::factory()->create([
            'phone' => '+243999000111',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'phone' => '+243999000111',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'phone'],
            'token',
        ]);
    }

    public function test_login_fails_with_wrong_password()
    {
        $user = User::factory()->create([
            'phone' => '+243999000211',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'phone' => '+243999000111',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'message' => 'Identifiants invalides',
        ]);
    }
}
