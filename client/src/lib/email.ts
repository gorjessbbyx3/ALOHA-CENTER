/**
 * Library for email-related utilities and formatting
 * Used for email templates, validation, and formatting
 */

/**
 * Format a patient name for email salutation
 * @param name Patient's full name
 * @returns Formatted name for salutation
 */
export function formatSalutation(name: string): string {
  if (!name) return "Patient";
  
  // Extract first name if there are multiple parts
  const nameParts = name.trim().split(" ");
  return nameParts[0];
}

/**
 * Generate HTML for appointment confirmation email body
 * @param patientName Patient's name
 * @param date Appointment date
 * @param time Appointment time
 * @param duration Appointment duration in minutes
 * @param serviceName Service name/type
 * @param notes Optional appointment notes
 * @returns HTML string for email body
 */
export function generateAppointmentEmailHtml(
  patientName: string,
  date: string,
  time: string,
  duration: number,
  serviceName: string,
  notes?: string
): string {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin-bottom: 5px;">MediBook Clinic</h1>
        <p style="color: #6b7280; font-size: 16px;">Appointment Confirmation</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; color: #374151;">Dear ${formatSalutation(patientName)},</p>
        <p style="font-size: 16px; color: #374151;">Your appointment has been scheduled for:</p>
        <p style="font-size: 18px; font-weight: bold; color: #1e40af; margin: 15px 0; text-align: center;">
          ${formattedDate} at ${time}
        </p>
        <p style="font-size: 16px; color: #374151;">Please arrive 15 minutes before your scheduled time.</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
        <h3 style="color: #4b5563; margin-top: 0;">Appointment Details:</h3>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Service:</strong> ${serviceName}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Duration:</strong> ${duration} minutes</p>
        ${notes ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Notes:</strong> ${notes}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 25px;">
        <h3 style="color: #4b5563;">Need to make changes?</h3>
        <p style="color: #4b5563;">To reschedule or cancel your appointment, please call our office at (555) 123-4567 or reply to this email.</p>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">MediBook Clinic</p>
        <p style="color: #6b7280; font-size: 14px;">123 Medical Center Dr, Healthcare City, HC 12345</p>
        <p style="color: #6b7280; font-size: 14px;">(555) 123-4567 | info@medibook.com</p>
      </div>
    </div>
  `;
}

/**
 * Generate HTML for payment receipt email body
 * @param patientName Patient's name
 * @param amount Payment amount
 * @param paymentMethod Payment method used
 * @param date Payment date
 * @param transactionId Transaction ID or reference
 * @returns HTML string for email body
 */
export function generatePaymentReceiptHtml(
  patientName: string,
  amount: number,
  paymentMethod: string,
  date: string,
  transactionId?: string
): string {
  const formattedDate = new Date(date).toLocaleDateString();
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin-bottom: 5px;">MediBook Clinic</h1>
        <p style="color: #6b7280; font-size: 16px;">Payment Receipt</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; color: #374151;">Dear ${formatSalutation(patientName)},</p>
        <p style="font-size: 16px; color: #374151;">Thank you for your payment. This email confirms that your payment has been processed successfully.</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
        <h3 style="color: #4b5563; margin-top: 0;">Payment Details:</h3>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Date:</strong> ${formattedDate}</p>
        ${transactionId ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 25px;">
        <h3 style="color: #4b5563;">Questions about your bill?</h3>
        <p style="color: #4b5563;">If you have any questions regarding your payment, please contact our billing department at (555) 123-4567 or billing@medibook.com.</p>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">MediBook Clinic</p>
        <p style="color: #6b7280; font-size: 14px;">123 Medical Center Dr, Healthcare City, HC 12345</p>
        <p style="color: #6b7280; font-size: 14px;">(555) 123-4567 | info@medibook.com</p>
      </div>
    </div>
  `;
}

/**
 * Generate HTML for appointment reminder email body
 * @param patientName Patient's name
 * @param date Appointment date
 * @param time Appointment time
 * @param serviceName Service name/type
 * @returns HTML string for email body
 */
export function generateAppointmentReminderHtml(
  patientName: string,
  date: string,
  time: string,
  serviceName: string
): string {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin-bottom: 5px;">MediBook Clinic</h1>
        <p style="color: #6b7280; font-size: 16px;">Appointment Reminder</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; color: #374151;">Dear ${formatSalutation(patientName)},</p>
        <p style="font-size: 16px; color: #374151;">This is a friendly reminder of your upcoming appointment:</p>
        <p style="font-size: 18px; font-weight: bold; color: #1e40af; margin: 15px 0; text-align: center;">
          ${formattedDate} at ${time}
        </p>
        <p style="font-size: 16px; color: #374151;">Service: ${serviceName}</p>
        <p style="font-size: 16px; color: #374151;">Please arrive 15 minutes before your scheduled time.</p>
      </div>
      
      <div style="margin-bottom: 25px;">
        <h3 style="color: #4b5563;">Need to reschedule?</h3>
        <p style="color: #4b5563;">If you need to reschedule or cancel your appointment, please call our office at (555) 123-4567 at least 24 hours in advance.</p>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">MediBook Clinic</p>
        <p style="color: #6b7280; font-size: 14px;">123 Medical Center Dr, Healthcare City, HC 12345</p>
        <p style="color: #6b7280; font-size: 14px;">(555) 123-4567 | info@medibook.com</p>
      </div>
    </div>
  `;
}

/**
 * Validate email address format
 * @param email Email address to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format a phone number for SMS
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneForSMS(phone: string): string {
  // Remove all non-numeric characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Ensure it has country code for US numbers
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  
  // If already has country code or other format, return as is
  return `+${digitsOnly}`;
}

/**
 * Generate plain text message for SMS appointment reminder
 * @param patientName Patient's name
 * @param date Appointment date
 * @param time Appointment time
 * @returns Plain text message for SMS
 */
export function generateAppointmentSMS(
  patientName: string,
  date: string,
  time: string
): string {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  
  return `REMINDER: ${formatSalutation(patientName)}, you have an appointment at MediBook Clinic on ${formattedDate} at ${time}. Please arrive 15 min early. To cancel, call (555) 123-4567.`;
}
