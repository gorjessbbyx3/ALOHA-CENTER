import {
  users, User, InsertUser,
  patients, Patient, InsertPatient,
  services, Service, InsertService,
  rooms, Room, InsertRoom,
  appointments, Appointment, InsertAppointment,
  payments, Payment, InsertPayment,
  activities, Activity, InsertActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByUserId(userId: number): Promise<Patient | undefined>;
  getPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, data: Partial<InsertPatient>): Promise<Patient>;
  
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Room operations
  getRoom(id: number): Promise<Room | undefined>;
  getRooms(active?: boolean): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, data: Partial<InsertRoom>): Promise<Room>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  getAppointmentsByRoom(roomId: number, date?: Date): Promise<Appointment[]>;
  getAppointmentsForToday(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment>;
  cancelAppointment(id: number): Promise<Appointment>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByPatient(patientId: number): Promise<Payment[]>;
  getPaymentsByAppointment(appointmentId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    todayAppointments: number;
    newPatients: number;
    weeklyRevenue: number;
    cancellations: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private services: Map<number, Service>;
  private appointments: Map<number, Appointment>;
  private payments: Map<number, Payment>;
  private activities: Map<number, Activity>;
  private currentIds: {
    users: number;
    patients: number;
    services: number;
    appointments: number;
    payments: number;
    activities: number;
  };

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.services = new Map();
    this.appointments = new Map();
    this.payments = new Map();
    this.activities = new Map();
    this.currentIds = {
      users: 1,
      patients: 1,
      services: 1,
      appointments: 1,
      payments: 1,
      activities: 1,
    };
    
    // Add initial data
    this.initializeData();
  }

  // Initialize with sample data
  private initializeData() {
    // Create admin user
    const adminUser: InsertUser = {
      username: "webmaster808",
      password: "BingoxBango", // In a real app, this would be hashed
      email: "admin@medibook.com",
      name: "Dr. Sarah Chen",
      role: "admin"
    };
    this.createUser(adminUser);
    
    // Create services
    const services: InsertService[] = [
      { name: "General Consultation", description: "Regular checkup", duration: 30, price: 50 },
      { name: "Follow-up Visit", description: "Follow-up appointment", duration: 15, price: 30 },
      { name: "Physical Examination", description: "Complete physical", duration: 60, price: 120 },
      { name: "Vaccination", description: "Various vaccines", duration: 15, price: 40 },
      { name: "Lab Work", description: "Blood work and tests", duration: 30, price: 80 }
    ];
    
    services.forEach(service => this.createService(service));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }
  
  async getPatientByUserId(userId: number): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.userId === userId,
    );
  }
  
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }
  
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentIds.patients++;
    const patientId = `PT-${1000 + id}`;
    const patient: Patient = { 
      ...insertPatient, 
      id, 
      patientId,
      lastVisit: null
    };
    this.patients.set(id, patient);
    
    // Create activity
    this.createActivity({
      type: "patient.created",
      description: `New patient ${patient.name} registered`,
      entityId: id,
      entityType: "patient",
      userId: patient.userId || null
    });
    
    return patient;
  }
  
  async updatePatient(id: number, data: Partial<InsertPatient>): Promise<Patient> {
    const patient = await this.getPatient(id);
    if (!patient) {
      throw new Error(`Patient with ID ${id} not found`);
    }
    
    const updatedPatient: Patient = { ...patient, ...data };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }
  
  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentIds.services++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }
  
  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId,
    );
  }
  
  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.appointments.values()).filter(appointment => {
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      return appointmentDate === dateString;
    });
  }
  
  async getAppointmentsForToday(): Promise<Appointment[]> {
    const today = new Date();
    return this.getAppointmentsByDate(today);
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentIds.appointments++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id,
      createdAt: new Date()
    };
    this.appointments.set(id, appointment);
    
    // Create activity
    this.createActivity({
      type: "appointment.created",
      description: `New appointment scheduled for ${new Date(appointment.date).toLocaleDateString()}`,
      entityId: id,
      entityType: "appointment",
      userId: null
    });
    
    return appointment;
  }
  
  async updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment> {
    const appointment = await this.getAppointment(id);
    if (!appointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    const updatedAppointment: Appointment = { ...appointment, ...data };
    this.appointments.set(id, updatedAppointment);
    
    // Create activity
    this.createActivity({
      type: "appointment.updated",
      description: `Appointment updated for ${new Date(updatedAppointment.date).toLocaleDateString()}`,
      entityId: id,
      entityType: "appointment",
      userId: null
    });
    
    return updatedAppointment;
  }
  
  async cancelAppointment(id: number): Promise<Appointment> {
    const appointment = await this.getAppointment(id);
    if (!appointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    const canceledAppointment: Appointment = { ...appointment, status: "canceled" };
    this.appointments.set(id, canceledAppointment);
    
    // Create activity
    this.createActivity({
      type: "appointment.canceled",
      description: `Appointment canceled for ${new Date(canceledAppointment.date).toLocaleDateString()}`,
      entityId: id,
      entityType: "appointment",
      userId: null
    });
    
    return canceledAppointment;
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByPatient(patientId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.patientId === patientId,
    );
  }
  
  async getPaymentsByAppointment(appointmentId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.appointmentId === appointmentId,
    );
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentIds.payments++;
    const payment: Payment = { 
      ...insertPayment, 
      id,
      date: new Date()
    };
    this.payments.set(id, payment);
    
    // Update appointment payment status
    if (payment.appointmentId) {
      const appointment = await this.getAppointment(payment.appointmentId);
      if (appointment) {
        await this.updateAppointment(appointment.id, {
          paymentStatus: "paid",
          paymentAmount: payment.amount,
          paymentMethod: payment.paymentMethod
        });
      }
    }
    
    // Create activity
    this.createActivity({
      type: "payment.created",
      description: `Payment received: $${Number(payment.amount)}`,
      entityId: id,
      entityType: "payment",
      userId: null
    });
    
    return payment;
  }
  
  async updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment> {
    const payment = await this.getPayment(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    const updatedPayment: Payment = { ...payment, ...data };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentIds.activities++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      timestamp: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, limit);
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    todayAppointments: number;
    newPatients: number;
    weeklyRevenue: number;
    cancellations: number;
  }> {
    const today = new Date();
    const todayAppointments = (await this.getAppointmentsForToday()).length;
    
    // New patients in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newPatients = Array.from(this.patients.values()).filter(patient => {
      if (!patient.lastVisit) return true;
      const patientCreatedAt = new Date(patient.lastVisit);
      return patientCreatedAt >= oneWeekAgo;
    }).length;
    
    // Weekly revenue
    const weeklyPayments = Array.from(this.payments.values()).filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= oneWeekAgo;
    });
    
    const weeklyRevenue = weeklyPayments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);
    
    // Cancellations in the last 7 days
    const cancellations = Array.from(this.appointments.values()).filter(appointment => {
      if (appointment.status !== "canceled") return false;
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= oneWeekAgo;
    }).length;
    
    return {
      todayAppointments,
      newPatients,
      weeklyRevenue,
      cancellations
    };
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }
  
  async getPatientByUserId(userId: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.userId, userId));
    return patient;
  }
  
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }
  
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const patientIdNumber = await this.getNextPatientIdNumber();
    const patientId = `PT-${1000 + patientIdNumber}`;
    
    const [patient] = await db
      .insert(patients)
      .values({ ...insertPatient, patientId })
      .returning();
    
    // Create activity
    await this.createActivity({
      type: "patient.created",
      description: `New patient ${patient.name} registered`,
      entityId: patient.id,
      entityType: "patient",
      userId: patient.userId || null
    });
    
    return patient;
  }
  
  private async getNextPatientIdNumber(): Promise<number> {
    const allPatients = await db.select().from(patients);
    return allPatients.length;
  }
  
  async updatePatient(id: number, data: Partial<InsertPatient>): Promise<Patient> {
    const [patient] = await db
      .update(patients)
      .set(data)
      .where(eq(patients.id, id))
      .returning();
      
    if (!patient) {
      throw new Error(`Patient with ID ${id} not found`);
    }
    
    return patient;
  }
  
  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }
  
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }
  
  // Room operations
  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }
  
  async getRooms(active?: boolean): Promise<Room[]> {
    if (active) {
      return await db.select().from(rooms).where(eq(rooms.isActive, true));
    }
    return await db.select().from(rooms);
  }
  
  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await db
      .insert(rooms)
      .values(insertRoom)
      .returning();
    return room;
  }
  
  async updateRoom(id: number, data: Partial<InsertRoom>): Promise<Room> {
    const [room] = await db
      .update(rooms)
      .set(data)
      .where(eq(rooms.id, id))
      .returning();
    
    if (!room) {
      throw new Error(`Room with ID ${id} not found`);
    }
    
    return room;
  }
  
  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }
  
  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId));
  }
  
  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db
      .select()
      .from(appointments)
      .where(and(
        gte(appointments.date, startOfDay),
        sql`${appointments.date} < ${endOfDay}`
      ));
  }
  
  async getAppointmentsByRoom(roomId: number, date?: Date): Promise<Appointment[]> {
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return await db
        .select()
        .from(appointments)
        .where(and(
          eq(appointments.roomId, roomId),
          gte(appointments.date, startOfDay),
          sql`${appointments.date} < ${endOfDay}`
        ));
    }
    
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.roomId, roomId));
  }
  
  async getAppointmentsForToday(): Promise<Appointment[]> {
    const today = new Date();
    return this.getAppointmentsByDate(today);
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values({ ...insertAppointment })
      .returning();
    
    // Create activity
    await this.createActivity({
      type: "appointment.created",
      description: `New appointment scheduled for ${new Date(appointment.date).toLocaleDateString()}`,
      entityId: appointment.id,
      entityType: "appointment",
      userId: null
    });
    
    return appointment;
  }
  
  async updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set(data)
      .where(eq(appointments.id, id))
      .returning();
      
    if (!appointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    // Create activity
    await this.createActivity({
      type: "appointment.updated",
      description: `Appointment updated for ${new Date(appointment.date).toLocaleDateString()}`,
      entityId: id,
      entityType: "appointment",
      userId: null
    });
    
    return appointment;
  }
  
  async cancelAppointment(id: number): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ status: "canceled" })
      .where(eq(appointments.id, id))
      .returning();
      
    if (!appointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    // Create activity
    await this.createActivity({
      type: "appointment.canceled",
      description: `Appointment canceled for ${new Date(appointment.date).toLocaleDateString()}`,
      entityId: id,
      entityType: "appointment",
      userId: null
    });
    
    return appointment;
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  
  async getPaymentsByPatient(patientId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.patientId, patientId));
  }
  
  async getPaymentsByAppointment(appointmentId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.appointmentId, appointmentId));
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    
    // Update appointment payment status
    if (payment.appointmentId) {
      await db
        .update(appointments)
        .set({
          paymentStatus: "paid",
          paymentAmount: payment.amount,
          paymentMethod: payment.paymentMethod
        })
        .where(eq(appointments.id, payment.appointmentId));
    }
    
    // Create activity
    await this.createActivity({
      type: "payment.created",
      description: `Payment received: $${Number(payment.amount)}`,
      entityId: payment.id,
      entityType: "payment",
      userId: null
    });
    
    return payment;
  }
  
  async updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
      
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    return payment;
  }
  
  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    
    return activity;
  }
  
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    todayAppointments: number;
    newPatients: number;
    weeklyRevenue: number;
    cancellations: number;
  }> {
    const todayAppointments = (await this.getAppointmentsForToday()).length;
    
    // New patients in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newPatientsResult = await db
      .select()
      .from(patients)
      .where(
        sql`${patients.lastVisit} IS NULL OR ${patients.lastVisit} >= ${oneWeekAgo}`
      );
    
    const newPatients = newPatientsResult.length;
    
    // Weekly revenue
    const weeklyPaymentsResult = await db
      .select()
      .from(payments)
      .where(gte(payments.date, oneWeekAgo));
    
    const weeklyRevenue = weeklyPaymentsResult.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);
    
    // Cancellations in the last 7 days
    const cancellationsResult = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.status, "canceled"),
        gte(appointments.date, oneWeekAgo)
      ));
    
    const cancellations = cancellationsResult.length;
    
    return {
      todayAppointments,
      newPatients,
      weeklyRevenue,
      cancellations
    };
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
