<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\WalletController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/wallet/balance', [WalletController::class, 'getBalance']);
    Route::post('/wallet/recharge', [WalletController::class, 'recharge']);
    Route::post('/transfer', [WalletController::class, 'transfer']);
    Route::get('/transactions', [WalletController::class, 'getTransactions']);
    Route::post('/wallet/purchase', [WalletController::class, 'purchasePlan']);
    Route::post('/wallet/transferPlan', [WalletController::class, 'transferPlanPurcharge']);
});
