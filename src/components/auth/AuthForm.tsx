import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  niveau: string;
  confirmPassword: string;
}

useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}, []);
type RegisterStep = 'name' | 'email' | 'password' | 'niveau';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [registerStep, setRegisterStep] = useState<RegisterStep>('name');
  const [registerData, setRegisterData] = useState<Partial<RegisterFormData>>({});
  
  const { login, register: registerUser, isLoading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<RegisterFormData>({
    defaultValues: registerData
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Update form values when registerData changes
  useEffect(() => {
    Object.entries(registerData).forEach(([key, value]) => {
      setValue(key as keyof RegisterFormData, value as string);
    });
  }, [registerData, setValue]);

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleRegisterNext = async (stepData: Partial<RegisterFormData>) => {
    const updatedData = { ...registerData, ...stepData };
    setRegisterData(updatedData);

    switch (registerStep) {
      case 'name':
        setRegisterStep('email');
        break;
      case 'email':
        setRegisterStep('password');
        break;
      case 'password':
        setRegisterStep('niveau');
        break;
      case 'niveau':
        // Submit registration
        try {
          await registerUser(
            updatedData.name!,
            updatedData.email!,
            updatedData.password!,
            updatedData.niveau!
          );
          // Reset step for next registration
          setRegisterStep('name');
          setRegisterData({});
        } catch (err) {
          console.error('Registration error:', err);
        }
        break;
    }
  };

  const handleRegisterBack = () => {
    switch (registerStep) {
      case 'email':
        setRegisterStep('name');
        break;
      case 'password':
        setRegisterStep('email');
        break;
      case 'niveau':
        setRegisterStep('password');
        break;
    }
  };

  const onNameSubmit = (data: Pick<RegisterFormData, 'name'>) => {
    handleRegisterNext(data);
  };

  const onEmailSubmit = (data: Pick<RegisterFormData, 'email'>) => {
    handleRegisterNext(data);
  };

  const onPasswordSubmit = (data: Pick<RegisterFormData, 'password' | 'confirmPassword'>) => {
    if (data.password === data.confirmPassword) {
      handleRegisterNext(data);
    }
  };

  const onNiveauSubmit = (data: Pick<RegisterFormData, 'niveau'>) => {
    handleRegisterNext(data);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
    reset();
    setRegisterStep('name');
    setRegisterData({});
  };

  // Updated niveau options based on your requirements
  const niveaux: { category: string; options: string[] }[] = [
    {
      category: '1ère année',
      options: ['1ère']
    },
    {
      category: '2ème année',
      options: [
        '2ème Info technique',
        '2ème Science expérimentale',
        '2ème Lettre',
        '2ème Économie gestion'
      ]
    },
    {
      category: '3ème année',
      options: [
        '3ème Info',
        '3ème Math',
        '3ème Technique',
        '3ème Lettre',
        '3ème Science expérimentale'
      ]
    },
    {
      category: 'Baccalauréat',
      options: [
        'Bac Info',
        'Bac Math',
        'Bac Technique',
        'Bac Lettre',
        'Bac Science expérimentale'
      ]
    }
  ];

  // Progress percentage for registration
  const getProgressPercentage = () => {
    const steps = ['name', 'email', 'password', 'niveau'];
    return ((steps.indexOf(registerStep) + 1) / steps.length) * 100;
  };

  // If user exists, don't render the form (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-green-100 relative overflow-hidden">
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-300 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
          
          {/* Header with animated icon */}
          <div className="text-center mb-8 relative">
            <div className="inline-block p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
              {isLogin ? (
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent mb-2">
              {isLogin ? 'Bon retour parmi nous' : 'Rejoignez EduPlatform'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {isLogin 
                ? 'Connectez-vous pour accéder à votre espace' 
                : 'Créez votre compte en quelques étapes'}
            </p>
          </div>

          {/* Progress Bar for Registration */}
          {!isLogin && (
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {['name', 'email', 'password', 'niveau'].map((step, index) => (
                  <div
                    key={step}
                    className={`flex-1 text-center text-xs font-medium ${
                      ['name', 'email', 'password', 'niveau'].indexOf(registerStep) >= index
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center mb-1 ${
                        ['name', 'email', 'password', 'niveau'].indexOf(registerStep) >= index
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="hidden sm:block">
                      {step === 'name' && 'Nom'}
                      {step === 'email' && 'Email'}
                      {step === 'password' && 'Mot de passe'}
                      {step === 'niveau' && 'Niveau'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          {isLogin && (
            <form onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-5">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-green-600 transition-colors">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'L\'email est requis',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Adresse email invalide'
                        }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-gray-50/50 group-hover:border-green-300"
                      placeholder="vous@exemple.com"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500 animate-fadeIn">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-green-600 transition-colors">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      {...register('password', { 
                        required: 'Le mot de passe est requis',
                        minLength: {
                          value: 6,
                          message: 'Minimum 6 caractères'
                        }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-gray-50/50 group-hover:border-green-300"
                      placeholder="••••••"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500 animate-fadeIn">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-green-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          )}

          {/* Multi-step Registration Form */}
          {!isLogin && (
            <div className="space-y-5">
              {/* Step 1: Name */}
              {registerStep === 'name' && (
                <form onSubmit={handleSubmit(onNameSubmit)} className="space-y-4 animate-slideIn">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-green-600 transition-colors">
                      Comment vous appelez-vous ?
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('name', { 
                          required: 'Le nom est requis',
                          minLength: {
                            value: 2,
                            message: 'Le nom doit contenir au moins 2 caractères'
                          }
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-gray-50/50 text-lg"
                        placeholder="Jean Dupont"
                        autoFocus
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500 animate-fadeIn">{errors.name.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-medium py-3 rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continuer
                  </button>
                </form>
              )}

              {/* Step 2: Email */}
              {registerStep === 'email' && (
                <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4 animate-slideIn">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-green-600 transition-colors">
                      Quelle est votre adresse email ?
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'L\'email est requis',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Adresse email invalide'
                          }
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-gray-50/50 text-lg"
                        placeholder="vous@exemple.com"
                        autoFocus
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500 animate-fadeIn">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleRegisterBack}
                      className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium py-3 rounded-xl hover:from-green-700 hover:to-green-600 transition-all"
                    >
                      Continuer
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Password */}
              {registerStep === 'password' && (
                <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 animate-slideIn">
                  <div className="space-y-3">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-green-600 transition-colors">
                        Choisissez un mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          {...register('password', { 
                            required: 'Le mot de passe est requis',
                            minLength: {
                              value: 6,
                              message: 'Minimum 6 caractères'
                            }
                          })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-gray-50/50"
                          placeholder="••••••"
                          autoFocus
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-500 animate-fadeIn">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-green-600 transition-colors">
                        Confirmez le mot de passe
                      </label>
                      <input
                        type="password"
                        {...register('confirmPassword', { 
                          required: 'Veuillez confirmer le mot de passe',
                          validate: (value) => 
                            value === watch('password') || 'Les mots de passe ne correspondent pas'
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-gray-50/50"
                        placeholder="••••••"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500 animate-fadeIn">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleRegisterBack}
                      className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium py-3 rounded-xl hover:from-green-700 hover:to-green-600 transition-all"
                    >
                      Continuer
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Niveau */}
              {registerStep === 'niveau' && (
                <form onSubmit={handleSubmit(onNiveauSubmit)} className="space-y-6 animate-slideIn">
                  <div className="space-y-6">
                    {niveaux.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <h3 className="text-sm font-semibold text-green-700 border-b border-green-100 pb-1">
                          {category.category}
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {category.options.map((niveau) => (
                            <label
                              key={niveau}
                              className={`
                                relative flex items-center p-3 border-2 rounded-xl cursor-pointer
                                transition-all duration-200 hover:scale-[1.02] hover:border-green-300
                                ${watch('niveau') === niveau 
                                  ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                                  : 'border-gray-200 hover:bg-green-50/50 text-gray-700'}
                              `}
                            >
                              <input
                                type="radio"
                                {...register('niveau', { required: 'Le niveau est requis' })}
                                value={niveau}
                                className="sr-only"
                              />
                              <div className="flex items-center gap-3 w-full">
                                <div className={`
                                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                                  ${watch('niveau') === niveau 
                                    ? 'border-green-500 bg-green-500' 
                                    : 'border-gray-300'}
                                `}>
                                  {watch('niveau') === niveau && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <span className="font-medium flex-1">{niveau}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    {errors.niveau && (
                      <p className="mt-1 text-xs text-red-500 animate-fadeIn">{errors.niveau.message}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleRegisterBack}
                      className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium py-3 rounded-xl hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </span>
                      ) : (
                        'Créer mon compte'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Toggle between Login/Register */}
          <div className="mt-8 text-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative">
              <button
                onClick={toggleMode}
                className="inline-block px-4 py-2 bg-white text-sm text-green-600 hover:text-green-700 font-medium hover:underline transition-all"
              >
                {isLogin 
                  ? "Pas encore de compte ? S'inscrire" 
                  : 'Déjà un compte ? Se connecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};