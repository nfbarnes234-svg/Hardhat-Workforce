# Password Reset Feature - Setup Instructions

## Overview
This feature implements a password reset system with two options:
- **Email**: Sends a reset link to the user's email
- **SMS**: Sends a 6-digit reset code to the user's phone

## Files Created/Modified

### New API Routes
1. **`src/app/api/auth/forgot-password/route.ts`** - Initiates password reset
2. **`src/app/api/auth/reset-password/route.ts`** - Completes password reset

### New Services
1. **`src/lib/email-service.ts`** - Email sending utilities
2. **`src/lib/sms-service.ts`** - SMS sending utilities

### New Components
1. **`src/components/auth/ForgotPasswordForm.tsx`** - Form to request password reset
2. **`src/components/auth/ResetPasswordForm.tsx`** - Form to set new password

### New Pages
1. **`src/app/forgot-password/page.tsx`** - Forgot password page
2. **`src/app/reset-password/page.tsx`** - Reset password page

### Database Schema
The User model already includes:
- `resetCode`: Stores the reset token/code
- `resetCodeExpires`: Stores expiration time (1 hour)
- `phone`: User's phone number for SMS

## Setup Steps

### 1. Update Environment Variables

Copy `.env.example` to `.env` and add your service credentials:

**For Email (SendGrid example):**
```bash
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@hardhatworkforce.com"
```

**For SMS (Twilio example):**
```bash
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### 2. Install Dependencies (if not already installed)

Dependencies are optional - implement based on your chosen provider:

**For SendGrid:**
```bash
npm install @sendgrid/mail
```

**For Twilio:**
```bash
npm install twilio
```

### 3. Implement Email Service

Edit `src/lib/email-service.ts` and uncomment/implement your provider:

**SendGrid Example:**
```typescript
import sgMail from '@sendgrid/mail';

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    await sgMail.send({
      to: options.to,
      from: process.env.FROM_EMAIL || 'noreply@hardhatworkforce.com',
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}
```

### 4. Implement SMS Service

Edit `src/lib/sms-service.ts` and uncomment/implement your provider:

**Twilio Example:**
```typescript
import twilio from 'twilio';

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: options.phoneNumber,
    });
    return true;
  } catch (error) {
    console.error('SMS send failed:', error);
    return false;
  }
}
```

### 5. Update Login Pages

Add a "Forgot Password?" link to your login pages.

Example for `src/app/login/customer/page.tsx`:
```tsx
<Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
  Forgot password?
</Link>
```

### 6. Add Phone Number to Registration

Update registration forms to collect phone numbers (required for SMS reset).

Example for customer registration:
```tsx
<input
  type="tel"
  name="phone"
  placeholder="Phone number (for SMS password reset)"
  required
/>
```

## API Endpoints

### Request Password Reset
```bash
POST /api/auth/forgot-password

Body:
{
  "email": "user@example.com",
  "method": "email" | "sms"
}

Response:
{
  "message": "Password reset email sent",
  "method": "email"
}
```

### Reset Password
```bash
POST /api/auth/reset-password

Body:
{
  "token": "123456",
  "email": "user@example.com",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}

Response:
{
  "message": "Password reset successfully"
}
```

## User Flow

### Email Method:
1. User clicks "Forgot password?" on login page
2. User enters email and selects "Email" option
3. System generates reset code and sends email with reset link
4. Email contains link: `/reset-password?token=xxxxx&email=user@example.com`
5. User clicks link and enters new password
6. System validates token and updates password

### SMS Method:
1. User clicks "Forgot password?" on login page
2. User enters email and selects "SMS" option
3. System generates reset code and sends SMS
4. User manually enters code in reset form
5. User enters new password
6. System validates code and updates password

## Security Considerations

1. **Reset Code Expiration**: Codes expire after 1 hour
2. **One-Time Use**: Reset code is cleared after successful password reset
3. **No User Enumeration**: Response doesn't reveal if email exists
4. **HTTPS Only**: Ensure cookies are secure in production
5. **Password Requirements**: Minimum 8 characters
6. **Bcrypt Hashing**: Passwords are hashed with bcrypt

## Testing

### Development Mode
In development, emails and SMS are logged to console:
```
Email sent to user@example.com: Password Reset Request - Hardhat Workforce
SMS sent to +1234567890: Your Hardhat Workforce password reset code is: 123456
```

### Testing Email Reset
1. Go to `http://localhost:3000/forgot-password`
2. Enter your test user email
3. Select "Email" method
4. Check console for reset link
5. Click the link or manually navigate to `/reset-password?token=...&email=...`
6. Enter new password and confirm
7. Login with new password

### Testing SMS Reset
1. Go to `http://localhost:3000/forgot-password`
2. Enter your test user email
3. Select "SMS" method
4. Check console for reset code
5. Manually navigate to `/reset-password?token=...&email=...` (or create a form for code entry)
6. Enter the code and new password
7. Login with new password

## Production Checklist

- [ ] Implement real email service (SendGrid, AWS SES, etc.)
- [ ] Implement real SMS service (Twilio, AWS SNS, etc.)
- [ ] Update `.env` with production credentials
- [ ] Set `JWT_SECRET` to a secure random string
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Test email delivery with real provider
- [ ] Test SMS delivery with real provider
- [ ] Monitor failed password reset attempts
- [ ] Set up rate limiting for forgot-password endpoint
- [ ] Add user to customer/worker registration form
- [ ] Update privacy policy regarding password resets

## Troubleshooting

### Email not sending
- Verify `SENDGRID_API_KEY` is correct
- Check email provider's dashboard for failures
- Verify `FROM_EMAIL` is a verified sender
- Check application logs for errors

### SMS not sending
- Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- Ensure phone number is in correct format
- Check Twilio account has SMS capability enabled
- Verify `TWILIO_PHONE_NUMBER` is a valid Twilio number

### Reset link not working
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check token hasn't expired (1 hour limit)
- Verify email matches the account email
- Check application logs for validation errors

## Next Steps

1. Implement your email service
2. Implement your SMS service
3. Add phone number collection to registration forms
4. Add "Forgot password?" link to login pages
5. Test both reset methods thoroughly
6. Deploy to production with proper credentials
