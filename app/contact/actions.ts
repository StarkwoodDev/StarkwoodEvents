"use server";

import { Resend } from "resend";
import { validateContactForm } from "@/lib/validate-contact-form";
import { DEFAULT_EMAIL } from "@/lib/site-config";

export interface ContactActionState {
  status: "idle" | "success" | "error";
  errors: Record<string, string>;
  message?: string;
}

export async function sendContactMessage(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const input = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    message: String(formData.get("message") || ""),
  };

  const validation = validateContactForm(input);
  if (!validation.valid) {
    return { status: "error", errors: validation.errors };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      // CONTACT_FROM_EMAIL must be a verified sender domain in Resend (e.g.
      // website@starkwood.au). The onboarding@resend.dev sandbox fallback can
      // only deliver to the Resend account owner's own verified address, so
      // mail to a real recipient like events@starkwood.au will be rejected.
      from: `Starkwood Events <${process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: process.env.CONTACT_TO_EMAIL || DEFAULT_EMAIL,
      replyTo: input.email,
      subject: `New enquiry from ${input.name}`,
      text: input.message,
    });
    // Resend resolves with { error } for API failures (bad key, unverified
    // sender, quota) instead of rejecting, so treat that as a failure too.
    if (error) throw new Error(`Resend ${error.name}: ${error.message}`);
    return { status: "success", errors: {} };
  } catch (err) {
    console.error("[contact] failed to send enquiry email", err);
    return {
      status: "error",
      errors: {},
      message: "Something went wrong sending your message — please call or email us directly.",
    };
  }
}
