import {
  users, User, InsertUser,
  patients, Patient, InsertPatient,
  services, Service, InsertService,
  appointments, Appointment, InsertAppointment,
  payments, Payment, InsertPayment,
  activities, Activity, InsertActivity
} from "@shared/schema";

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
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
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
      username: "admin",
      password: "password123", // In a real app, this would be hashed
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

export const storage = new MemStorage();
