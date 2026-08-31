import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/authService';
import { TopControls } from '../components/TopControls';
import {
  HeartHandshake,
  UserPlus,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Register = () => {
  const navigate = useNavigate();
  const { verifyOtp, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Forge the caregiver account in the database 🚀
      await register(name.trim(), email.trim(), password);

      // 2. Kick them over to the login page to do the real 2FA flow! 🛡️
      navigate('/login', { replace: true });
      
    } catch (err) {
      setSubmitError(err?.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-ink text-ink dark:text-cream flex flex-col justify-center items-center p-4 font-sans relative transition-colors duration-200">
      {/* Top-Right Controls: Theme Toggle Only (no settings) */}
      <TopControls showSettings={false} />

      <div className="w-full max-w-md my-auto pt-6 pb-8">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-card bg-surface dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 shadow-xs mb-3">
            <HeartHandshake className="w-8 h-8 text-terracotta" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cream dark:bg-ink-soft/40 border border-border/80 dark:border-ink-soft/40 text-terracotta text-[11px] font-semibold uppercase tracking-wider mb-1">
              Caregiver Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-cream tracking-tight font-sans">
              Smriti Setu
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70 mt-1 max-w-sm mx-auto leading-relaxed">
              Cognitive Assist Platform • Create your caregiver account
            </p>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 sm:p-8 shadow-sm transition-colors">
          {submitError && (
            <div className="mb-5 p-3.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-ink dark:text-cream font-medium leading-relaxed">
                {submitError}
              </p>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="Dr. Sarah Jenkins"
                className={`w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/20 border rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/40 focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors ${
                  errors.name
                    ? 'border-terracotta'
                    : 'border-border/80 dark:border-ink-soft/40 focus:border-terracotta'
                }`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-xs text-terracotta font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="caregiver@example.com"
                className={`w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/20 border rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/40 focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors ${
                  errors.email
                    ? 'border-terracotta'
                    : 'border-border/80 dark:border-ink-soft/40 focus:border-terracotta'
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-terracotta font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="Minimum 8 characters"
                className={`w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/20 border rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/40 focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors ${
                  errors.password
                    ? 'border-terracotta'
                    : 'border-border/80 dark:border-ink-soft/40 focus:border-terracotta'
                }`}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-xs text-terracotta font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                placeholder="Re-enter your password"
                className={`w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/20 border rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/40 focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors ${
                  errors.confirmPassword
                    ? 'border-terracotta'
                    : 'border-border/80 dark:border-ink-soft/40 focus:border-terracotta'
                }`}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-terracotta font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-terracotta hover:bg-terracotta-dark text-surface font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-terracotta/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>

            {/* Link to Login */}
            <div className="text-center pt-3 mt-1 border-t border-border/60 dark:border-ink-soft/30">
              <p className="text-xs text-ink-soft dark:text-cream/70">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-terracotta hover:text-terracotta-dark font-semibold transition-colors focus:outline-none focus:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer info with Smriti Setu branding */}
        <p className="text-center text-xs text-ink-soft dark:text-cream/60 mt-6 font-sans">
          Smriti Setu • Cognitive Assist Platform
        </p>
      </div>
    </div>
  );
};

export default Register;
