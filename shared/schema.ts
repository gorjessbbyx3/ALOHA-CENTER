import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("patient"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

// Patient schema
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  patientId: text("patient_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  insuranceProvider: text("insurance_provider"),
  insuranceNumber: text("insurance_number"),
  lastVisit: timestamp("last_visit"),
  status: text("status").default("active"),
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  address: true,
  insuranceProvider: true,
  insuranceNumber: true,
  status: true,
});

// Service schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: numeric("price").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  description: true,
  duration: true,
  price: true,
});

// Room schema
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  capacity: integer("capacity").default(1),
  isActive: boolean("is_active").default(true),
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  name: true,
  description: true,
  capacity: true,
  isActive: true,
});

// Appointment schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  serviceId: integer("service_id").references(() => services.id),
  roomId: integer("room_id").references(() => rooms.id),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  paymentStatus: text("payment_status").default("pending"),
  paymentAmount: numeric("payment_amount"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments)
  .pick({
    patientId: true,
    serviceId: true,
    roomId: true,
    date: true,
    time: true,
    duration: true,
    status: true,
    notes: true,
    paymentStatus: true,
    paymentAmount: true,
    paymentMethod: true,
  })
  .extend({
    // Allow either Date object or ISO string for the date field
    date: z.union([z.date(), z.string().transform(str => new Date(str))])
  });

// Payment schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  patientId: integer("patient_id").references(() => patients.id),
  amount: numeric("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  transactionId: text("transaction_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  date: timestamp("date").defaultNow(),
  invoicePdfPath: text("invoice_pdf_path"),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  appointmentId: true,
  patientId: true,
  amount: true,
  paymentMethod: true,
  status: true,
  transactionId: true,
  stripePaymentIntentId: true,
  invoicePdfPath: true,
});

// Activity schema for tracking actions in the system
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // appointment.created, payment.received, etc.
  description: text("description").notNull(),
  entityId: integer("entity_id"), // ID of the related entity (appointment, payment, etc.)
  entityType: text("entity_type"), // Type of the related entity
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  description: true,
  entityId: true,
  entityType: true,
  userId: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
