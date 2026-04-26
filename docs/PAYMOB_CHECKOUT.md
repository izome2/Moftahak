# Paymob Checkout Configuration

Required server-side variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMOB_CURRENCY=EGP
PAYMOB_PUBLIC_KEY=
PAYMOB_SECRET_KEY=
PAYMOB_HMAC_SECRET=
PAYMOB_PAYMENT_METHODS=
```

`PAYMOB_PAYMENT_METHODS` accepts one or more Paymob integration IDs separated by commas. `PAYMOB_INTEGRATION_ID` is also supported as a fallback for a single integration ID.

Optional overrides:

```env
PAYMOB_BASE_URL=https://accept.paymob.com
PAYMOB_CHECKOUT_BASE_URL=https://accept.paymob.com
```

Secrets must stay server-side. The frontend only receives the checkout URL or client secret returned by `/api/paymob/create-checkout`.
