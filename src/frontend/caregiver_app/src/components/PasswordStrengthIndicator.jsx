import React from 'react';

/**
 * PasswordStrengthIndicator Component
 * 
 * Evaluates password strength. Displays a 5-segment visual meter and text label:
 * 1. Very Weak (status-urgent: #8C2C24)
 * 2. Weak (terracotta: #B5562F)
 * 3. Fair (gold: #C9962C)
 * 4. Strong (terracotta: #B5562F)
 * 5. Very Strong (sage: #6E8C6A)
 * 
 * Criteria:
 * - Length: 8+ chars (base requirement for Fair+), 12+ chars bonus, 16+ chars bonus
 * - Character variety: Uppercase, Lowercase, Number, Special character
 */
export const PasswordStrengthIndicator = ({ password = '' }) => {
  if (!password) return null;

  const length = password.length;
  const hasMinLength = length >= 8;
  const hasLength12 = length >= 12;
  const hasLength16 = length >= 16;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Variety count (out of 4 character types)
  const varietyCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  let score = 1; // Default: 1 (Very Weak)

  if (!hasMinLength) {
    // Under 8 chars: at best Weak if mixed, otherwise Very Weak
    score = (length >= 5 && varietyCount >= 2) ? 2 : 1;
  } else {
    // 8+ chars base
    if (hasLength16 && varietyCount >= 3) {
      // 16+ chars with good variety
      score = 5; // Very Strong
    } else if (hasLength12 && varietyCount === 4) {
      // 12+ chars with all 4 character types
      score = 5; // Very Strong
    } else if (hasLength12 && varietyCount >= 2) {
      // 12+ chars with moderate variety
      score = 4; // Strong
    } else if (varietyCount >= 3) {
      // 8-11 chars with 3+ character types
      score = 4; // Strong
    } else if (varietyCount === 2) {
      // 8-11 chars with 2 character types
      score = 3; // Fair
    } else {
      // 8+ chars but all single type (e.g. "aaaaaaaa" or "12345678")
      score = 2; // Weak
    }
  }

  // Tier configuration based on score (1 to 5)
  const TIERS = {
    1: {
      label: 'Very Weak',
      barCount: 1,
      color: 'bg-status-urgent',
      textColor: 'text-status-urgent',
    },
    2: {
      label: 'Weak',
      barCount: 2,
      color: 'bg-terracotta',
      textColor: 'text-terracotta',
    },
    3: {
      label: 'Fair',
      barCount: 3,
      color: 'bg-gold',
      textColor: 'text-gold',
    },
    4: {
      label: 'Strong',
      barCount: 4,
      color: 'bg-terracotta',
      textColor: 'text-terracotta',
    },
    5: {
      label: 'Very Strong',
      barCount: 5,
      color: 'bg-sage',
      textColor: 'text-sage',
    },
  };

  const currentTier = TIERS[score];

  return (
    <div className="mt-2 space-y-1.5 font-sans" aria-live="polite">
      {/* 5-bar segment visual meter */}
      <div className="flex items-center gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((step) => {
          const isFilled = step <= currentTier.barCount;
          return (
            <div
              key={step}
              className={`h-full flex-1 rounded-full transition-colors duration-200 ${
                isFilled ? currentTier.color : 'bg-border/60 dark:bg-ink-soft/30'
              }`}
            />
          );
        })}
      </div>

      {/* Text label */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-ink-soft dark:text-cream/60">
          Password strength:
        </span>
        <span className={`font-semibold ${currentTier.textColor}`}>
          {currentTier.label}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
