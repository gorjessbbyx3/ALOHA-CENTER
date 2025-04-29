import nodemailer from "nodemailer";
import { Appointment, Payment } from "@shared/schema";

// Create a test account for development if no SMTP credentials
// For production, use real SMTP server credentials via environment variables
const configureTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // For development use Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    console.log("Created test email account:", testAccount.user);
    
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// Format date and time for emails
const formatDateTime = (date: Date | string, time: string) => {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return `${formattedDate} at ${time}`;
};

// Send appointment confirmation email
export const sendAppointmentConfirmation = async (
  email: string,
  name: string,
  appointment: Appointment
) => {
  try {
    const transporter = await configureTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"MediBook Clinic" <appointments@medibook.com>',
      to: email,
      subject: "Your Appointment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 5px;">MediBook Clinic</h1>
            <p style="color: #6b7280; font-size: 16px;">Appointment Confirmation</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; color: #374151;">Dear ${name},</p>
            <p style="font-size: 16px; color: #374151;">Your appointment has been scheduled for:</p>
            <p style="font-size: 18px; font-weight: bold; color: #1e40af; margin: 15px 0; text-align: center;">
              ${formatDateTime(appointment.date, appointment.time)}
            </p>
            <p style="font-size: 16px; color: #374151;">Please arrive 15 minutes before your scheduled time.</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
            <h3 style="color: #4b5563; margin-top: 0;">Appointment Details:</h3>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Appointment ID:</strong> #A-${appointment.id}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Duration:</strong> ${appointment.duration} minutes</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Status:</strong> ${appointment.status}</p>
            ${appointment.notes ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
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
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Appointment confirmation email sent:", info.messageId);
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error("Error sending appointment confirmation email:", error);
    throw error;
  }
};

// Send payment receipt email
export const sendPaymentReceipt = async (
  email: string,
  name: string,
  payment: Payment
) => {
  try {
    const transporter = await configureTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"MediBook Clinic" <billing@medibook.com>',
      to: email,
      subject: "Payment Receipt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 5px;">MediBook Clinic</h1>
            <p style="color: #6b7280; font-size: 16px;">Payment Receipt</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; color: #374151;">Dear ${name},</p>
            <p style="font-size: 16px; color: #374151;">Thank you for your payment. This email confirms that your payment has been processed successfully.</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
            <h3 style="color: #4b5563; margin-top: 0;">Payment Details:</h3>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Payment ID:</strong> #P-${payment.id}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Amount:</strong> $${Number(payment.amount).toFixed(2)}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Date:</strong> ${new Date(payment.date).toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Status:</strong> ${payment.status}</p>
            ${payment.transactionId ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Transaction ID:</strong> ${payment.transactionId}</p>` : ''}
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
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Payment receipt email sent:", info.messageId);
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error("Error sending payment receipt email:", error);
    throw error;
  }
};
