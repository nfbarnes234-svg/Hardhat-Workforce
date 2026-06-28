// Email service for sending password reset emails
// Configure with your email provider (SendGrid, Mailgun, AWS SES, etc.)

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // TODO: Implement with your email provider
    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to: options.to,
      from: process.env.FROM_EMAIL || 'noreply@hardhatworkforce.com',
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    */
    
    // For development, just log
    console.log(`Email sent to ${options.to}:`, options.subject);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

export function generatePasswordResetEmailHTML(
  resetLink: string,
  userName: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>If you didn't request a password reset, you can ignore this email.</p>
            <p>Best regards,<br>Hardhat Workforce Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
