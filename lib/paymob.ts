type PaymobBillingData = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  city: string;
  country: string;
};

type PaymobItem = {
  name: string;
  amount: number;
  description: string;
  quantity: number;
};

type CreatePaymentIntentionInput = {
  amountCents: number;
  currency: string;
  billingData: PaymobBillingData;
  items: PaymobItem[];
  specialReference: string;
  notificationUrl: string;
  redirectionUrl: string;
  extras: Record<string, string>;
};

export type PaymobIntentionResult = {
  clientSecret: string;
  checkoutUrl: string;
  providerOrderId?: string;
  raw: Record<string, unknown>;
};

export class PaymobConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymobConfigurationError';
  }
}

export class PaymobRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymobRequestError';
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new PaymobConfigurationError(`${name} is not configured`);
  }
  return value;
}

function getPaymobBaseUrl(): string {
  return (process.env.PAYMOB_BASE_URL?.trim() || 'https://accept.paymob.com').replace(/\/$/, '');
}

function getCheckoutBaseUrl(): string {
  return (process.env.PAYMOB_CHECKOUT_BASE_URL?.trim() || getPaymobBaseUrl()).replace(/\/$/, '');
}

function getPaymentMethods(): number[] {
  const raw =
    process.env.PAYMOB_PAYMENT_METHODS ||
    process.env.PAYMOB_INTEGRATION_IDS ||
    process.env.PAYMOB_INTEGRATION_ID;

  if (!raw?.trim()) {
    throw new PaymobConfigurationError('PAYMOB_PAYMENT_METHODS or PAYMOB_INTEGRATION_ID is not configured');
  }

  const methods = raw
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);

  if (methods.length === 0) {
    throw new PaymobConfigurationError('Paymob payment methods must contain at least one integration id');
  }

  return methods;
}

export function assertPaymobCheckoutConfigured(): void {
  requiredEnv('PAYMOB_PUBLIC_KEY');
  requiredEnv('PAYMOB_SECRET_KEY');
  getPaymentMethods();
}

function getProviderOrderId(data: Record<string, unknown>): string | undefined {
  const order = data.order;
  if (typeof order === 'string' || typeof order === 'number') {
    return String(order);
  }

  if (order && typeof order === 'object') {
    const id = (order as Record<string, unknown>).id;
    if (typeof id === 'string' || typeof id === 'number') {
      return String(id);
    }
  }

  const candidates = ['order_id', 'intention_order_id', 'id'];
  for (const key of candidates) {
    const value = data[key];
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }

  return undefined;
}

export function buildPaymobCheckoutUrl(clientSecret: string): string {
  const publicKey = requiredEnv('PAYMOB_PUBLIC_KEY');
  const url = new URL('/unifiedcheckout/', getCheckoutBaseUrl());
  url.searchParams.set('publicKey', publicKey);
  url.searchParams.set('clientSecret', clientSecret);
  return url.toString();
}

export async function createPaymobPaymentIntention(
  input: CreatePaymentIntentionInput
): Promise<PaymobIntentionResult> {
  const secretKey = requiredEnv('PAYMOB_SECRET_KEY');
  const endpoint = `${getPaymobBaseUrl()}/v1/intention/`;

  const payload = {
    amount: input.amountCents,
    currency: input.currency,
    payment_methods: getPaymentMethods(),
    billing_data: input.billingData,
    items: input.items,
    special_reference: input.specialReference,
    notification_url: input.notificationUrl,
    redirection_url: input.redirectionUrl,
    expiration: 3600,
    extras: input.extras,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${secretKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const detail =
      typeof data.detail === 'string'
        ? data.detail
        : typeof data.message === 'string'
          ? data.message
          : 'Paymob intention request failed';
    throw new PaymobRequestError(detail);
  }

  const clientSecret =
    typeof data.client_secret === 'string'
      ? data.client_secret
      : typeof data.clientSecret === 'string'
        ? data.clientSecret
        : null;

  if (!clientSecret) {
    throw new PaymobRequestError('Paymob response did not include client_secret');
  }

  const checkoutUrl =
    typeof data.checkout_url === 'string'
      ? data.checkout_url
      : typeof data.checkoutUrl === 'string'
        ? data.checkoutUrl
        : buildPaymobCheckoutUrl(clientSecret);

  return {
    clientSecret,
    checkoutUrl,
    providerOrderId: getProviderOrderId(data),
    raw: data,
  };
}
