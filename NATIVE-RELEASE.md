# FACEPAY native release

Expo project: https://expo.dev/accounts/xtracash/projects/facepay-app-live

The app is a native Expo/React Native application with bundle identifier `com.facepay.app`. Generated Android/iOS projects are ignored; configuration and the device-location plugin are the source of truth. No phone-shaped frame is rendered on mobile or web. Onboarding uses full-screen photographs with swipe, automatic progression, pause and reduced-motion support. Wallet cards use the standard 85.60:53.98 card ratio.

## Build profiles

Run `npx eas-cli build --platform android --profile preview` for an installable APK with explicitly labelled sandbox OTP and simulated payments. `native-test` uses real phone verification, but payments remain simulated. `google` produces a signed AAB; `huawei` produces a signed APK; `apple` produces a signed iOS store build. Production profiles have no demo OTP bypass. Store submission is a separate operation and requires store credentials and complete listings; a successful build does not mean publication.

Android GPS uses the device LocationManager and Geocoder rather than requiring Google Play Services. Huawei devices still need physical testing because location/address services vary by device and region. iOS uses Expo Location. OS background scheduling is best effort; opening the app and using the daily-check button is the reliable fallback. These features require a native build rather than Expo Go.

## Twilio setup

1. In Twilio Console, open Verify → Services and select/create the FACEPAY service. Configure its WhatsApp sender/authentication messages and SMS delivery.
2. In Vercel, open **Smart My Company → facepay-core → Settings → Environment Variables**. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID` as sensitive variables for Production and Preview. Never put them in the app or Git.
3. Have Twilio confirm that broad automatic SMS fallback is disabled. FACEPAY permits SMS only when Twilio explicitly confirms that the number is unavailable on WhatsApp (63024). Outages, invalid senders, timeouts and other failures must not cause SMS.
4. Only after that confirmation, set `TWILIO_STRICT_WHATSAPP_FALLBACK_CONFIRMED=true` and redeploy core. Without these settings live OTP fails closed.
5. Test with consenting numbers, including a WhatsApp-enabled number and a confirmed non-WhatsApp number. Check delivery status and correct/incorrect/expired OTP behavior before release.

## Approved residence policy

The user approved this policy on 24 October 2026. A person enters and confirms their home address, explicitly consents, and chooses a two-hour home window. For 15 local-calendar days, one qualifying reading per day must have horizontal accuracy within 50 metres and be within 100 metres of the confirmed home coordinates. At least 12 of 15 days (80%) establishes location consistency. This percentage measures daily consistency, not GPS accuracy. Missing, stale, mocked, inaccurate and away-from-home readings do not qualify. No location permission or collection occurs before consent. Background checks and reminders require separate opt-in.

Coordinates and addresses are encrypted on the server. Background scheduling stops at completion, revocation or logout. Stop/delete removes the enrollment and its samples; account deletion removes all mobile sessions and phone challenges as well. A daily authenticated retention job removes raw enrollment data within 30 days. Reports are signed evidence of device-reported location consistency, require independent address review and do not guarantee acceptance by banks or other institutions. GPS spoofing cannot be ruled out. End-to-end accuracy and reliability require physical-device testing over the full 15 days.

## Remaining release dependencies

- Resolve Vercel team billing to deploy the latest web app and mobile API.
- Configure Twilio as above, then exercise the live verification flow.
- Complete Apple signing and App Store Connect, Google Play service-account access and Huawei AppGallery access/listings.
- Supply public privacy policy, support and external account-deletion request pages; complete store privacy/data-safety forms and background-location review using actual behavior.
- Run device checks for permissions, foreground/background samples, notification scheduling, offline retries, revocation/deletion and accessibility.
- Connect and certify real payment/biometric providers before offering live financial services. Current payment and biometric provider flows are simulations and must be described accordingly in testing/listings.

Build checks: `npm run typecheck`, `npm test -- --runInBand`, `npx expo-doctor`, `npm run build:web`. The `.npmrc` keeps clean installs consistent with the lockfile's peer-dependency resolution.
