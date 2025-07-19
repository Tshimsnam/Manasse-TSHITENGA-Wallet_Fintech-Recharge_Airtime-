// pages/login.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Login() {
    const router = useRouter();
    const [form, setForm] = useState({
        phone: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Vérifier si l'utilisateur est déjà connecté
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        }
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.phone.trim()) {
            newErrors.phone = 'Téléphone est requis';
        } else if (!/^[0-9]{10,15}$/.test(form.phone)) {
            newErrors.phone = 'Numéro invalide';
        }
        if (!form.password) {
            newErrors.password = 'Mot de passe requis';
        } else if (form.password.length < 6) {
            newErrors.password = 'Minimum 6 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:8000/api/login', form);

            // Stocker le token dans le localStorage
            localStorage.setItem('token', res.data.token);

            // Stocker les informations utilisateur si disponibles
            if (res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }

            // Redirection vers le dashboard
            router.push('/dashboard');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Erreur de connexion');
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
                        <h1 className="text-2xl font-bold text-white">Connexion</h1>
                        <p className="text-blue-100 mt-1">Accédez à votre espace personnel</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {router.query.registered === 'true' && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4">
                                <p className="text-green-700">Inscription réussie ! Vous pouvez maintenant vous connecter.</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="+243899072017"
                                className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black placeholder-gray-400`}
                                onChange={handleChange}
                                value={form.phone}
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black placeholder-gray-400`}
                                onChange={handleChange}
                                value={form.password}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Se souvenir de moi
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connexion...
                                </span>
                            ) : "Se connecter"}
                        </button>
                    </form>

                    <div className="px-6 py-4 bg-gray-50 text-center">
                        <p className="text-gray-600">
                            Pas encore de compte?{' '}
                            <button
                                onClick={() => router.push('/register')}
                                className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                            >
                                S'inscrire
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}