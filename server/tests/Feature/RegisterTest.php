<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_successfully()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+243999888111',
            'password' => 'secret123',
        ]);

        $response->assertStatus(201);

        $response->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'phone', 'created_at', 'updated_at'],
            'token',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'phone' => '+243999888111',
        ]);
    }
}
