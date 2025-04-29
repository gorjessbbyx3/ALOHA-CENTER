import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import nodemailer from "nodemailer";
import { appointments, insertAppointmentSchema, insertPatientSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";
import { sendAppointmentConfirmation, sendPaymentReceipt } from "./email";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable. Payment processing will not work correctly.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
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
      const appointments = await storage.getAppointmentsByDate(date);
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
        const patient = await storage.getPatient(appointment.patientId);
        if (patient && patient.email) {
          await sendAppointmentConfirmation(patient.email, patient.name, appointment);
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
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: "usd",
        metadata: {
          appointmentId: appointmentId.toString(),
          patientId: patientId.toString(),
        },
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
        const patient = await storage.getPatient(payment.patientId);
        if (patient && patient.email) {
          await sendPaymentReceipt(patient.email, patient.name, payment);
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

  const httpServer = createServer(app);
  return httpServer;
}
