<?php

namespace App\Http\Controllers\API;

use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class WalletController extends Controller
{
    //recharge du compte
    public function recharge(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $user = Auth::user();

        // Crédite le solde
        $user->balance += $request->amount;
        /** @var \App\Models\User $user */
        $user->save();

        // Enregistre une transaction
        Transaction::create([
            'user_id_from' => $user->id,
            'user_id_to'   => null,
            'type'         => 'recharge',
            'amount'       => $request->amount,
            'description'  => 'Recharge de compte',
        ]);

        return response()->json([
            'message' => 'Recharge réussie',
            'balance' => $user->balance,
        ]);
    }

    //voir le solde actuel
    public function getBalance(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'balance' => $user->balance,
            'currency' => 'USD',
        ]);
    }
}
