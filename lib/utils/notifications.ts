import { getRandomCopy } from '@/lib/copywriting'

export interface NotificationData {
  type: 'overspending' | 'subscriptionReminder' | 'savingsSuccess' | 'budgetWarning'
  message: string
  severity: 'info' | 'warning' | 'success' | 'error'
}

export function generateNotification(
  type: NotificationData['type'],
  customData?: Record<string, any>
): NotificationData {
  let message = ''
  let severity: NotificationData['severity'] = 'info'

  switch (type) {
    case 'overspending':
      message = getRandomCopy('notifications', 'overspending')
      severity = 'error'
      break
    case 'subscriptionReminder':
      message = getRandomCopy('notifications', 'subscriptionReminder')
      severity = 'warning'
      break
    case 'savingsSuccess':
      message = getRandomCopy('notifications', 'savingsSuccess')
      severity = 'success'
      break
    case 'budgetWarning':
      message = getRandomCopy('notifications', 'budgetWarning')
      severity = 'warning'
      break
  }

  // Replace placeholders if custom data provided
  if (customData) {
    Object.entries(customData).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value))
    })
  }

  return { type, message, severity }
}

// Email notification helper (would integrate with email service)
export async function sendEmailNotification(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  // This would integrate with an email service like Resend, SendGrid, etc.
  // For now, just log it
  console.log('Email notification:', { to, subject, body })
  
  // Example implementation:
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to, subject, body }),
  // })
}

