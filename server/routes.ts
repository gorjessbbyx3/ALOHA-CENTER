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
import calendlyService from "./calendly";

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
      { name: "Lab Work", description: "Blood work and tests", duration: 30, price: "80" },
      { name: "Group Light Therapy (2hr)", description: "2-hour light therapy session in our group room", duration: 120, price: "60" },
      { name: "Private Light Therapy (2hr)", description: "2-hour light therapy session in a private room", duration: 120, price: "100" },
      { name: "Private Light Therapy with Pet (2hr)", description: "2-hour light therapy session in a private room with your pet", duration: 120, price: "120" },
      { name: "Reiki Session (30min)", description: "30-minute Reiki energy healing session in a private room", duration: 30, price: "100" }
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
  
  // Check if we have treatment packages
  try {
    const treatmentPackages = pgTable("treatment_packages", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      displayName: text("display_name").notNull(),
      description: text("description"),
      focus: text("focus"),
      idealFor: text("ideal_for"),
      duration: text("duration"),
      sessionType: text("session_type"),
      sessionCount: integer("session_count"),
      sessionCost: numeric("session_cost"),
      totalCost: numeric("total_cost"),
      addOns: text("add_ons"),
      bonuses: text("bonuses"),
      active: boolean("active").default(true),
      category: text("category").default("standard"),
      packageType: text("package_type"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
    });
    
    const existingPackages = await db.select().from(treatmentPackages);
    
    if (existingPackages.length === 0) {
      console.log("Seeding treatment packages...");
      
      // Seed treatment packages
      await db.insert(treatmentPackages).values([
        {
          name: "senior_wellness",
          displayName: "Kupuna Light Vitality",
          description: "Senior Wellness Plan for ages 65+",
          focus: "Cellular support, circulation, mood, and joint wellness",
          idealFor: "Seniors ages 65+",
          duration: "4 weeks (2x per week)",
          sessionType: "Group or private light sessions (2 hours each)",
          sessionCount: 8,
          sessionCost: "45",
          totalCost: "360",
          addOns: "+$25 for Reiki energy session (30 min)",
          bonuses: "Includes 1 free wellness check-in and comfort mat rental",
          category: "senior",
          packageType: "group"
        },
        {
          name: "pet_wellness",
          displayName: "Companion Frequency Care",
          description: "Pet Wellness Plan for pets with health issues",
          focus: "Pet recovery, calmness, aging support",
          idealFor: "Pets with stress, mobility issues, or degenerative conditions",
          duration: "3 weeks (1–2x per week)",
          sessionType: "Private light session with owner",
          sessionCount: 6,
          sessionCost: "120",
          totalCost: "720",
          addOns: "Base Rate: $100 (2hr private) + $20 pet add-on",
          bonuses: "Includes Pet Energy Field Guide + follow-up check-in",
          category: "pet",
          packageType: "private"
        },
        {
          name: "couples_harmony",
          displayName: "Together in the Light",
          description: "Couples Harmony Plan for partners",
          focus: "Shared emotional reset, grounding, and connection",
          idealFor: "Couples, partners, or close friends",
          duration: "2x per week for 3 weeks",
          sessionType: "Private 2-hour light session (shared recliners or mats)",
          sessionCount: 6,
          sessionCost: "150",
          totalCost: "900",
          addOns: null,
          bonuses: "10% off single reiki add-ons for each person",
          category: "couples",
          packageType: "private"
        },
        {
          name: "general_healing_group",
          displayName: "Regenerate & Recharge (Group)",
          description: "General Healing Plan with group sessions",
          focus: "Stress relief, energy, cellular detox",
          idealFor: "First-timers or long-term support seekers",
          duration: "Flexible — 1 to 2x per week for 6 weeks",
          sessionType: "Group session",
          sessionCount: 8,
          sessionCost: "60",
          totalCost: "480",
          addOns: null,
          bonuses: "Free detox guide PDF + optional support call",
          category: "general",
          packageType: "group"
        },
        {
          name: "general_healing_private",
          displayName: "Regenerate & Recharge (Private)",
          description: "General Healing Plan with private sessions",
          focus: "Stress relief, energy, cellular detox",
          idealFor: "First-timers or long-term support seekers",
          duration: "Flexible — 1 to 2x per week for 6 weeks",
          sessionType: "Private session",
          sessionCount: 6,
          sessionCost: "100",
          totalCost: "600",
          addOns: null,
          bonuses: "Free detox guide PDF + optional support call",
          category: "general",
          packageType: "private"
        },
        {
          name: "veteran_plan",
          displayName: "Restorative Light Path",
          description: "Veteran Plan with custom schedule",
          focus: "Custom based on client needs",
          idealFor: "Veterans with specific healing needs",
          duration: "Custom schedule based on client intake",
          sessionType: "Private sessions",
          sessionCount: null,
          sessionCost: null,
          totalCost: null,
          addOns: "Sliding scale pricing available",
          bonuses: "Includes: Intake consult + wellness support materials",
          category: "veteran",
          packageType: "private",
          active: true
        },
        {
          name: "full_spectrum_reset",
          displayName: "Full Spectrum Reset",
          description: "12 Hour Overnight Experience",
          focus: "Deep reset and healing",
          idealFor: "Those seeking intensive treatment",
          duration: "12 hours (8pm–8am)",
          sessionType: "Private overnight light session",
          sessionCount: 1,
          sessionCost: "240",
          totalCost: "240",
          addOns: "Couple rate: $400",
          bonuses: "Herbal tea & guided meditation track, Light detox support kit + morning journal",
          category: "overnight",
          packageType: "private",
          active: true
        },
        {
          name: "weekend_quantum_reboot",
          displayName: "Weekend Quantum Reboot",
          description: "2-day intensive healing retreat",
          focus: "Complete system reset",
          idealFor: "Those seeking breakthrough healing",
          duration: "2 overnight sessions (Fri–Sun)",
          sessionType: "Private overnight sessions plus reiki",
          sessionCount: 3,
          sessionCost: "650",
          totalCost: "650",
          addOns: "Couple rate: $1200",
          bonuses: "1 guided reiki session, Meal + wellness ritual kit",
          category: "overnight",
          packageType: "private",
          active: false
        },
        {
          name: "pet_partner_retreat",
          displayName: "Pet & Partner Rest Retreat",
          description: "Overnight healing for pet and owner",
          focus: "Joint healing for pet and owner",
          idealFor: "Pet owners seeking shared healing experience",
          duration: "8-hour overnight session",
          sessionType: "Private overnight session with pet",
          sessionCount: 1,
          sessionCost: "280",
          totalCost: "280",
          addOns: "Limit 1 animal",
          bonuses: "Pet bed, crystals & vibrational soundscape",
          category: "pet",
          packageType: "private",
          active: false
        }
      ]);
      
      console.log("Treatment packages seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding treatment packages:", error);
  }

  console.log("Initial data seeding complete");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Vercel deployment
  app.get("/api/health-check", async (req, res) => {
    try {
      // Check database connection by fetching a count
      let dbStatus = "unknown";
      try {
        // Try a simple database query to verify connection
        await db.select().from(users).limit(1);
        dbStatus = "connected";
      } catch (dbError) {
        console.error("Database health check failed:", dbError);
        dbStatus = "error";
      }

      // Basic environment diagnostics
      res.status(200).json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || "1.0.0",
        database: dbStatus,
        stripe: stripe ? "configured" : "not configured",
        deployment: "vercel",
        path: req.path,
        host: req.headers.host,
        reqId: req.headers['x-vercel-id'] || 'local'
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({ status: "error", message: "Health check failed" });
    }
  });
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

  // Update intake form status
  app.post('/api/appointments/:id/intake-form', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, timestamp } = req.body;

      if (!['completed', 'skipped'].includes(status)) {
        return res.status(400).json({ error: 'Invalid intake form status' });
      }

      // Update appointment with intake form status
      await storage.updateAppointment(id, {
        intakeFormStatus: status,
        intakeFormTimestamp: timestamp || new Date().toISOString()
      });

      // Add to activity log
      await storage.createActivity({
        type: 'intake_form_updated',
        description: JSON.stringify({
          appointmentId: id,
          status: status
        }),
        entityId: id,
        entityType: 'appointment'
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error updating intake form status:', error);
      res.status(500).json({ error: 'Failed to update intake form status', message: error.message });
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


  // Treatment Package Routes
  app.get("/api/treatment-packages", async (req, res) => {
    try {
      const activeOnly = req.query.active !== "false";
      const category = req.query.category as string | undefined;
      const packages = await storage.getTreatmentPackages(activeOnly, category);
      res.json(packages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/treatment-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const treatmentPackage = await storage.getTreatmentPackage(id);
      
      if (!treatmentPackage) {
        return res.status(404).json({ message: "Treatment package not found" });
      }
      
      res.json(treatmentPackage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/treatment-packages", async (req, res) => {
    try {
      const packageData = req.body;
      const treatmentPackage = await storage.createTreatmentPackage(packageData);
      res.status(201).json(treatmentPackage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/treatment-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const packageData = req.body;
      const updatedPackage = await storage.updateTreatmentPackage(id, packageData);
      res.json(updatedPackage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Treatment Plan Routes
  app.get("/api/treatment-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const treatmentPlan = await storage.getTreatmentPlan(id);
      
      if (!treatmentPlan) {
        return res.status(404).json({ message: "Treatment plan not found" });
      }
      
      // If the plan has a package, get the package details too
      if (treatmentPlan.packageId) {
        const packageDetails = await storage.getTreatmentPackage(treatmentPlan.packageId);
        
        if (packageDetails) {
          return res.json({
            ...treatmentPlan,
            packageDetails
          });
        }
      }
      
      res.json(treatmentPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/patients/:id/treatment-plans", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const treatmentPlans = await storage.getTreatmentPlansByPatient(patientId);
      
      // Get package details for each plan if it has a packageId
      const plansWithPackages = await Promise.all(
        treatmentPlans.map(async (plan) => {
          if (plan.packageId) {
            const packageDetails = await storage.getTreatmentPackage(plan.packageId);
            return {
              ...plan,
              packageDetails: packageDetails || undefined
            };
          }
          return plan;
        })
      );
      
      res.json(plansWithPackages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/treatment-plans", async (req, res) => {
    try {
      const treatmentPlanData = req.body;
      const treatmentPlan = await storage.createTreatmentPlan(treatmentPlanData);
      res.status(201).json(treatmentPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/treatment-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const treatmentPlanData = req.body;
      const updatedPlan = await storage.updateTreatmentPlan(id, treatmentPlanData);
      res.json(updatedPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/treatment-plans/:id/increment-session", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedPlan = await storage.incrementTreatmentPlanSessions(id);
      res.json(updatedPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Gift Card Routes
  app.post("/api/gift-cards", async (req, res) => {
    try {
      const giftCardData = req.body;
      const giftCard = await storage.createGiftCard(giftCardData);
      res.status(201).json(giftCard);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/gift-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const giftCard = await storage.getGiftCard(id);
      
      if (!giftCard) {
        return res.status(404).json({ message: "Gift card not found" });
      }
      
      res.json(giftCard);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/gift-cards/validate/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const giftCard = await storage.getGiftCardByCode(code);
      
      if (!giftCard) {
        return res.status(404).json({ message: "Gift card not found" });
      }
      
      // Check if the gift card is valid
      if (giftCard.status !== 'active') {
        return res.status(400).json({ 
          message: `Gift card is ${giftCard.status}`,
          giftCard
        });
      }
      
      // Check if the gift card is expired
      if (giftCard.expiryDate && new Date(giftCard.expiryDate) < new Date()) {
        return res.status(400).json({ 
          message: "Gift card is expired",
          giftCard 
        });
      }
      
      res.json({
        valid: true,
        giftCard
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/gift-cards/redeem", async (req, res) => {
    try {
      const { code, amount } = req.body;
      
      if (!code || !amount) {
        return res.status(400).json({ message: "Gift card code and amount are required" });
      }
      
      const updatedCard = await storage.useGiftCard(code, parseFloat(amount));
      
      res.json({
        success: true,
        giftCard: updatedCard
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  });
  
  // Location Routes
  app.get("/api/locations", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const locations = await storage.getLocations(activeOnly);
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json(location);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/locations", async (req, res) => {
    try {
      const locationData = req.body;
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const locationData = req.body;
      const updatedLocation = await storage.updateLocation(id, locationData);
      res.json(updatedLocation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Loyalty Program Routes
  app.get("/api/patients/:id/loyalty", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const loyaltyPoints = await storage.getPatientLoyalty(patientId);
      
      if (!loyaltyPoints) {
        return res.status(404).json({ 
          message: "No loyalty account found for this patient",
          points: 0,
          level: "none"
        });
      }
      
      // Get subscription if exists
      const subscription = await storage.getPatientLoyaltySubscription(patientId);
      
      res.json({
        ...loyaltyPoints,
        subscription: subscription || undefined
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/patients/:id/loyalty/transactions", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const transactions = await storage.getLoyaltyTransactions(patientId, limit);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/patients/:id/loyalty/add", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const { points, type, source, sourceId, description, dollarsSpent } = req.body;
      
      if (!points || !type) {
        return res.status(400).json({ message: "Points and type are required" });
      }
      
      const loyaltyAccount = await storage.createOrUpdateLoyaltyPoints(
        patientId,
        parseInt(points),
        type,
        source,
        sourceId,
        description,
        dollarsSpent
      );
      
      res.json(loyaltyAccount);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/patients/:id/loyalty/redeem", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const { points, description } = req.body;
      
      if (!points) {
        return res.status(400).json({ message: "Points are required" });
      }
      
      // Get current loyalty account
      const loyaltyAccount = await storage.getPatientLoyalty(patientId);
      
      if (!loyaltyAccount || loyaltyAccount.points < points) {
        return res.status(400).json({ message: "Insufficient loyalty points" });
      }
      
      // Redeem points (negative points for redemption)
      const updatedAccount = await storage.createOrUpdateLoyaltyPoints(
        patientId,
        -points,
        "redeemed",
        "manual_redemption",
        undefined,
        description || "Points redeemed"
      );
      
      res.json(updatedAccount);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Loyalty Subscription Routes
  app.get("/api/loyalty/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getLoyaltySubscription(id);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json(subscription);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/patients/:id/loyalty/subscription", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const subscriptionData = {
        ...req.body,
        patientId,
        startDate: req.body.startDate || new Date(),
        nextBillingDate: req.body.nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days later
      };
      
      // First check if patient already has an active subscription
      const existingSubscription = await storage.getPatientLoyaltySubscription(patientId);
      
      if (existingSubscription) {
        return res.status(400).json({ 
          message: "Patient already has an active subscription",
          subscription: existingSubscription
        });
      }
      
      const subscription = await storage.createLoyaltySubscription(subscriptionData);
      
      // Add points for subscribing
      await storage.createOrUpdateLoyaltyPoints(
        patientId,
        50, // Bonus points for subscribing
        "subscription_started",
        "loyalty_subscription",
        subscription.id,
        `Signed up for ${subscriptionData.planType} subscription plan`
      );
      
      res.status(201).json(subscription);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/loyalty/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subscriptionData = req.body;
      const updatedSubscription = await storage.updateLoyaltySubscription(id, subscriptionData);
      res.json(updatedSubscription);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/loyalty/subscriptions/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const cancelledSubscription = await storage.cancelLoyaltySubscription(id, reason);
      res.json(cancelledSubscription);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Enhanced Reporting Routes
  app.get("/api/reports/revenue", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day';
      
      const revenueData = await storage.getRevenueByPeriod(startDate, endDate, groupBy);
      
      res.json(revenueData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/reports/services", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      const serviceData = await storage.getServicePopularity(startDate, endDate);
      
      res.json(serviceData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/reports/retention", async (req, res) => {
    try {
      const periodMonths = req.query.months ? parseInt(req.query.months as string) : 6;
      
      const retentionData = await storage.getPatientRetention(periodMonths);
      
      res.json(retentionData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/reports/staff", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      const staffData = await storage.getStaffProductivity(startDate, endDate);
      
      res.json(staffData);
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

  // Calendly Integration Routes
  app.get("/api/calendly/events", async (req, res) => {
    try {
      const startTime = req.query.startTime as string;
      const endTime = req.query.endTime as string;
      
      const events = await calendlyService.getScheduledEvents(startTime, endTime);
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching Calendly events:", error);
      res.status(500).json({ 
        message: "Error fetching Calendly events", 
        error: error.message 
      });
    }
  });

  app.get("/api/calendly/event-types", async (req, res) => {
    try {
      const eventTypes = await calendlyService.getEventTypes();
      res.json(eventTypes);
    } catch (error: any) {
      console.error("Error fetching Calendly event types:", error);
      res.status(500).json({ 
        message: "Error fetching Calendly event types", 
        error: error.message 
      });
    }
  });

  app.post("/api/calendly/sync", async (req, res) => {
    try {
      const events = await calendlyService.syncCalendlyEvents();
      
      // Log the activity
      await storage.createActivity({
        type: "calendly_sync",
        description: `Synced ${events.collection.length} Calendly events`,
        entityId: 0,
        entityType: "system"
      });
      
      res.json({ 
        success: true, 
        message: `Successfully synced ${events.collection.length} events` 
      });
    } catch (error: any) {
      console.error("Error syncing Calendly events:", error);
      res.status(500).json({ 
        message: "Error syncing Calendly events", 
        error: error.message 
      });
    }
  });

  // Webhooks endpoint for Calendly
  app.post("/api/webhooks/calendly", async (req, res) => {
    try {
      const event = req.body;
      console.log("Received Calendly webhook:", event);
      
      // Process the webhook based on the event type
      if (event.event === 'invitee.created') {
        // New appointment created in Calendly
        const invitee = event.payload.invitee;
        const eventDetails = event.payload.event;
        
        // Create appointment in your system
        // Map Calendly event to your appointment schema
        const appointmentData = {
          date: new Date(eventDetails.start_time),
          time: new Date(eventDetails.start_time).toLocaleTimeString(),
          duration: (new Date(eventDetails.end_time).getTime() - new Date(eventDetails.start_time).getTime()) / 60000,
          status: "scheduled",
          notes: `Booked via Calendly: ${eventDetails.name}`,
          serviceId: 1, // Default service ID, you would map this based on event type
          intakeFormStatus: "pending"
          // Map other fields as needed
        };
        
        // Log the Calendly appointment creation
        await storage.createActivity({
          type: "calendly_appointment_created",
          description: `Appointment created via Calendly: ${eventDetails.name} for ${invitee.name}`,
          entityId: 0,
          entityType: "appointment"
        });
        
        res.status(200).json({ success: true });
      } else if (event.event === 'invitee.canceled') {
        // Appointment canceled in Calendly
        // Handle cancellation in your system
        res.status(200).json({ success: true });
      } else {
        // Other event types
        res.status(200).json({ success: true });
      }
    } catch (error: any) {
      console.error("Error processing Calendly webhook:", error);
      res.status(500).json({ 
        message: "Error processing Calendly webhook", 
        error: error.message 
      });
    }
  });

  // POS Routes
  // Get all products and services for POS
  app.get("/api/pos/products", async (req, res) => {
    try {
      // Combine services (as service type) and products (if we had them)
      const services = await storage.getServices();

      // Format services as POS products
      const serviceProducts = services.map(service => ({
        id: service.id,
        name: service.name,
        price: parseFloat(service.price),
        category: "service",
        description: service.description,
        duration: service.duration
      }));

      // Sample retail products (in a real app, these would come from a 'products' table)
      const retailProducts = [
        { id: 1001, name: "Coconut Oil", price: 22, category: "product", description: "Organic coconut oil for skin and hair" },
        { id: 1002, name: "Aloe Vera Gel", price: 18, category: "product", description: "Soothing gel for sunburns and skin care" },
        { id: 1003, name: "Lavender Bath Salts", price: 15, category: "product", description: "Relaxing bath salts for home spa experience" },
        { id: 1004, name: "Healing Balm", price: 26, category: "product", description: "All-purpose healing balm with herbs" },
        { id: 1005, name: "Tea Tree Oil", price: 19, category: "product", description: "Pure tea tree oil for skin treatments" },
      ];

      const allProducts = [...serviceProducts, ...retailProducts];

      res.json(allProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all customers for POS
  app.get("/api/pos/customers", async (req, res) => {
    try {
      const patients = await storage.getPatients();

      // Format patients as customers for POS
      const customers = patients.map(patient => ({
        id: patient.id,
        name: patient.name,
        email: patient.email || "",
        phone: patient.phone || "",
        avatar: null
      }));

      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create POS payment intent
  app.post("/api/pos/create-payment-intent", async (req, res) => {
    try {
      const { amount, items, customerId, metadata = {} } = req.body;

      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }

      // Add additional metadata
      const paymentMetadata: Record<string, string> = {
        ...metadata,
        paymentType: "pos_transaction",
      };

      if (customerId) {
        const patient = await storage.getPatient(customerId);
        if (patient) {
          paymentMetadata.customerId = customerId.toString();
          paymentMetadata.customerName = patient.name;
        }
      }

      // Items information (serialized)
      if (items && Array.isArray(items)) {
        paymentMetadata.itemsCount = items.length.toString();
        paymentMetadata.items = JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })));
      }

      // Create payment intent using our service
      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        "usd",
        paymentMetadata
      );

      // Log the activity
      await storage.createActivity({
        type: "pos_payment_intent_created",
        description: `Created POS payment intent for $${amount.toFixed(2)}`,
        entityId: customerId || 0,
        entityType: customerId ? "patient" : "pos"
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Error creating POS payment intent:", error);
      res.status(500).json({ 
        message: "Error creating payment intent", 
        error: error.message 
      });
    }
  });

  // Record POS payment
  app.post("/api/pos/record-payment", async (req, res) => {
    try {
      const { 
        paymentIntentId, 
        customerId, 
        amount, 
        items, 
        paymentMethod, 
        status = "completed"
      } = req.body;

      // Validate the payment with Stripe if paymentIntentId provided
      if (paymentIntentId) {
        const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
          console.warn(`Payment intent ${paymentIntentId} has status ${paymentIntent.status}, not 'succeeded'`);
        }
      }

      // Format for storage
      const paymentData: any = {
        amount: amount.toString(),
        paymentMethod: paymentMethod || "credit_card",
        status,
        transactionId: paymentIntentId || `pos_${Date.now()}`,
        receiptSent: false
      };

      // Add patient reference if customer exists
      if (customerId) {
        paymentData.patientId = customerId;
      }

      // Store payment record
      const payment = await storage.createPayment(paymentData);

      // Store items as separate records (if we had a line_items table)
      // For now, we'll use the activity log to record this information
      const itemsList = items?.map((item: any) => 
        `${item.quantity}x ${item.name} ($${item.price.toFixed(2)} each)`
      ).join(", ") || "No items";

      // Log the activity
      await storage.createActivity({
        type: "pos_payment_recorded",
        description: `POS payment of $${amount.toFixed(2)} recorded. Items: ${itemsList}`,
        entityId: payment.id,
        entityType: "payment"
      });

      // Send receipt if email available and customerId provided
      if (customerId) {
        try {
          const patient = await storage.getPatient(customerId);
          if (patient && patient.email) {
            // In a real implementation, we would create a POS-specific receipt
            await sendPaymentReceipt(patient.email, patient.name, payment);

            // Update payment to indicate receipt was sent
            await storage.updatePayment(payment.id, { status: "completed_receipt_sent" });
          }
        } catch (emailError) {
          console.error("Failed to send POS payment receipt:", emailError);
        }
      }

      res.status(201).json({ success: true, payment });
    } catch (error: any) {
      console.error("Error recording POS payment:", error);
      res.status(500).json({ 
        message: "Error recording payment", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}