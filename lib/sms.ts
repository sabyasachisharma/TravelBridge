/**
 * SMS Service using Brevo (formerly Sendinblue) Transactional SMS API
 * Documentation: https://developers.brevo.com/docs/transactional-sms-endpoints
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'CarryBridge'

export interface SMSOptions {
  recipient: string // Phone number in E.164 format (e.g., +1234567890)
  message: string
}

/**
 * Send SMS via Brevo Transactional SMS API
 * @param options SMS options containing recipient and message
 * @returns Promise<boolean> - true if SMS was sent successfully
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn('⚠️ Brevo API key not configured. SMS not sent to:', options.recipient)
    return false
  }

  // Validate phone number format (should be E.164 format with +)
  if (!options.recipient.startsWith('+')) {
    console.error('❌ Invalid phone number format. Must be in E.164 format (e.g., +1234567890)')
    return false
  }

  // Brevo API requires phone number WITHOUT the + prefix
  // Also remove any spaces or dashes
  const recipientNumber = options.recipient.replace(/^\+/, '').replace(/[\s-]/g, '')

  // Validate sender name length (max 11 alphanumeric or 15 numeric)
  let senderName = BREVO_SENDER_NAME
  if (senderName.length > 11) {
    console.warn(`⚠️ Sender name "${senderName}" exceeds 11 characters. Truncating...`)
    senderName = senderName.substring(0, 11)
  }

  // Validate recipient is numeric only (country code + number)
  if (!/^\d+$/.test(recipientNumber)) {
    console.error('❌ Invalid recipient format. Must be numeric only (country code + number):', recipientNumber)
    return false
  }

  try {
    const requestBody: any = {
      sender: senderName,
      recipient: recipientNumber, // Remove + prefix and spaces for Brevo
      content: options.message,
      type: 'transactional', // Required: 'transactional' for OTP/verification, 'marketing' for promotions
    }

    console.log('📱 Sending SMS via Brevo:', {
      sender: senderName,
      recipientE164: options.recipient,
      recipientBrevo: recipientNumber,
      recipientLength: recipientNumber.length,
      messageLength: options.message.length,
      hasApiKey: !!BREVO_API_KEY,
      requestBody: JSON.stringify(requestBody),
    })

    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/send', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📱 Brevo API Response Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Unknown error' }
      }
      
      console.error('❌ Brevo SMS API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        recipient: options.recipient,
        recipientFormatted: recipientNumber,
        sender: senderName,
      })
      
      // Log detailed error message for debugging
      if (errorData.message) {
        console.error('❌ Brevo Error Message:', errorData.message)
      }
      if (errorData.error) {
        console.error('❌ Brevo Error Details:', errorData.error)
      }
      
      return false
    }

    const data = await response.json()
    console.log('✅ SMS sent successfully via Brevo to:', options.recipient)
    console.log('📱 Brevo response:', data)
    if (data.messageId) {
      console.log('📱 Message ID:', data.messageId)
    }
    return true
  } catch (error: any) {
    console.error('❌ SMS send failed:', {
      error: error.message,
      stack: error.stack,
      recipient: options.recipient,
    })
    return false
  }
}

/**
 * Send SMS asynchronously without blocking the response
 * This is a "fire and forget" approach that logs errors but doesn't throw
 */
export function sendSMSAsync(options: SMSOptions): void {
  // Don't await - let it run in the background
  sendSMS(options)
    .then((success) => {
      if (success) {
        console.log('📱 Async SMS sent to:', options.recipient)
      } else {
        console.warn('⚠️ Async SMS failed to:', options.recipient)
      }
    })
    .catch((error) => {
      console.error('❌ Async SMS error:', error)
    })
}

/**
 * Send OTP code via SMS
 * @param phoneNumber Phone number in E.164 format
 * @param code 6-digit verification code
 * @returns Promise<boolean> - true if SMS was sent successfully
 */
export async function sendOTP(phoneNumber: string, code: string): Promise<boolean> {
  const message = `Your CarryBridge verification code is: ${code}. Valid for 10 minutes. Do not share this code with anyone.`
  return sendSMS({ recipient: phoneNumber, message })
}

/**
 * Send OTP code asynchronously
 */
export function sendOTPAsync(phoneNumber: string, code: string): void {
  const message = `Your CarryBridge verification code is: ${code}. Valid for 10 minutes. Do not share this code with anyone.`
  sendSMSAsync({ recipient: phoneNumber, message })
}

