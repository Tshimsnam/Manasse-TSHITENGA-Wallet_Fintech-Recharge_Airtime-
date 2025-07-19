import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Transfer() {
  const [receiverPhone, setReceiverPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTransfer = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_phone: receiverPhone,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Transfert effectué avec succès',
          details: `${amount} USD envoyés à ${receiverPhone}`
        });
        setAmount('');
        setReceiverPhone('');
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Erreur lors du transfert',
          details: data.details || 'Veuillez vérifier les informations'
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({ 
        type: 'error', 
        text: 'Une erreur est survenue',
        details: 'Service temporairement indisponible'
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Transfert d'argent | Wallet Fintech</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header cohérent avec le dashboard */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Transfert d'argent</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto">
            {/* Card Container */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Envoyer de l'argent</h2>
                <p className="opacity-90 mt-1">Transférez des fonds à un autre utilisateur</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Message d'état */}
                {message && (
                  <div className={`mb-6 p-4 rounded-lg border ${
                    message.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 ${
                        message.type === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          {message.type === 'success' ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium">{message.text}</h3>
                        {message.details && (
                          <div className="mt-2 text-sm">{message.details}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulaire de transfert */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Montant (USD)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-3 border-gray-300 rounded-md text-black placeholder-gray-400"
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <span className="text-gray-500 px-3">USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex space-x-2">
                      {[5, 10, 20, 50].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setAmount(value.toString())}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            amount === value.toString()
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          ${value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleTransfer}
                      disabled={loading || !receiverPhone || !amount || receiverPhone.length < 9 || parseFloat(amount) <= 0}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading || !receiverPhone || !amount || receiverPhone.length < 9 || parseFloat(amount) <= 0
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Transfert en cours...
                        </>
                      ) : (
                        'Effectuer le transfert'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="text-center text-sm text-gray-500">
                  <p>Les transferts sont instantanés et sécurisés</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}