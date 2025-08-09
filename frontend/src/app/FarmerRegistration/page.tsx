'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, MapPin, Phone, Layers, Ruler, CheckCircle } from 'lucide-react';

interface Farmer {
  name: string;
  email: string;
  subcity: string;
  phone: string;
  farmName: string;
  farmType: string;
  farmSize: string;
}

const steps = ['Personal Info', 'Farm Details', 'Review & Submit'];

export default function FarmersForm() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Farmer>({
    name: '',
    email: '',
    subcity: '',
    phone: '',
    farmName: '',
    farmType: '',
    farmSize: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validateStep() {
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim()) {
        setError('Please enter your name and a valid email.');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(form.email)) {
        setError('Invalid email address.');
        return false;
      }
    }
    if (step === 1) {
      if (!form.farmName.trim()) {
        setError('Please enter your farm name.');
        return false;
      }
      if (!form.farmType.trim()) {
        setError('Please select your farm type.');
        return false;
      }
      if (!form.farmSize.trim() || Number(form.farmSize) <= 0) {
        setError('Please enter a valid farm size.');
        return false;
      }
    }
    setError('');
    return true;
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('API Error');

      setSuccess(true);

      // Clear form and reset step
      setForm({
        name: '',
        email: '',
        subcity: '',
        phone: '',
        farmName: '',
        farmType: '',
        farmSize: '',
      });
      setStep(0);

      // Hide success after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const containerVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url('/assets/agr.jpg')` }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-xl p-8 rounded-3xl border border-white/30 bg-white/10 backdrop-blur-lg shadow-lg text-white"
      >
        {/* Progress */}
        <div className="flex items-center justify-between mb-8 select-none">
          {steps.map((label, idx) => (
            <div key={idx} className="flex-1 text-center">
              <div
                className={`h-2 rounded-full transition-all ${
                  idx <= step ? 'bg-green-400' : 'bg-white/30'
                }`}
              />
              <span
                className={`text-sm mt-2 block ${
                  idx === step ? 'text-green-300 font-semibold' : 'text-white/60'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait" initial={false}>
          {!success ? (
            <motion.div
              key={step}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div className="space-y-5">
                  <Input icon={<User />} name="name" value={form.name} onChange={handleChange} placeholder="Name *" autoComplete="name" />
                  <Input icon={<Mail />} name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email *" autoComplete="email" />
                  <Input icon={<MapPin />} name="subcity" value={form.subcity} onChange={handleChange} placeholder="Subcity" />
                  <Input icon={<Phone />} name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <Input icon={<Layers />} name="farmName" value={form.farmName} onChange={handleChange} placeholder="Farm Name *" />
                  <Select icon={<Layers />} name="farmType" value={form.farmType} onChange={handleChange}>
                    <option value="">-- Farm Type --</option>
                    <option value="Grains">Grains</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Livestock">Livestock</option>
                    <option value="Mixed">Mixed</option>
                  </Select>
                  <Input
                    icon={<Ruler />}
                    name="farmSize"
                    type="number"
                    min="0"
                    value={form.farmSize}
                    onChange={handleChange}
                    placeholder="Farm Size (acres) *"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 text-white">
                  <h3 className="text-xl font-semibold mb-4">Review your details</h3>
                  <ul className="text-sm space-y-2">
                    {Object.entries(form).map(([key, value]) => (
                      <li key={key}>
                        <strong className="capitalize">{key}:</strong> {value || '—'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && <p className="text-red-400 mt-5 text-center">{error}</p>}

              <div className="flex justify-between mt-8">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="px-5 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                  >
                    Back
                  </button>
                )}

                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep()) setStep(s => s + 1);
                    }}
                    className="ml-auto px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition text-white font-semibold"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    className={`ml-auto px-5 py-2 rounded-lg font-semibold text-white ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center text-green-400"
            >
              <CheckCircle className="w-20 h-20 mb-5" />
              <h3 className="text-3xl font-bold">Farmer Registered!</h3>
              <p className="mt-2 text-white/80">Your details have been saved successfully.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo credentials reminder (example) */}
        <p className="mt-8 text-sm text-white/60 text-center select-none">
          Demo: Fill the form and submit to register a farmer.
        </p>
      </motion.div>
    </div>
  );
}

function Input({ icon, ...props }: any) {
  return (
    <label className="block relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400">{icon}</span>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
    </label>
  );
}

function Select({ icon, children, ...props }: any) {
  return (
    <label className="block relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400">{icon}</span>
      <select
        {...props}
        className="w-full pl-10 pr-3 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        {children}
      </select>
    </label>
  );
}
