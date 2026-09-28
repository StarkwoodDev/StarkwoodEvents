export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormValidation {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(input: ContactFormInput): ContactFormValidation {
  const errors: ContactFormValidation["errors"] = {};

  if (!input.name.trim()) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(input.email.trim())) errors.email = "Please enter a valid email address.";
  if (!input.message.trim()) errors.message = "Please enter a message.";

  return { valid: Object.keys(errors).length === 0, errors };
}
