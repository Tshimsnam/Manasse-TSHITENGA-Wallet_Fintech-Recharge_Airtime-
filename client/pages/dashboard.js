// pages/dashboard.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch user data
        axios.get('http://localhost:8000/api/user', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                setUser(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                localStorage.removeItem('token');
                router.push('/login');
            });

        // Fetch transactions
        axios.get('http://localhost:8000/api/transactions', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                setTransactions(res.data);
                setTransactionsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching transactions:', err);
                setTransactionsLoading(false);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Chargement de votre espace...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Tableau de Bord | Wallet Fintech</title>
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <h1 className="text-xl font-semibold text-gray-800">Wallet Fintech</h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <span>Déconnexion</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg mb-8">
                        <h2 className="text-2xl font-bold mb-2">Bonjour, {user.name}</h2>
                        <p className="opacity-90">Bienvenue sur votre espace personnel Wallet Fintech</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="border-b border-gray-200 mb-8">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Aperçu
                            </button>
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'transactions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Transactions
                            </button>
                        </nav>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Balance Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 transform hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Solde principal</p>
                                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                                {user.balance.toLocaleString()} USD
                                            </p>
                                        </div>
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 transform hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Solde Airtime</p>
                                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                                {user.airtime_balance} unités
                                            </p>
                                        </div>
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 transform hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Solde Data</p>
                                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                                {user.data_balance} MB
                                            </p>
                                        </div>
                                        <div className="bg-purple-100 p-3 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => router.push('/recharge')}
                                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center hover:shadow-md transition-shadow"
                                    >
                                        <div className="bg-blue-100 p-3 rounded-full mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Recharger son compte</span>
                                    </button>

                                    <button
                                        onClick={() => router.push('/transfert')}
                                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center hover:shadow-md transition-shadow"
                                    >
                                        <div className="bg-green-100 p-3 rounded-full mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Transférer de l'argent</span>
                                    </button>

                                    <button
                                        onClick={() => router.push('/purchase')}
                                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center hover:shadow-md transition-shadow"
                                    >
                                        <div className="bg-purple-100 p-3 rounded-full mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Acheter Forfait Airtime ou Data</span>
                                    </button>

                                    <button
                                        onClick={() => router.push('/transfertPurchase')}
                                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center hover:shadow-md transition-shadow"
                                    >
                                        <div className="bg-yellow-100 p-3 rounded-full mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Transférer forfait</span>
                                    </button>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Dernières transactions</h3>
                                </div>
                                {transactionsLoading ? (
                                    <div className="p-6 flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                ) : transactions.length > 0 ? (
                                    <>
                                        <div className="divide-y divide-gray-200">
                                            {transactions.slice(0, 5).map((tx) => (
                                                <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`p-2 rounded-full ${tx.type === 'debit' ? 'bg-red-100' : 'bg-green-100'}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${tx.type === 'debit' ? 'text-red-500' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{tx.description}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(tx.created_at).toLocaleString('fr-FR', {
                                                                    day: 'numeric',
                                                                    month: 'numeric',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`font-medium ${tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                                                            {tx.type === 'debit' ? '-' : '+'}
                                                            {parseFloat(tx.amount).toFixed(2)} USD
                                                        </p>
                                                        {tx.recipient_phone && (
                                                            <p className="text-sm text-gray-500">
                                                                {tx.type === 'debit' ? 'Vers' : 'De'} {tx.recipient_phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-6 py-4 bg-gray-50 text-center">
                                            <button
                                                onClick={() => setActiveTab('transactions')}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Voir toutes les transactions
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-6 text-center text-gray-500">
                                        Aucune transaction récente
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Historique des transactions</h3>
                                <div className="flex space-x-2">
                                    <select className="border-gray-300 rounded-md text-sm">
                                        <option>Toutes</option>
                                        <option>Recharges</option>
                                        <option>Transferts</option>
                                        <option>Achats</option>
                                    </select>
                                    <select className="border-gray-300 rounded-md text-sm">
                                        <option>30 derniers jours</option>
                                        <option>7 derniers jours</option>
                                        <option>Ce mois</option>
                                        <option>Personnalisé</option>
                                    </select>
                                </div>
                            </div>
                            {transactionsLoading ? (
                                <div className="p-6 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : transactions.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {transactions.map((tx) => (
                                        <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-2 rounded-full ${tx.type === 'debit' ? 'bg-red-100' : 'bg-green-100'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${tx.type === 'debit' ? 'text-red-500' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{tx.description}</p>
                                                    <p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-medium ${tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {tx.type === 'debit' ? '-' : '+'}
                                                    {parseFloat(tx.amount).toFixed(2)} USD
                                                </p>
                                                {tx.recipient_phone && (
                                                    <p className="text-sm text-gray-500">
                                                        {tx.type === 'debit' ? 'Vers' : 'De'} {tx.recipient_phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    Aucune transaction trouvée
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}