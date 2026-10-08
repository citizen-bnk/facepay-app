# FacePay app

Expo (SDK 57) + TypeScript + expo-router mobile app for FacePay ("Face your money"). Runs on iOS, Android and web (deployed to app.facepay.com).
Dark midnight/gold theme, Montserrat via `@expo-google-fonts/montserrat`.

## Screens

Splash (`/splash`), onboarding, phone sign-in with OTP, biometric consent, Face Authentication, Home (tab), Wallet (tab), Scan & Pay with QR / NFC / Face Pay (tab), Transaction History (tab), Profile & Settings (tab), Bills & Services, Send Money, Enter amount, Review, PIN, Processing / Payment Successful / Pending / Failed.

## Run

```bash
npm install --legacy-peer-deps
npm start            # Expo dev server (press i / a / w)
npm run web          # web only
npm run typecheck    # tsc --noEmit
npm test             # jest (payment flow state logic)
```

Demo sign-in: any South African mobile number, OTP `123456`. The OTP step is a stub (`src/otp.ts`), there is no SMS provider.

## API configuration

`EXPO_PUBLIC_API_URL` (see `.env.example`) points at facepay-core (e.g. `https://api.facepay.com`). When it is unset the app uses built-in fixtures with identical shapes (`src/api/fixtures.ts`): Thabo, R 12,450.00, Pick n Pay, Uber, BP Fuel, Checkers, VISA ****1234.

In live mode the app calls `/v1/auth/login` with the demo customer (`EXPO_PUBLIC_DEMO_EMAIL` / `EXPO_PUBLIC_DEMO_PASSWORD`, defaults `thabo@facepay.demo` / `facepay-demo`) because the contract has no phone-OTP endpoint yet. Payment-intent and confirm response shapes beyond `status` are assumed (see `PaymentIntent` in `src/api/types.ts`).

Fixture demo amounts: more than the balance is declined; exactly R 13.13 is authorised only (pending); exactly R 66.60 makes the confirm call time out (pending).

## Payment rules (src/payment/flow.ts)

- Creates a payment intent with an `Idempotency-Key`, shows "Processing…", then calls confirm.
- "Payment Successful" is shown only when confirm returns status `captured`. A timeout or network error after confirm is sent shows Pending, never paid. Declined or expired shows Failed. "Check status" re-reads the intent and never creates a second one.
- Balances are labelled "Provider balance".

## Biometrics and privacy

Face Pay needs explicit consent (nothing pre-ticked) and can be revoked in Profile > Biometric consent. A PIN path is always available. The Face Authentication screen uses the expo-camera front camera for framing only and a **mock liveness adapter** (`src/biometrics/adapter.ts`). It is a stub: no frame is read, stored or transmitted, and no real face recognition happens. Replace it with a certified liveness SDK before production. The PIN is stored as a SHA-256 hash (SecureStore on native, localStorage on web).

## Builds

```bash
npx expo export -p web          # static web build into dist/
npm i -g eas-cli && eas login
eas build -p android --profile preview     # APK
eas build -p ios --profile production
eas submit -p ios|android
```

Bundle id / package: `com.facepay.app`, scheme `facepay`. Profiles are in `eas.json` (set `EXPO_PUBLIC_API_URL` per profile).

## Deploy on Vercel (app.facepay.com)

Import the repo in Vercel. `vercel.json` sets the install/build commands, `dist` as output and an SPA rewrite to `/index.html`. Add the `app.facepay.com` domain and (optionally) `EXPO_PUBLIC_API_URL` as an environment variable.

Note: web QR scanning in expo-camera loads a small WASM decoder from jsDelivr at runtime.
