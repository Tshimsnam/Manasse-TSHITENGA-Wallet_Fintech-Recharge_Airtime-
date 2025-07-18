<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
 * @OA\Post(
 *     path="/api/register",
 *     summary="Inscription d'un nouvel utilisateur",
 *     description="Crée un nouvel utilisateur et retourne un token d'authentification.",
 *     tags={"Authentification"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"name", "email", "phone", "password"},
 *             @OA\Property(property="name", type="string", example="Manassé Tshitenga"),
 *             @OA\Property(property="email", type="string", format="email", example="manasse@gmail.com"),
 *             @OA\Property(property="phone", type="string", example="+243900000001"),
 *             @OA\Property(property="password", type="string", format="password", example="secret123")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Utilisateur inscrit avec succès",
 *         @OA\JsonContent(
 *             @OA\Property(property="user", type="object"),
 *             @OA\Property(property="token", type="string", example="6|XXXXXXXXXXXXXXXXXXXX")
 *         )
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Erreur de validation (email ou téléphone déjà utilisé)"
 *     )
 * )
 */
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

    /**
 * @OA\Post(
 *     path="/api/login",
 *     summary="Connexion de l'utilisateur",
 *     description="Permet à un utilisateur de se connecter en utilisant son téléphone et son mot de passe.",
 *     tags={"Authentification"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"phone", "password"},
 *             @OA\Property(property="phone", type="string", example="+243900000001"),
 *             @OA\Property(property="password", type="string", format="password", example="secret123")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Connexion réussie",
 *         @OA\JsonContent(
 *             @OA\Property(property="user", type="object"),
 *             @OA\Property(property="token", type="string", example="6|XXXXXXXXXXXXXXXXXXXX")
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Identifiants invalides"
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Erreur de validation"
 *     )
 * )
 */
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

    /**
 * @OA\Post(
 *     path="/api/logout",
 *     summary="Déconnexion de l'utilisateur",
 *     description="Supprime le token d'accès courant de l'utilisateur connecté.",
 *     tags={"Authentification"},
 *     security={{"sanctum":{}}},
 *     @OA\Response(
 *         response=200,
 *         description="Déconnecté avec succès",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="Déconnecté avec succès")
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Non authentifié (token manquant ou invalide)"
 *     )
 * )
 */
    //deconnexion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message'=>'Déconnecté avec succès']);
    }

}
