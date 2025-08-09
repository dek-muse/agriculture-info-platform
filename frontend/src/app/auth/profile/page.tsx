'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, MapPin, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    subcity: user?.subcity || '',
  });

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Live validation rules
  function validate(field: string, value: string) {
    let error = '';
    if (field === 'name') {
      if (!value.trim()) error = 'Name is required';
      else if (value.trim().length < 3) error = 'Name too short';
    }
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email address';
    }
    if (field === 'subcity') {
      if (!value.trim()) error = 'Subcity is required';
    }
    return error;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate field live
    const errorMsg = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  }

  function handleSave() {
    // Final validation before save
    const newErrors: { [key: string]: string } = {};
    Object.entries(formData).forEach(([field, value]) => {
      if (field === 'role') return; // role is readonly
      const errorMsg = validate(field, value);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Validation failed, don't save
      return;
    }

    setIsSaving(true);

    // Simulate async save
    setTimeout(() => {
      // TODO: update context/backend here if needed
      setIsSaving(false);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setEditMode(false);
      }, 2000);
    }, 1500);
  }

  function handleLogout() {
    logout();
    router.push('/auth/signin');
  }

  return (
    <>
      {/* Blurred Background Image */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center filter blur-lg brightness-75"
        style={{ backgroundImage: "url('/assets/agr.jpg')" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="relative w-full max-w-lg bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-semibold mb-8 text-white text-center drop-shadow-md">
            Your Profile
          </h2>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleSave();
            }}
            noValidate
            className="space-y-6"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block mb-1 font-medium text-white flex items-center gap-2 drop-shadow"
              >
                <User size={20} /> Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                disabled={!editMode || isSaving || success}
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'focus:ring-red-400 border-red-400 border'
                    : 'focus:ring-green-400 border-transparent border'
                }`}
                placeholder="Your full name"
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-1 text-red-400 text-sm font-semibold">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-1 font-medium text-white flex items-center gap-2 drop-shadow"
              >
                <Mail size={20} /> Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                disabled={!editMode || isSaving || success}
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'focus:ring-red-400 border-red-400 border'
                    : 'focus:ring-green-400 border-transparent border'
                }`}
                placeholder="Your email address"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-red-400 text-sm font-semibold">{errors.email}</p>
              )}
            </div>

            {/* Role (readonly) */}
            <div>
              <label
                className="block mb-1 font-medium text-white flex items-center gap-2 drop-shadow"
              >
                <ShieldCheck size={20} /> Role
              </label>
              <p className="text-white">{formData.role}</p>
            </div>

            {/* Subcity */}
            <div>
              <label
                htmlFor="subcity"
                className="block mb-1 font-medium text-white flex items-center gap-2 drop-shadow"
              >
                <MapPin size={20} /> Subcity
              </label>
              <input
                id="subcity"
                name="subcity"
                type="text"
                disabled={!editMode || isSaving || success}
                value={formData.subcity}
                onChange={handleChange}
                className={`w-full rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.subcity
                    ? 'focus:ring-red-400 border-red-400 border'
                    : 'focus:ring-green-400 border-transparent border'
                }`}
                placeholder="Your subcity"
                autoComplete="address-level2"
              />
              {errors.subcity && (
                <p className="mt-1 text-red-400 text-sm font-semibold">{errors.subcity}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              {editMode ? (
                <>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setEditMode(false);
                      setErrors({});
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        role: user?.role || '',
                        subcity: user?.subcity || '',
                      });
                    }}
                    className="px-6 py-3 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSaving}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
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
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : (
                      'Save'
                    )}
                  </motion.button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Demo credentials reminder */}
          <p className="mt-8 text-center text-white/70 text-sm select-none drop-shadow-md">
            Demo User: <strong>demo@farm.com</strong> / <strong>password123</strong>
          </p>

          {/* Success Animation */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center rounded-3xl"
                style={{ zIndex: 999 }}
              >
                <CheckCircle2 size={96} className="text-green-400 drop-shadow-lg" />
                <motion.p
                  className="text-green-400 text-2xl font-semibold ml-4 drop-shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Saved Successfully!
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
