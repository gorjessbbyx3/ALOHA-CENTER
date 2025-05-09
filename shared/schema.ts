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

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export const extendedInsertPaymentSchema = insertPaymentSchema.extend({
  // Allow number for amount (will be converted to string)
  amount: z.union([z.string(), z.number().transform(n => n.toString())])
});

// Treatment Plan schema
export const treatmentPlans = pgTable("treatment_plans", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"),
  goals: text("goals"),
  notes: text("notes"),
  progress: text("progress"),
  packageId: integer("package_id").references(() => treatmentPackages.id),
  sessionsCompleted: integer("sessions_completed").default(0),
  totalSessions: integer("total_sessions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Treatment Package schema
export const treatmentPackages = pgTable("treatment_packages", {
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
  category: text("category").default("standard"), // standard, overnight, pet, senior, etc.
  packageType: text("package_type"), // group, private, mixed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTreatmentPlanSchema = createInsertSchema(treatmentPlans).pick({
  patientId: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  status: true,
  goals: true,
  notes: true,
  progress: true,
  packageId: true,
  totalSessions: true,
});

export const insertTreatmentPackageSchema = createInsertSchema(treatmentPackages).pick({
  name: true,
  displayName: true,
  description: true,
  focus: true,
  idealFor: true,
  duration: true,
  sessionType: true,
  sessionCount: true,
  sessionCost: true,
  totalCost: true,
  addOns: true,
  bonuses: true,
  active: true,
  category: true,
  packageType: true,
});

export type InsertTreatmentPlan = z.infer<typeof insertTreatmentPlanSchema>;
export type TreatmentPlan = typeof treatmentPlans.$inferSelect;
export type InsertTreatmentPackage = z.infer<typeof insertTreatmentPackageSchema>;
export type TreatmentPackage = typeof treatmentPackages.$inferSelect;

// Gift Card schema
export const giftCards = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  amount: numeric("amount").notNull(),
  remainingBalance: numeric("remaining_balance").notNull(),
  issuedTo: text("issued_to"),
  issuedEmail: text("issued_email"),
  purchasedBy: integer("purchased_by").references(() => patients.id),
  status: text("status").notNull().default("active"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
});

export const insertGiftCardSchema = createInsertSchema(giftCards).pick({
  code: true,
  amount: true,
  remainingBalance: true,
  issuedTo: true,
  issuedEmail: true,
  purchasedBy: true,
  status: true,
  expiryDate: true,
});

export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;
export type GiftCard = typeof giftCards.$inferSelect;

// Locations schema
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  isActive: boolean("is_active").default(true),
  timezone: text("timezone").default("America/Los_Angeles"),
  businessHours: text("business_hours"),
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  name: true,
  address: true,
  phone: true,
  email: true,
  isActive: true,
  timezone: true,
  businessHours: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Loyalty Program schema
export const loyaltyPoints = pgTable("loyalty_points", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  points: integer("points").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  level: text("level").default("bronze"),
  monthlyPointsEarned: integer("monthly_points_earned").default(0),
  referralsCount: integer("referrals_count").default(0),
  birthdayMonth: integer("birthday_month"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  points: integer("points").notNull(),
  type: text("type").notNull(), // earned, redeemed, expired, referral, birthday, etc.
  source: text("source"), // appointment, referral, promotion, etc.
  sourceId: integer("source_id"), // ID of appointment, etc. if applicable
  description: text("description"),
  dollarsSpent: numeric("dollars_spent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loyaltySubscriptions = pgTable("loyalty_subscriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  planType: text("plan_type").notNull(), // basic, premium
  monthlyFee: numeric("monthly_fee").notNull(),
  includedSessions: integer("included_sessions").notNull(),
  includesReiki: boolean("includes_reiki").default(false),
  includesPetAddOn: boolean("includes_pet_add_on").default(false),
  startDate: timestamp("start_date").notNull(),
  nextBillingDate: timestamp("next_billing_date"),
  status: text("status").default("active"), // active, paused, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLoyaltyPointsSchema = createInsertSchema(loyaltyPoints).pick({
  patientId: true,
  points: true,
  totalEarned: true,
  level: true,
  monthlyPointsEarned: true,
  referralsCount: true,
  birthdayMonth: true,
});

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).pick({
  patientId: true,
  points: true,
  type: true,
  source: true,
  sourceId: true,
  description: true,
  dollarsSpent: true,
});

export const insertLoyaltySubscriptionSchema = createInsertSchema(loyaltySubscriptions).pick({
  patientId: true,
  planType: true,
  monthlyFee: true,
  includedSessions: true,
  includesReiki: true,
  includesPetAddOn: true,
  startDate: true,
  nextBillingDate: true,
  status: true,
});

export type InsertLoyaltyPoints = z.infer<typeof insertLoyaltyPointsSchema>;
export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertLoyaltySubscription = z.infer<typeof insertLoyaltySubscriptionSchema>;
export type LoyaltySubscription = typeof loyaltySubscriptions.$inferSelect;

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
export type Appointment = {
  id: number;
  patientId: number | null;
  serviceId: number;
  date: string; // ISO date string
  time: string; // 24hr format HH:MM
  duration: number; // minutes
  status: string; // scheduled, checked-in, completed, canceled
  notes?: string;
  paymentStatus: string; // pending, paid
  paymentAmount?: number;
  paymentMethod?: string;
  intakeFormStatus?: string; // not_started, skipped, completed
  intakeFormTimestamp?: string; // ISO date string when intake form was completed/skipped
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export const extendedInsertPaymentSchema = insertPaymentSchema.extend({
  // Allow number for amount (will be converted to string)
  amount: z.union([z.string(), z.number().transform(n => n.toString())])
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;