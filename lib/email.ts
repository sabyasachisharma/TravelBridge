import nodemailer from 'nodemailer'

const smtpHost = process.env.SMTP_HOST
const smtpPort = parseInt(process.env.SMTP_PORT || '587')
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || 'CarryBridge <noreply@carrybridge.app>'

let transporter: any = null

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })
}

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  if (!transporter) {
    console.warn('⚠️ SMTP not configured. Email not sent:', template.subject)
    return false
  }

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: template.to,
      subject: template.subject,
      html: template.html,
    })
    console.log('✅ Email sent successfully:', template.subject, 'to', template.to)
    return true
  } catch (error) {
    console.error('❌ Email send failed:', error)
    return false
  }
}

/**
 * Send email asynchronously without blocking the response
 * This is a "fire and forget" approach that logs errors but doesn't throw
 */
export function sendEmailAsync(template: EmailTemplate): void {
  // Don't await - let it run in the background
  sendEmail(template)
    .then((success) => {
      if (success) {
        console.log('📧 Async email sent:', template.subject)
      } else {
        console.warn('⚠️ Async email failed:', template.subject)
      }
    })
    .catch((error) => {
      console.error('❌ Async email error:', error)
    })
}

// Email templates
export const emailTemplates = {
  welcomeEmail: (email: string, name: string): EmailTemplate => ({
    to: email,
    subject: 'Welcome to CarryBridge!',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for joining CarryBridge. You can now start posting trips or requesting deliveries.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">Go to CarryBridge</a></p>
    `,
  }),

  emailVerificationEmail: (email: string, name: string, verificationCode: string): EmailTemplate => ({
    to: email,
    subject: '✅ Verify your email - CarryBridge',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0; font-size: 36px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .instructions { background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to CarryBridge!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for signing up! We're excited to have you join our community of travelers and senders.</p>
            <p>To get started and access all features, please verify your email address using the verification code below:</p>
            <div class="code-box">
              ${verificationCode}
            </div>
            <div class="instructions">
              <strong>📝 Instructions:</strong>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Copy the 4-digit code above</li>
                <li>Return to the CarryBridge website</li>
                <li>Enter the code when prompted to verify your email</li>
              </ol>
            </div>
            <div class="warning">
              <strong>⚠️ Important:</strong> You'll need to verify your email to post trips, request deliveries, and access your dashboard.
            </div>
            <p style="font-size: 12px; color: #6b7280;">This code is valid for 24 hours. If you didn't create an account with CarryBridge, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>CarryBridge - Connect. Travel. Deliver.</p>
            <p style="font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  tripPostedEmail: (email: string, travelerName: string, from: string, to: string): EmailTemplate => ({
    to: email,
    subject: 'Your trip has been posted!',
    html: `
      <h2>Trip Posted Successfully</h2>
      <p>Hi ${travelerName},</p>
      <p>Your trip from <strong>${from}</strong> to <strong>${to}</strong> is now live and senders can request deliveries.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View your trips</a></p>
    `,
  }),

  deliveryRequestEmail: (email: string, travelerName: string, itemTitle: string): EmailTemplate => ({
    to: email,
    subject: 'New delivery request received',
    html: `
      <h2>New Delivery Request</h2>
      <p>Hi ${travelerName},</p>
      <p>You have a new delivery request for <strong>${itemTitle}</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Review request</a></p>
    `,
  }),

  requestAcceptedEmail: (email: string, senderName: string, itemTitle: string): EmailTemplate => ({
    to: email,
    subject: 'Your delivery request was accepted!',
    html: `
      <h2>Delivery Request Accepted</h2>
      <p>Hi ${senderName},</p>
      <p>Great news! Your delivery request for <strong>${itemTitle}</strong> has been accepted.</p>
      <p>Payment is handled off-platform. Please confirm the details in your dashboard.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View booking</a></p>
    `,
  }),

  requestDeclinedEmail: (email: string, senderName: string, itemTitle: string): EmailTemplate => ({
    to: email,
    subject: 'Your delivery request was declined',
    html: `
      <h2>Delivery Request Declined</h2>
      <p>Hi ${senderName},</p>
      <p>Unfortunately, your delivery request for <strong>${itemTitle}</strong> was declined.</p>
      <p>You can try requesting with another trip or modify your request.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/trips">Browse trips</a></p>
    `,
  }),

  verificationPendingEmail: (email: string, userName: string): EmailTemplate => ({
    to: email,
    subject: 'Verification documents submitted',
    html: `
      <h2>Verification Pending</h2>
      <p>Hi ${userName},</p>
      <p>Your verification documents have been received and are pending review by our team.</p>
      <p>We'll notify you once the verification is complete.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/verification">Check status</a></p>
    `,
  }),

  verificationApprovedEmail: (email: string, userName: string): EmailTemplate => ({
    to: email,
    subject: 'Verification approved!',
    html: `
      <h2>Verification Approved</h2>
      <p>Hi ${userName},</p>
      <p>Congratulations! Your verification has been approved. Your profile now displays a "Verified" badge.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View profile</a></p>
    `,
  }),

  verificationRejectedEmail: (email: string, userName: string, reason: string): EmailTemplate => ({
    to: email,
    subject: 'Verification rejected',
    html: `
      <h2>Verification Not Approved</h2>
      <p>Hi ${userName},</p>
      <p>Your verification was not approved. Reason: ${reason}</p>
      <p>You can resubmit documents. Please contact support if you have questions.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/verification">Try again</a></p>
    `,
  }),

  bookingStatusEmail: (email: string, userName: string, status: string): EmailTemplate => ({
    to: email,
    subject: `Booking status updated: ${status}`,
    html: `
      <h2>Booking Status Update</h2>
      <p>Hi ${userName},</p>
      <p>Your booking status has been updated to: <strong>${status}</strong></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View booking</a></p>
    `,
  }),

  passwordResetEmail: (email: string, name: string, resetToken: string): EmailTemplate => ({
    to: email,
    subject: '🔐 Reset your password - CarryBridge',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .alert { background: #fecaca; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password for your CarryBridge account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}" class="button">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
              ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}
            </p>
            <div class="warning">
              <strong>⏱️ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <div class="alert">
              <strong>⚠️ Didn't request this?</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged. Your account is safe.
            </div>
          </div>
          <div class="footer">
            <p>CarryBridge - Connect. Carry. Deliver.</p>
            <p style="font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
}
