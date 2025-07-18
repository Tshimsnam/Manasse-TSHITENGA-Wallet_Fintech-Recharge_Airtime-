<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    //fonction pour l'enregistrement de l'utilisateur
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'=>$request->name,
            'email'=>$request->email,
            'phone'=>$request->phone,
            'password'=>Hash::make($request->password),
        ]);
        //génerer le token
        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'user' =>$user,
            'token'=>$token,
        ],201);
    }

    //fonction login pour se connecté

    public function login(Request $request)
    {
        $request->validate([
            'phone'=>'required|string',
            'password'=>'required|string',
        ]);

        $user = User::where('phone', $request->phone)->first();

        if(! $user || ! Hash::check($request->password, $user->password)){
            return response()->json(['message'=>'Identifiants invalides'], 401);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    //deconnexion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message'=>'Déconnecté avec succès']);
    }

}
