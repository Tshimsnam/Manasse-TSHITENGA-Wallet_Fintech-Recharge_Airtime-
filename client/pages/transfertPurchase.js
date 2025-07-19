import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function TransferPlan() {
    const [step, setStep] = useState(1); // 1: Sélection forfait, 2: Entrée numéro
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [receiverPhone, setReceiverPhone] = useState('');
    const [message, setMessage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    // Charger les forfaits disponibles
    useEffect(() => {
        axios.get('http://localhost:8000/api/plans', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(res => {
                setPlans(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: 'error', text: 'Erreur lors du chargement des forfaits' });
                setLoading(false);
            });
    }, []);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setStep(2);
    };

    const handleTransfer = async () => {
        if (!receiverPhone || !selectedPlan) return;

        setProcessing(true);
        setMessage(null);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/wallet/transferPlan',
                {
                    receiver_phone: receiverPhone,
                    plan_id: selectedPlan.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            setMessage({
                type: 'success',
                text: response.data.message || 'Transfert effectué avec succès',
            });

            // Redirection après 3 secondes
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        } catch (error) {
            console.error(error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Erreur lors du transfert',
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head>
                <title>Transférer un forfait | Wallet Fintech</title>
            </Head>

            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => step === 1 ? router.push('/dashboard') : setStep(1)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-semibold text-gray-800">
                                {step === 1 ? 'Choisir un forfait à transférer' : 'Entrer le numéro du destinataire'}
                            </h1>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-md mx-auto">
                        {/* Message d'état */}
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Étape 1 : Sélection du forfait */}
                        {step === 1 && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                                    <h2 className="text-2xl font-bold">Forfaits disponibles</h2>
                                    <p className="opacity-90 mt-1">Sélectionnez le forfait à transférer</p>
                                </div>

                                <div className="p-6">
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {plans.map(plan => (
                                                <div
                                                    key={plan.id}
                                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan?.id === plan.id
                                                            ? 'border-purple-500 bg-purple-50'
                                                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                                        }`}
                                                    onClick={() => handleSelectPlan(plan)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800">{plan.name}</h3>
                                                            <p className="text-sm text-gray-600">{plan.type}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-purple-600">{plan.price} USD</p>
                                                            <p className="text-sm text-gray-500">
                                                                {plan.type === 'data' ? `${plan.value} MB` : `${plan.value} unités`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Étape 2 : Entrée du numéro */}
                        {step === 2 && selectedPlan && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                    <h2 className="text-2xl font-bold">Transférer le forfait</h2>
                                    <p className="opacity-90 mt-1">{selectedPlan.name} - {selectedPlan.price} USD</p>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Numéro du destinataire
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">+243</span>
                                            </div>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={receiverPhone}
                                                onChange={(e) => setReceiverPhone(e.target.value.replace(/\D/g, ''))}
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-16 py-3 border-gray-300 rounded-md text-black placeholder-gray-400"
                                                maxLength="15"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <h3 className="font-medium text-blue-800 mb-2">Récapitulatif</h3>
                                        <div className="flex justify-between text-sm text-gray-700">
                                            <span>Forfait:</span>
                                            <span className="font-medium">{selectedPlan.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-700">
                                            <span>Type:</span>
                                            <span className="font-medium">
                                                {selectedPlan.type === 'data' ? 'Data' : 'Airtime'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-700">
                                            <span>Valeur:</span>
                                            <span className="font-medium">
                                                {selectedPlan.type === 'data'
                                                    ? `${selectedPlan.value} MB`
                                                    : `${selectedPlan.value} unités`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-700">
                                            <span>Prix:</span>
                                            <span className="font-medium text-blue-600">{selectedPlan.price} USD</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleTransfer}
                                        disabled={processing || !receiverPhone || receiverPhone.length < 9 || receiverPhone.length > 15}
                                        className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md shadow-sm ${processing || !receiverPhone || receiverPhone.length < 9 || receiverPhone.length > 15
                                                ? 'opacity-70 cursor-not-allowed'
                                                : 'hover:from-blue-700 hover:to-indigo-700'
                                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all`}
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Traitement...
                                            </>
                                        ) : (
                                            'Confirmer le transfert'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}