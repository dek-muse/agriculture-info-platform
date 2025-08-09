'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../Context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  User2,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

interface UserType {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin' | 'workers' | 'moderator';
  subcity?: string;
   avatar: '/images/default-avatar.png', // ✅ added to match User interface
}

type FormData = {
  name: string;
  email: string;
  password: string;
};

const stepFields: {
  label: string;
  name: keyof FormData;
  type: string;
  icon: React.ReactNode;
  placeholder: string;
  validate: (value: string) => string;
}[] = [
  {
    label: 'Full Name',
    name: 'name',
    type: 'text',
    icon: <User2 size={20} className="text-gray-400" />,
    placeholder: 'Enter your full name',
    validate: (value) =>
      value.trim().length < 3 ? 'Name must be at least 3 characters' : '',
  },
  {
    label: 'Email',
    name: 'email',
    type: 'email',
    icon: <Mail size={20} className="text-gray-400" />,
    placeholder: 'Enter your email address',
    validate: (value) =>
      /^\S+@\S+\.\S+$/.test(value) ? '' : 'Please enter a valid email',
  },
  {
    label: 'Password',
    name: 'password',
    type: 'password',
    icon: <Lock size={20} className="text-gray-400" />,
    placeholder: 'Create a password',
    validate: (value) =>
      value.length >= 6
        ? ''
        : 'Password must be at least 6 characters long',
  },
];

export default function SignUp() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ [key in keyof FormData]?: string }>(
    {}
  );

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const error = stepFields[step].validate(formData[stepFields[step].name]);
    setErrors((prev) => ({ ...prev, [stepFields[step].name]: error }));
  }, [formData, step]);

  const getUsers = (): UserType[] => {
    try {
      return JSON.parse(sessionStorage.getItem('users') || '[]');
    } catch {
      return [];
    }
  };
  const saveUsers = (users: UserType[]) => {
    sessionStorage.setItem('users', JSON.stringify(users));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    const currentField = stepFields[step];
    const error = currentField.validate(formData[currentField.name]);
    setErrors((prev) => ({ ...prev, [currentField.name]: error }));
    if (error) return;
    setStep((prev) => prev + 1);
    setError('');
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    let newErrors: typeof errors = {};
    for (const field of stepFields) {
      const error = field.validate(formData[field.name]);
      if (error) hasError = true;
      newErrors[field.name] = error;
    }
    setErrors(newErrors);
    if (hasError) {
      setStep(stepFields.findIndex((f) => newErrors[f.name] !== '') || 0);
      return;
    }

    setIsLoading(true);
    setError('');

    await new Promise((r) => setTimeout(r, 1500));

    const users = getUsers();
    const userExists = users.some((u) => u.email === formData.email);

    if (userExists) {
      setError('Email already registered');
      setIsLoading(false);
      return;
    }

    const newUser: UserType = {
      _id: Date.now().toString(),
      email: formData.email,
      name: formData.name || 'New User',
      role: 'user',
      avatar: '/images/default-avatar.png'
    };

    saveUsers([...users, newUser]);
    login(newUser, 'fake-jwt-token-demo');

    setIsLoading(false);
    setIsSuccess(true);

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl border border-white/30 shadow-lg p-8 flex flex-col"
      >
        <h2 className="text-white text-3xl font-semibold mb-6 text-center tracking-wide">
          Create Account
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
          noValidate
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            {!isSuccess ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col"
              >
                <label
                  htmlFor={stepFields[step].name}
                  className="text-white font-medium mb-2 flex items-center gap-2"
                >
                  {stepFields[step].icon}
                  {stepFields[step].label}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {stepFields[step].icon}
                  </div>
                  <input
                    id={stepFields[step].name}
                    name={stepFields[step].name}
                    type={stepFields[step].type}
                    placeholder={stepFields[step].placeholder}
                    value={formData[stepFields[step].name]}
                    onChange={handleChange}
                    autoComplete={
                      stepFields[step].name === 'password'
                        ? 'new-password'
                        : 'off'
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400 transition-shadow ${
                      errors[stepFields[step].name] ? 'ring-2 ring-red-500' : ''
                    }`}
                    aria-invalid={!!errors[stepFields[step].name]}
                    aria-describedby={`${stepFields[step].name}-error`}
                    spellCheck="false"
                  />
                </div>
                {errors[stepFields[step].name] && (
                  <p
                    id={`${stepFields[step].name}-error`}
                    className="text-red-400 text-sm mt-1"
                    role="alert"
                  >
                    {errors[stepFields[step].name]}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center space-y-4 py-10"
              >
                <CheckCircle2
                  size={64}
                  className="text-green-400 animate-pulse"
                  aria-hidden="true"
                />
                <h3 className="text-green-300 text-xl font-semibold">
                  Account Created!
                </h3>
                <p className="text-green-200 text-center">
                  Redirecting to your dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSuccess && (
            <>
              <div className="flex justify-between items-center gap-4">
                {step > 0 ? (
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
                  >
                    ◀ Back
                  </motion.button>
                ) : (
                  <div />
                )}
                {step < stepFields.length - 1 ? (
                  <motion.button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      !!errors[stepFields[step].name] ||
                      !formData[stepFields[step].name]
                    }
                    whileTap={{ scale: 0.9 }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl bg-green-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700`}
                  >
                    Next ▶
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700`}
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        <User size={20} />
                        Sign Up
                      </>
                    )}
                  </motion.button>
                )}
              </div>
              {error && (
                <p
                  className="mt-3 text-center text-red-800 font-semibold"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <p className="mt-6 text-center text-white/70 text-sm select-none">
                Demo credentials: Use any email not already registered & password
                ≥ 6 characters
              </p>

              {/* Sign In Link */}
              <motion.button
                type="button"
                onClick={() => router.push('/auth/signin')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition"
                aria-label="Go to Sign In page"
              >
                <LogIn size={20} />
                Already have an account? Sign In
              </motion.button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
