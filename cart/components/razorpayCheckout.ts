const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpaySuccess) => void;
  modal: { ondismiss: () => void };
}

type RazorpayConstructor = new (options: RazorpayOptions) => { open: () => void };

const razorpayOnWindow = () => (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;

/** Loaded only when a customer pays, so other pages don't download it. */
function loadRazorpay(): Promise<RazorpayConstructor | null> {
  return new Promise((resolve) => {
    const existing = razorpayOnWindow();
    if (existing) {
      resolve(existing);
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.onload = () => resolve(razorpayOnWindow() ?? null);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
}

/** Opens the payment window. Resolves to false if it couldn't load, and nothing has been charged. */
export async function openRazorpay(options: RazorpayOptions) {
  const Razorpay = await loadRazorpay();
  if (!Razorpay) return false;
  new Razorpay(options).open();
  return true;
}
