export interface TourFormData {
  fullName: string;
  email: string;
  phone: string;
  primaryGoal: string;
  message: string;
}

export interface TourFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  primaryGoal?: string;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_DIGIT_MIN = 7;

export function validateEmail(rawEmail: string): boolean {
  return EMAIL_PATTERN.test(rawEmail.trim());
}

export function validatePhone(rawPhone: string): boolean {
  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= PHONE_DIGIT_MIN && digits.length <= 15;
}

export function validateTourBooking(data: TourFormData): {
  isValid: boolean;
  errors: TourFormErrors;
} {
  const errors: TourFormErrors = {};

  if (data.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }

  if (!data.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Please enter your phone number.';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (data.message.trim().length < 5) {
    errors.message = 'Please include a short message (at least 5 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateNewsletterEmail(rawEmail: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = rawEmail.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Enter your email address.' };
  }
  if (!validateEmail(trimmed)) {
    return { isValid: false, error: 'Enter a valid email address.' };
  }
  return { isValid: true };
}
