export type NewsletterSubscriber = {
  _id: string;
  email: string;
  locale: string;
  status: "pending" | "confirmed" | "unsubscribed";
  consentAt: string;
  confirmToken?: string;
  unsubscribeToken: string;
  confirmedAt?: string;
};
