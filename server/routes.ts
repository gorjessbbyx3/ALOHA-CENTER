import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import nodemailer from "nodemailer";
import { appointments, insertAppointmentSchema, insertPatientSchema, insertPaymentSchema, services, users, rooms } from "@shared/schema";
import { z } from "zod";
import { sendAppointmentConfirmation, sendPaymentReceipt } from "./email";
import { db } from "./db";
import { generateAppointmentPDF, generateInvoicePDF } from "./pdf-generator";
import fs from "fs";
import path from "path";
import * as stripeService from "./stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable. Payment processing will not work correctly.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any, // Type casting to any to avoid version mismatch errors
    })
  : null;

// Function to seed initial data
async function seedInitialData() {
  console.log("Checking if initial data needs to be seeded...");
  
  // Check if we have any services
  const existingServices = await db.select().from(services);
  
  if (existingServices.length === 0) {
    console.log("Seeding initial services data...");
    
    // Seed services
    await db.insert(services).values([
      { name: "General Consultation", description: "Regular checkup", duration: 30, price: "50" },
      { name: "Follow-up Visit", description: "Follow-up appointment", duration: 15, price: "30" },
      { name: "Physical Examination", description: "Complete physical", duration: 60, price: "120" },
      { name: "Vaccination", description: "Various vaccines", duration: 15, price: "40" },
      { name: "Lab Work", description: "Blood work and tests", duration: 30, price: "80" }
    ]);
  }
  
  // Check if we have admin user
  const existingUsers = await db.select().from(users);
  
  if (existingUsers.length === 0) {
    console.log("Seeding initial admin user...");
    
    // Create admin user
    await db.insert(users).values({
      username: "admin",
      password: "password123", // In a real app, this would be hashed
      email: "admin@medibook.com",
      name: "Dr. Sarah Chen",
      role: "admin"
    });
  }
  
  console.log("Initial data seeding complete");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed initial rooms
  try {
    const existingRooms = await db.select().from(rooms);
    
    if (existingRooms.length === 0) {
      console.log("Seeding initial rooms data...");
      
      // Seed rooms
      await db.insert(rooms).values([
        { name: "Room 101", description: "Main treatment room", capacity: 1, isActive: true },
        { name: "Room 102", description: "Secondary treatment room", capacity: 1, isActive: true },
        { name: "Room 103", description: "Consultation room", capacity: 2, isActive: true },
        { name: "Room 104", description: "Deluxe room", capacity: 1, isActive: true },
      ]);
    }
  } catch (error) {
    console.error("Error seeding rooms:", error);
  }
  
  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const rooms = await storage.getRooms(activeOnly);
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all patients
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get specific patient
  app.get("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create patient
  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid patient data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get appointments by date
  app.get("/api/appointments", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const roomId = req.query.roomId ? parseInt(req.query.roomId as string) : undefined;
      
      let appointments;
      
      if (roomId) {
        appointments = await storage.getAppointmentsByRoom(roomId, date);
      } else {
        appointments = await storage.getAppointmentsByDate(date);
      }
      
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get specific appointment
  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      
      // Send email confirmation if patient has email
      try {
        if (appointment.patientId) {
          const patient = await storage.getPatient(appointment.patientId);
          if (patient && patient.email) {
            await sendAppointmentConfirmation(patient.email, patient.name, appointment);
          }
        }
      } catch (emailError) {
        console.error("Failed to send email confirmation:", emailError);
      }
      
      res.status(201).json(appointment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid appointment data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update appointment
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const appointmentData = req.body;
      const updatedAppointment = await storage.updateAppointment(id, appointmentData);
      res.json(updatedAppointment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Cancel appointment
  app.post("/api/appointments/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const canceledAppointment = await storage.cancelAppointment(id);
      res.json(canceledAppointment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get payments
  app.get("/api/payments", async (req, res) => {
    try {
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const appointmentId = req.query.appointmentId ? parseInt(req.query.appointmentId as string) : undefined;
      
      let payments = [];
      if (patientId) {
        payments = await storage.getPaymentsByPatient(patientId);
      } else if (appointmentId) {
        payments = await storage.getPaymentsByAppointment(appointmentId);
      } else {
        return res.status(400).json({ message: "Must provide patientId or appointmentId" });
      }
      
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Stripe payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }
    
    try {
      const { amount, appointmentId, patientId } = req.body;
      
      if (!amount || !appointmentId || !patientId) {
        return res.status(400).json({ 
          message: "Missing required fields: amount, appointmentId, and patientId are required" 
        });
      }
      
      // Make sure appointmentId and patientId exist
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount, // Amount should already be in cents from the client
        currency: "usd",
        metadata: {
          appointmentId: appointmentId.toString(),
          patientId: patientId.toString(),
          patientName: patient.name
        },
        description: `Payment for appointment #${appointmentId} - ${patient.name}`,
      });
      
      // Log the payment intent creation
      await storage.createActivity({
        type: "payment_intent_created",
        description: `Created payment intent for $${(amount / 100).toFixed(2)} - Appointment #${appointmentId}`,
        entityId: appointmentId,
        entityType: "appointment"
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating payment intent", 
        error: error.message 
      });
    }
  });
  
  // Record payment
  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      
      // Send payment receipt if patient has email
      try {
        if (payment.patientId) {
          const patient = await storage.getPatient(payment.patientId);
          if (patient && patient.email) {
            await sendPaymentReceipt(patient.email, patient.name, payment);
          }
        }
      } catch (emailError) {
        console.error("Failed to send payment receipt:", emailError);
      }
      
      res.status(201).json(payment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid payment data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // Handle Stripe payment success/confirmation
  app.post("/api/record-payment", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }
    
    try {
      const { paymentIntentId, status } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Missing payment intent ID" });
      }
      
      // Retrieve the payment intent from Stripe to verify
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (!paymentIntent || !paymentIntent.metadata.appointmentId || !paymentIntent.metadata.patientId) {
        return res.status(400).json({ message: "Invalid payment intent or missing metadata" });
      }
      
      const appointmentId = parseInt(paymentIntent.metadata.appointmentId);
      const patientId = parseInt(paymentIntent.metadata.patientId);
      
      // Create a payment record in our system
      const payment = await storage.createPayment({
        appointmentId,
        patientId,
        amount: (paymentIntent.amount / 100).toString(), // Convert cents to dollars
        paymentMethod: "credit_card",
        status: status || "completed",
        transactionId: paymentIntentId,
        stripePaymentIntentId: paymentIntentId
      });
      
      // Log the activity
      await storage.createActivity({
        type: "payment_received",
        description: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} received for Appointment #${appointmentId}`,
        entityId: appointmentId,
        entityType: "appointment"
      });
      
      // If we have a patient email, send a receipt and generate PDF
      try {
        const patient = await storage.getPatient(patientId);
        const appointment = await storage.getAppointment(appointmentId);
        
        if (patient && patient.email) {
          await sendPaymentReceipt(patient.email, patient.name, payment);
        }
        
        // Generate PDF invoice in background
        if (appointment && patient && appointment.serviceId) {
          const service = await storage.getService(appointment.serviceId);
          if (service) {
            generateInvoicePDF(payment, patient, appointment, service)
              .then((pdfPath) => {
                console.log(`Invoice PDF generated: ${pdfPath}`);
                // Store PDF path for retrieval later if needed
                storage.updatePayment(payment.id, { 
                  invoicePdfPath: pdfPath 
                }).catch(err => console.error("Error updating payment with PDF path:", err));
              })
              .catch(err => console.error("Error generating invoice PDF:", err));
          }
        }
      } catch (emailError) {
        console.error("Failed to send payment receipt or generate PDF:", emailError);
      }
      
      res.status(200).json({ success: true, payment });
    } catch (error: any) {
      console.error("Error recording payment:", error);
      res.status(500).json({ 
        message: "Error recording payment", 
        error: error.message 
      });
    }
  });

  // Get recent activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Generate appointment confirmation PDF
  app.get("/api/appointments/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const patient = appointment.patientId 
        ? await storage.getPatient(appointment.patientId) 
        : null;
        
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const service = appointment.serviceId 
        ? await storage.getService(appointment.serviceId)
        : null;
        
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const pdfPath = await generateAppointmentPDF(appointment, patient, service);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=appointment_${id}.pdf`);
      
      // Send the file
      fs.createReadStream(pdfPath).pipe(res);
      
      // Delete the file after sending
      res.on('finish', () => {
        fs.unlink(pdfPath, (err) => {
          if (err) console.error(`Error deleting temporary PDF: ${err}`);
        });
      });
    } catch (error: any) {
      console.error("Error generating appointment PDF:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Generate invoice PDF
  app.get("/api/payments/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // If we already have a PDF path and it exists, send that file
      if (payment.invoicePdfPath && fs.existsSync(payment.invoicePdfPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${id}.pdf`);
        return fs.createReadStream(payment.invoicePdfPath).pipe(res);
      }
      
      // Otherwise, generate a new PDF
      const patient = payment.patientId 
        ? await storage.getPatient(payment.patientId)
        : null;
        
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const appointment = payment.appointmentId
        ? await storage.getAppointment(payment.appointmentId)
        : null;
        
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const service = appointment.serviceId
        ? await storage.getService(appointment.serviceId)
        : null;
        
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const pdfPath = await generateInvoicePDF(payment, patient, appointment, service);
      
      // Update payment with PDF path
      await storage.updatePayment(payment.id, { invoicePdfPath: pdfPath });
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_${id}.pdf`);
      
      // Send the file
      fs.createReadStream(pdfPath).pipe(res);
    } catch (error: any) {
      console.error("Error generating invoice PDF:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
