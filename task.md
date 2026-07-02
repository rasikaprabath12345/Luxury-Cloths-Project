# OTP Email Verification Implementation Tasks

## Backend
- [x] User.cs - IsVerified, VerificationToken & Expiry fields add
- [x] appsettings.json - SMTP settings configuration add
- [x] EmailService.cs - Create email sending service (with console fallback)
- [x] Program.cs - Register EmailService
- [x] AuthController.cs - Register, verify-email, resend-verification, login, forgot-password endpoints update
- [x] EF Database Migrations run

## Frontend
- [x] api.ts - verify-email and resend-verification API calls add
- [x] AuthContext.tsx - verifyEmail and resendVerification methods add, login/register logic update
- [x] register/page.tsx - OTP verification overlay and 6-digit input blocks add
- [x] login/page.tsx - Unverified check and OTP redirect add
