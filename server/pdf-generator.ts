import PDFDocument from 'pdfkit';
import { Appointment, Patient, Payment, Service } from '@shared/schema';
import { storage } from './storage';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Constants
const BUSINESS_NAME = "Aloha Healing Center";
const BUSINESS_ADDRESS = "123 Palm Avenue, Honolulu, HI 96815";
const BUSINESS_PHONE = "(808) 555-0123";
const BUSINESS_EMAIL = "info@alohahealingcenter.com";
const BUSINESS_WEBSITE = "www.alohahealingcenter.com";

/**
 * Generates an appointment confirmation PDF
 * @param appointment The appointment details
 * @param patient The patient details
 * @param service The service details
 * @returns Path to the generated PDF file
 */
export async function generateAppointmentPDF(appointment: Appointment, patient: Patient, service: Service): Promise<string> {
  // Create a document
  const doc = new PDFDocument({ margin: 50 });
  
  // Create a temporary file path
  const tempDir = os.tmpdir();
  const fileName = `appointment_${appointment.id}_${Date.now()}.pdf`;
  const filePath = path.join(tempDir, fileName);
  
  // Pipe the PDF to a file
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);
  
  // Add business logo and header
  addBusinessHeader(doc);
  
  // Add document title
  doc.fontSize(20)
     .fillColor('#2563eb')
     .text('Appointment Confirmation', { align: 'center' })
     .moveDown(1);

  // Add appointment details
  doc.fontSize(14)
     .fillColor('#000')
     .text('Appointment Details', { underline: true })
     .moveDown(0.5);
     
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  doc.fontSize(12);
  doc.text(`Date: ${formattedDate}`);
  doc.text(`Time: ${appointment.time}`);
  doc.text(`Service: ${service.name}`);
  doc.text(`Duration: ${service.duration} minutes`);
  if (appointment.roomId) {
    const room = await storage.getRoom(appointment.roomId);
    if (room) {
      doc.text(`Room: ${room.name}`);
    }
  }
  doc.moveDown(1);
  
  // Add patient details
  doc.fontSize(14)
     .fillColor('#000')
     .text('Patient Information', { underline: true })
     .moveDown(0.5);
     
  doc.fontSize(12);
  doc.text(`Name: ${patient.name}`);
  doc.text(`Phone: ${patient.phone}`);
  if (patient.email) {
    doc.text(`Email: ${patient.email}`);
  }
  doc.moveDown(1);
  
  // Add service details
  doc.fontSize(14)
     .fillColor('#000')
     .text('Service Description', { underline: true })
     .moveDown(0.5);
     
  doc.fontSize(12);
  doc.text(service.description || 'No description available.');
  doc.moveDown(1);
  
  // Add cancellation policy
  doc.fontSize(14)
     .fillColor('#000')
     .text('Cancellation Policy', { underline: true })
     .moveDown(0.5);
     
  doc.fontSize(12);
  doc.text('Please provide at least 24 hours notice if you need to cancel or reschedule your appointment. ' +
    'Cancellations with less than 24 hours notice may be subject to a cancellation fee.');
  doc.moveDown(1);
  
  // Add footer
  doc.fontSize(10)
     .fillColor('#666')
     .text('Thank you for choosing ' + BUSINESS_NAME + '. We look forward to serving you!', { align: 'center' })
     .moveDown(0.5)
     .text(`For questions or concerns, please contact us at ${BUSINESS_PHONE} or ${BUSINESS_EMAIL}`, { align: 'center' });
  
  // Finalize PDF
  doc.end();
  
  // Wait for the write stream to finish
  await new Promise<void>((resolve) => {
    writeStream.on('finish', () => {
      resolve();
    });
  });
  
  return filePath;
}

/**
 * Generates an invoice PDF for a payment
 * @param payment The payment details
 * @param patient The patient details
 * @param appointment The appointment details
 * @param service The service details
 * @returns Path to the generated PDF file
 */
export async function generateInvoicePDF(
  payment: Payment, 
  patient: Patient, 
  appointment: Appointment, 
  service: Service
): Promise<string> {
  // Create a document
  const doc = new PDFDocument({ margin: 50 });
  
  // Create a temporary file path
  const tempDir = os.tmpdir();
  const fileName = `invoice_${payment.id}_${Date.now()}.pdf`;
  const filePath = path.join(tempDir, fileName);
  
  // Pipe the PDF to a file
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);
  
  // Add business logo and header
  addBusinessHeader(doc);
  
  // Add document title
  doc.fontSize(24)
     .fillColor('#2563eb')
     .text('INVOICE', { align: 'center' })
     .moveDown(1);

  // Add invoice details
  const invoiceDate = new Date(payment.date || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Generate invoice number from payment id
  const invoiceNumber = `INV-${payment.id.toString().padStart(6, '0')}`;
  
  // Create a table-like structure for invoice details
  doc.fontSize(12).fillColor('#333');
  
  // Left side - Customer information
  const customerY = doc.y;
  doc.text('Bill To:', { continued: true })
     .font('Helvetica-Bold')
     .text(` ${patient.name}`)
     .font('Helvetica')
     .moveDown(0.3);
     
  if (patient.email) {
    doc.text(`Email: ${patient.email}`).moveDown(0.3);
  }
  if (patient.phone) {
    doc.text(`Phone: ${patient.phone}`).moveDown(0.3);
  }
  
  // Right side - Invoice information
  doc.moveUp(3);
  const rightColX = 350;
  
  doc.text('Invoice Number:', rightColX, customerY, { continued: true, width: 200 })
     .font('Helvetica-Bold')
     .text(` ${invoiceNumber}`, { align: 'right' })
     .font('Helvetica')
     .moveDown(0.3);
     
  doc.text('Date:', rightColX, doc.y, { continued: true, width: 200 })
     .text(` ${invoiceDate}`, { align: 'right' })
     .moveDown(0.3);
     
  doc.text('Payment Status:', rightColX, doc.y, { continued: true, width: 200 })
     .font('Helvetica-Bold')
     .fillColor(payment.status === 'completed' ? '#16a34a' : '#dc2626')
     .text(` ${payment.status.toUpperCase()}`, { align: 'right' })
     .fillColor('#333')
     .font('Helvetica')
     .moveDown(1.5);
  
  // Line items table
  const tableTop = doc.y + 10;
  doc.moveTo(50, tableTop)
     .lineTo(550, tableTop)
     .stroke();
  
  // Table headers
  doc.font('Helvetica-Bold');
  doc.fontSize(10);
  doc.text('Description', 60, tableTop + 10, { width: 240 });
  doc.text('Date', 300, tableTop + 10, { width: 80 });
  doc.text('Amount', 480, tableTop + 10, { align: 'right' });
  
  doc.moveTo(50, tableTop + 25)
     .lineTo(550, tableTop + 25)
     .stroke();
  
  // Table content
  doc.font('Helvetica');
  const serviceDate = new Date(appointment.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const lineItemY = tableTop + 35;
  doc.text(service.name, 60, lineItemY, { width: 240 });
  doc.text(serviceDate, 300, lineItemY, { width: 80 });
  doc.text(`$${payment.amount}`, 480, lineItemY, { align: 'right' });
  
  // Totals section
  const totalsY = lineItemY + 40;
  
  doc.moveTo(350, totalsY)
     .lineTo(550, totalsY)
     .stroke();
     
  doc.text('Total:', 400, totalsY + 10, { width: 80 });
  doc.font('Helvetica-Bold')
     .text(`$${payment.amount}`, 480, totalsY + 10, { align: 'right' });
  
  doc.moveTo(350, totalsY + 25)
     .lineTo(550, totalsY + 25)
     .stroke();
  
  // Payment information
  doc.moveDown(3);
  const paymentY = doc.y;
  
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .text('Payment Information', 50, paymentY);
  
  doc.font('Helvetica')
     .fontSize(10)
     .moveDown(0.5);
  
  doc.text(`Payment Method: ${payment.paymentMethod.replace(/^\w/, c => c.toUpperCase())}`);
  if (payment.transactionId) {
    doc.text(`Transaction ID: ${payment.transactionId}`);
  }
  if (payment.stripePaymentIntentId) {
    doc.text(`Stripe Payment ID: ${payment.stripePaymentIntentId}`);
  }
  
  // Add notes
  doc.moveDown(1.5);
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Thank you for your business!', { align: 'center' })
     .font('Helvetica')
     .fontSize(10)
     .moveDown(0.5)
     .text('This is an electronically generated invoice and does not require a signature.', { align: 'center' });
  
  // Add footer
  doc.fontSize(9)
     .fillColor('#666')
     .text(BUSINESS_NAME, 50, 700, { align: 'center', width: 500 })
     .moveDown(0.3)
     .text(`${BUSINESS_ADDRESS} | ${BUSINESS_PHONE} | ${BUSINESS_EMAIL}`, { align: 'center', width: 500 })
     .moveDown(0.3)
     .text(BUSINESS_WEBSITE, { align: 'center', width: 500 });
  
  // Finalize PDF
  doc.end();
  
  // Wait for the write stream to finish
  await new Promise<void>((resolve) => {
    writeStream.on('finish', () => {
      resolve();
    });
  });
  
  return filePath;
}

/**
 * Helper function to add business header to PDFs
 */
function addBusinessHeader(doc: PDFKit.PDFDocument): void {
  // Add business name
  doc.fontSize(20)
     .fillColor('#0f172a')
     .text(BUSINESS_NAME, { align: 'center' })
     .moveDown(0.3);
  
  // Add business details
  doc.fontSize(10)
     .fillColor('#64748b')
     .text(BUSINESS_ADDRESS, { align: 'center' })
     .moveDown(0.2)
     .text(`Phone: ${BUSINESS_PHONE} | Email: ${BUSINESS_EMAIL}`, { align: 'center' })
     .moveDown(0.2)
     .text(BUSINESS_WEBSITE, { align: 'center' })
     .moveDown(1.5);
  
  // Add divider
  doc.strokeColor('#e2e8f0')
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(doc.page.width - 50, doc.y)
     .stroke()
     .moveDown(1);
}