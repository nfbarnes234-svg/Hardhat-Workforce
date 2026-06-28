// SMS service for sending password reset codes
// Configure with your SMS provider (Twilio, AWS SNS, etc.)

export interface SMSOptions {
  phoneNumber: string;
  message: string;
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    // TODO: Implement with your SMS provider
    // Example with Twilio:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.phoneNumber,
    });
    */
    
    // For development, just log
    console.log(`SMS sent to ${options.phoneNumber}:`, options.message);
    return true;
  } catch (error) {
    console.error('SMS send failed:', error);
    return false;
  }
}

export function generateSMSResetCode(): string {
  // Generate a 6-digit random code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSMSMessage(code: string): string {
  return `Your Hardhat Workforce password reset code is: ${code}. This code expires in 1 hour. Do not share this code with anyone.`;
}
