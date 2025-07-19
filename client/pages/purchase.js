import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

const PurchasePage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/plans', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPlans(response.data);
      } catch (err) {
        console.error('Erreur chargement plans:', err);
        setError('Impossible de charger les forfaits. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePurchase = async (planId) => {
    setPurchasing(planId);
    try {
      await axios.post('http://localhost:8000/api/wallet/purchase', {
        plan_id: planId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      router.push({
        pathname: '/dashboard',
        query: { purchaseSuccess: 'true' }
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de l\'achat');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <>
      <Head>
        <title>Achat de forfaits | Wallet Fintech</title>
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
                <h1 className="text-xl font-semibold text-gray-800">Achat de forfaits</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Card Container */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Choisissez votre forfait</h2>
                <p className="opacity-90 mt-1">Sélectionnez le forfait data ou airtime qui vous convient</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-red-400">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className={`p-4 ${
                          plan.type === 'data' ? 'bg-blue-50' : 'bg-purple-50'
                        }`}>
                          <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
                          <p className="text-sm text-gray-600">{plan.type}</p>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-500">Valeur</span>
                            <span className="text-lg font-bold text-gray-800">
                              {plan.type === 'data' ? `${plan.value} MB` : `${plan.value} unités`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium text-gray-500">Prix</span>
                            <span className="text-xl font-bold text-purple-600">{plan.price} USD</span>
                          </div>
                          <button
                            onClick={() => handlePurchase(plan.id)}
                            disabled={purchasing === plan.id}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                              plan.type === 'data' 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-purple-600 hover:bg-purple-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              plan.type === 'data' 
                                ? 'focus:ring-blue-500' 
                                : 'focus:ring-purple-500'
                            } transition-colors ${
                              purchasing === plan.id ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                          >
                            {purchasing === plan.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Traitement...
                              </>
                            ) : 'Acheter maintenant'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PurchasePage;