<?php

namespace App\Http\Controllers\API;

use App\Models\Plan;
use App\Models\User;
use App\Models\Transaction;
use App\Models\PlanPurchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Info(
 *     title="API Fintech Wallet",
 *     version="1.0.0",
 *     description="Documentation de l'API Fintech (Recharge, Transfert, Forfaits airtime/Data)"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */

class WalletController extends Controller
{
    //recuperer le plan des purchases(achat credit)
    public function index()
    {
        return response()->json(Plan::all());
    }
    //obtenir le user connecté
    public function getAuthUser()
    {
        return User::findOrFail(Auth::user()->id);
    }
    /**
     * @OA\Post(
     *     path="/api/wallet/recharge",
     *     summary="Recharger le solde de l'utilisateur connecté",
     *     description="Permet à l'utilisateur de recharger son compte avec un montant donné.",
     *     tags={"Wallet"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"amount"},
     *             @OA\Property(property="amount", type="number", format="float", example=10.00)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Recharge réussie",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Recharge réussie"),
     *             @OA\Property(property="balance", type="number", format="float", example=25.00)
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation échouée (champ manquant ou invalide)"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié (token manquant ou invalide)"
     *     )
     * )
     */
    //recharge du compte argent
    public function recharge(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);
        $user = $this->getAuthUser();
        // Crédite le solde
        $user->balance += $request->amount;
        /** @var \App\Models\User $user */
        $user->save();

        // Enregistre une transaction
        Transaction::create([
            'user_id_from' => $user->id,
            'user_id_to' => null,
            'type' => 'recharge',
            'amount' => $request->amount,
            'description' => 'Recharge de compte',
        ]);

        return response()->json([
            'message' => 'Recharge réussie',
            'balance' => $user->balance,
        ]);
    }

    //voir le solde actuel
    /**
     * @OA\Get(
     *     path="/api/wallet/balance",
     *     summary="Consulter le solde de l'utilisateur connecté",
     *     description="Retourne le solde actuel du portefeuille de l'utilisateur ainsi que la devise.",
     *     tags={"Wallet"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Solde récupéré avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="balance", type="number", format="float", example=45.75),
     *             @OA\Property(property="currency", type="string", example="USD")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié (token manquant ou invalide)"
     *     )
     * )
     */
    public function getBalance(Request $request)
    {
        $user = $this->getAuthUser();

        return response()->json([
            'balance' => $user->balance,
            'currency' => 'USD',
        ]);
    }

    //transfer d'argent
    /**
     * @OA\Post(
     *     path="/api/transfer",
     *     summary="Transférer de l'argent à un autre utilisateur",
     *     description="Permet à un utilisateur connecté de transférer de l'argent à un autre utilisateur via son numéro de téléphone.",
     *     tags={"Wallet"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"receiver_phone", "amount"},
     *             @OA\Property(property="receiver_phone", type="string", example="+243900000001"),
     *             @OA\Property(property="amount", type="number", format="float", example=10.00)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transfert effectué avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="vous venez d'effectué un Transfert de 10 au numéro +243900000001.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation ou solde insuffisant",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="votre Solde est insuffisant.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié (token manquant ou invalide)"
     *     )
     * )
     */
    public function transfer(Request $request)
    {
        $request->validate([
            'receiver_phone' => 'required|string|exists:users,phone',
            'amount' => 'required|numeric|min:1|max:10000', // Ajout d'un montant maximum
        ]);

        $sender = $request->user();
        $receiver = User::where('phone', $request->receiver_phone)->first();

        // Vérifications supplémentaires
        if ($sender->id === $receiver->id) {
            return response()->json([
                'success' => false,
                'error' => 'Auto-transfert impossible',
                'message' => 'Vous ne pouvez pas vous transférer de l\'argent à vous-même.'
            ], 422);
        }

        if ($sender->balance < $request->amount) {
            return response()->json([
                'success' => false,
                'error' => 'Solde insuffisant',
                'message' => 'Votre solde actuel (' . $sender->balance . ' USD) est insuffisant pour ce transfert.',
                'current_balance' => $sender->balance
            ], 422);
        }

        // Transaction sécurisée
        DB::transaction(function () use ($sender, $receiver, $request) {
            // Mettre à jour les soldes
            $sender->decrement('balance', $request->amount);
            $receiver->increment('balance', $request->amount);

            // Enregistrer la transaction
            Transaction::create([
                'user_id_from' => $sender->id,
                'user_id_to' => $receiver->id,
                'type' => 'transfer',
                'amount' => $request->amount,
                'description' => 'Transfert vers ' . $receiver->phone,
                'status' => 'completed'
            ]);
        });

        // Récupérer les données fraîches
        $updatedSender = $sender->fresh();

        return response()->json([
            'success' => true,
            'message' => 'Transfert effectué avec succès',
            'details' => [
                'amount' => $request->amount,
                'currency' => 'USD',
                'recipient' => $receiver->phone,
                'recipient_name' => $receiver->name,
                'new_balance' => $updatedSender->balance,
                'transaction_time' => now()->toDateTimeString()
            ],
            'user' => $updatedSender->only(['id', 'name', 'phone', 'balance'])
        ]);
    }

    //recupérer l'historique de transaction du l'user connecté
    /**
     * @OA\Get(
     *     path="/api/transactions",
     *     summary="Lister les transactions de l'utilisateur connecté",
     *     description="Retourne toutes les transactions effectuées ou reçues par l'utilisateur connecté, triées par date décroissante.",
     *     tags={"Wallet"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des transactions",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="type", type="string", example="transfer"),
     *                 @OA\Property(property="amount", type="number", format="float", example=10.50),
     *                 @OA\Property(property="description", type="string", example="Transfert vers +243900000001"),
     *                 @OA\Property(property="date", type="string", example="2025-07-18 14:00"),
     *                 @OA\Property(property="direction", type="string", example="sent"),
     *                 @OA\Property(property="target_phone", type="string", example="+243900000002")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié (token manquant ou invalide)"
     *     )
     * )
     */
    public function getTransactions(Request $request)
    {
        $user = $this->getAuthUser();
        // $user= User::find(1);
        // recuperons toutes les transaction concernant l'utilisateur connecté
        $user = $this->getAuthUser();
        $transactions = Transaction::where('user_id_from', $user->id)
            ->orWhere('user_id_to', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($transaction) use ($user) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'amount' => $transaction->amount,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at->toISOString(), // Renvoie la date au format ISO
                    'direction' => $transaction->user_id_from === $user->id ? 'sent' : 'received',
                    'target_phone' => $transaction->user_id_from === $user->id
                        ? optional($transaction->receiver)->phone
                        : optional($transaction->sender)->phone,
                ];
            });

        return response()->json($transactions);
    }
    //fonction pour plan des forfait et achat
    /**
     * @OA\Post(
     *     path="/api/wallet/purchase",
     *     summary="Souscrire à un forfait",
     *     description="Permet à un utilisateur connecté d'acheter un plan (forfait airtime ou data) s'il a un solde suffisant.",
     *     tags={"Wallet"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"plan_id"},
     *             @OA\Property(property="plan_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Achat du forfait réussi",
     *         @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="vous venez de souscrire au forfaits 1G")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Solde insuffisant"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation échouée (plan_id manquant ou invalide)"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié (token manquant ou invalide)"
     *     )
     * )
     */
    public function purchasePlan(Request $request)
    {
        $user = $this->getAuthUser();

        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $plan = Plan::findOrFail($request->plan_id);

        if ($user->balance < $plan->price) {
            return response()->json(['message' => 'votre Solde est insuffisant'], 400);
        }

        DB::transaction(function () use ($user, $plan) {
            // Déduire le montant du solde principal
            $user->balance -= $plan->price;

            // Crédite le bon type de solde
            if ($plan->type === 'airtime') {
                $user->update(
                    [
                        "airtime_balance" => $plan->value
                    ]
                );
            } elseif ($plan->type === 'data') {
                $user->update(
                    [
                        "data_balance" => $plan->value
                    ]
                );
            }

            $user->save();

            // Enregistrer l'achat du plan et l'id de l'utilisateur
            PlanPurchase::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
            ]);

            // Enregistrer la transaction
            Transaction::create([
                'user_id_from' => $user->id,
                'user_id_to' => null,
                'type' => 'purchase',
                'amount' => $plan->price,
                'description' => 'Achat de forfait : ' . $plan->name,
            ]);
        });

        return response()->json(['message' => 'Vous venez de souscrire au forfait "' . $plan->name . '" avec succès.']);
    }

    //méthode pour transfer des forfaits data/airtime
    /**
     * @OA\Post(
     *     path="/api/wallet/transferPlan",
     *     summary="Transférer un forfait à un autre utilisateur",
     *     description="Permet à un utilisateur connecté de transférer un forfait (airtime ou data) à un autre utilisateur en utilisant son solde principal.",
     *     tags={"Wallet"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"receiver_phone", "plan_id"},
     *             @OA\Property(property="receiver_phone", type="string", example="+243900000001"),
     *             @OA\Property(property="plan_id", type="integer", example=2)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transfert de forfait réussi",
     *         @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Forfait transféré avec succès à manassé")

     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Solde insuffisant ou tentative de transfert à soi-même"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation échouée (plan_id ou receiver_phone manquant ou invalide)"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié (token manquant ou invalide)"
     *     )
     * )
     * )
     */
    public function transferPlanPurcharge(Request $request)
    {
        $request->validate([
            'receiver_phone' => 'required|string|exists:users,phone',
            'plan_id' => 'required|exists:plans,id',
        ]);

        $sender = $this->getAuthUser();
        $receiver = User::where('phone', $request->receiver_phone)->first();
        $plan = Plan::findOrFail($request->plan_id);

        if ($sender->id === $receiver->id) {
            return response()->json(['message' => 'Impossible de vous transférer un forfait à vous-même.'], 400);
        }

        if ($sender->balance < $plan->price) {
            return response()->json(['message' => 'votre Solde est insuffisant pour ce transfert.'], 400);
        }

        DB::transaction(function () use ($sender, $receiver, $plan) {
            // Débit du solde de l'expéditeur
            $sender->balance -= $plan->price;
            $sender->save();

            // Crédit du forfait au destinataire
            if ($plan->type === 'airtime') {
                $receiver->airtime_balance += $plan->value;
            } elseif ($plan->type === 'data') {
                $receiver->data_balance += $plan->value;
            }
            $receiver->save();

            // Historique achat/transfert
            PlanPurchase::create([
                'user_id' => $receiver->id,
                'plan_id' => $plan->id,
            ]);
            // Transaction effectué pour achat forfait
            Transaction::create([
                'user_id_from' => $sender->id,
                'user_id_to' => $receiver->id,
                'type' => 'transfer_plan',
                'amount' => $plan->price,
                'description' => 'Transfert du forfait "' . $plan->name . '" à ' . $receiver->name . ' (' . $receiver->phone . ')',
            ]);
        });

        return response()->json([
            'message' => 'Vous avez transféré le forfait "' . $plan->name . '" à "' . $receiver->name . '" votre solde actuel est de"' . $sender->balance . '"',
        ]);
    }

}
