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
    

  // Treatment Plan methods
  async createTreatmentPlan(data: InsertTreatmentPlan): Promise<TreatmentPlan> {
    try {
      const [treatmentPlan] = await db.insert(schema.treatmentPlans).values(data).returning();
      
      // Log activity
      await this.createActivity({
        type: "treatment_plan_created",
        description: `Created treatment plan "${data.name}" for patient ID ${data.patientId}`,
        entityId: treatmentPlan.id,
        entityType: "treatment_plan"
      });
      
      return treatmentPlan;
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      throw error;
    }
  }
  
  async getTreatmentPlan(id: number): Promise<TreatmentPlan | null> {
    try {
      const [treatmentPlan] = await db.select().from(schema.treatmentPlans).where(eq(schema.treatmentPlans.id, id)).limit(1);
      return treatmentPlan || null;
    } catch (error) {
      console.error("Error fetching treatment plan:", error);
      throw error;
    }
  }
  
  async getTreatmentPlansByPatient(patientId: number): Promise<TreatmentPlan[]> {
    try {
      return await db.select().from(schema.treatmentPlans).where(eq(schema.treatmentPlans.patientId, patientId));
    } catch (error) {
      console.error("Error fetching patient treatment plans:", error);
      throw error;
    }
  }
  
  async updateTreatmentPlan(id: number, data: Partial<TreatmentPlan>): Promise<TreatmentPlan> {
    try {
      const [updatedPlan] = await db
        .update(schema.treatmentPlans)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.treatmentPlans.id, id))
        .returning();
      
      // Log activity
      await this.createActivity({
        type: "treatment_plan_updated",
        description: `Updated treatment plan "${updatedPlan.name}"`,
        entityId: updatedPlan.id,
        entityType: "treatment_plan"
      });
      
      return updatedPlan;
    } catch (error) {
      console.error("Error updating treatment plan:", error);
      throw error;
    }
  }
  
  // Gift Card methods
  async createGiftCard(data: InsertGiftCard): Promise<GiftCard> {
    try {
      // Generate a unique code if not provided
      if (!data.code) {
        data.code = `GC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }
      
      // Set remaining balance equal to amount if not specified
      if (!data.remainingBalance) {
        data.remainingBalance = data.amount;
      }
      
      const [giftCard] = await db.insert(schema.giftCards).values(data).returning();
      
      // Log activity
      await this.createActivity({
        type: "gift_card_created",
        description: `Created gift card with code ${data.code} for $${data.amount}`,
        entityId: giftCard.id,
        entityType: "gift_card"
      });
      
      return giftCard;
    } catch (error) {
      console.error("Error creating gift card:", error);
      throw error;
    }
  }
  
  async getGiftCard(id: number): Promise<GiftCard | null> {
    try {
      const [giftCard] = await db.select().from(schema.giftCards).where(eq(schema.giftCards.id, id)).limit(1);
      return giftCard || null;
    } catch (error) {
      console.error("Error fetching gift card:", error);
      throw error;
    }
  }
  
  async getGiftCardByCode(code: string): Promise<GiftCard | null> {
    try {
      const [giftCard] = await db.select().from(schema.giftCards).where(eq(schema.giftCards.code, code)).limit(1);
      return giftCard || null;
    } catch (error) {
      console.error("Error fetching gift card by code:", error);
      throw error;
    }
  }
  
  async useGiftCard(code: string, amount: number): Promise<GiftCard> {
    try {
      const giftCard = await this.getGiftCardByCode(code);
      
      if (!giftCard) {
        throw new Error("Gift card not found");
      }
      
      if (giftCard.status !== "active") {
        throw new Error(`Gift card is ${giftCard.status}`);
      }
      
      const remainingBalance = parseFloat(giftCard.remainingBalance.toString()) - amount;
      
      if (remainingBalance < 0) {
        throw new Error("Insufficient gift card balance");
      }
      
      const [updatedCard] = await db
        .update(schema.giftCards)
        .set({ 
          remainingBalance: remainingBalance.toString(), 
          lastUsed: new Date(),
          status: remainingBalance === 0 ? "used" : "active"
        })
        .where(eq(schema.giftCards.id, giftCard.id))
        .returning();
      
      // Log activity
      await this.createActivity({
        type: "gift_card_used",
        description: `Used $${amount} from gift card ${code}. Remaining balance: $${remainingBalance}`,
        entityId: giftCard.id,
        entityType: "gift_card"
      });
      
      return updatedCard;
    } catch (error) {
      console.error("Error using gift card:", error);
      throw error;
    }
  }
  
  // Location methods
  async createLocation(data: InsertLocation): Promise<Location> {
    try {
      const [location] = await db.insert(schema.locations).values(data).returning();
      
      // Log activity
      await this.createActivity({
        type: "location_created",
        description: `Created new location "${data.name}" at ${data.address}`,
        entityId: location.id,
        entityType: "location"
      });
      
      return location;
    } catch (error) {
      console.error("Error creating location:", error);
      throw error;
    }
  }
  
  async getLocation(id: number): Promise<Location | null> {
    try {
      const [location] = await db.select().from(schema.locations).where(eq(schema.locations.id, id)).limit(1);
      return location || null;
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
    }
  }
  
  async getLocations(activeOnly: boolean = false): Promise<Location[]> {
    try {
      let query = db.select().from(schema.locations);
      
      if (activeOnly) {
        query = query.where(eq(schema.locations.isActive, true));
      }
      
      return await query;
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  }
  
  async updateLocation(id: number, data: Partial<Location>): Promise<Location> {
    try {
      const [updatedLocation] = await db
        .update(schema.locations)
        .set(data)
        .where(eq(schema.locations.id, id))
        .returning();
      
      // Log activity
      await this.createActivity({
        type: "location_updated",
        description: `Updated location "${updatedLocation.name}"`,
        entityId: updatedLocation.id,
        entityType: "location"
      });
      
      return updatedLocation;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  }
  
  // Loyalty Program methods
  async getPatientLoyalty(patientId: number): Promise<LoyaltyPoints | null> {
    try {
      const [loyaltyPoints] = await db
        .select()
        .from(schema.loyaltyPoints)
        .where(eq(schema.loyaltyPoints.patientId, patientId))
        .limit(1);
      
      return loyaltyPoints || null;
    } catch (error) {
      console.error("Error fetching patient loyalty points:", error);
      throw error;
    }
  }
  
  async createOrUpdateLoyaltyPoints(patientId: number, points: number, type: string, source: string = "", sourceId?: number, description: string = ""): Promise<LoyaltyPoints> {
    try {
      let loyaltyAccount = await this.getPatientLoyalty(patientId);
      
      if (!loyaltyAccount) {
        // Create new loyalty account
        const [newAccount] = await db
          .insert(schema.loyaltyPoints)
          .values({
            patientId,
            points: points > 0 ? points : 0,
            totalEarned: points > 0 ? points : 0,
            level: "bronze"
          })
          .returning();
        
        loyaltyAccount = newAccount;
      } else {
        // Update existing account
        const newPoints = points + Number(loyaltyAccount.points);
        const newTotalEarned = points > 0 ? Number(loyaltyAccount.totalEarned) + points : Number(loyaltyAccount.totalEarned);
        
        // Determine loyalty level based on total points earned
        let level = loyaltyAccount.level;
        if (newTotalEarned >= 1000) {
          level = "platinum";
        } else if (newTotalEarned >= 500) {
          level = "gold";
        } else if (newTotalEarned >= 200) {
          level = "silver";
        }
        
        const [updatedAccount] = await db
          .update(schema.loyaltyPoints)
          .set({
            points: newPoints < 0 ? 0 : newPoints,
            totalEarned: newTotalEarned,
            level,
            updatedAt: new Date()
          })
          .where(eq(schema.loyaltyPoints.id, loyaltyAccount.id))
          .returning();
        
        loyaltyAccount = updatedAccount;
      }
      
      // Record the transaction
      await db.insert(schema.loyaltyTransactions).values({
        patientId,
        points,
        type,
        source,
        sourceId,
        description
      });
      
      // Log activity
      await this.createActivity({
        type: `loyalty_points_${type}`,
        description: `${points > 0 ? "Added" : "Deducted"} ${Math.abs(points)} loyalty points ${description ? "- " + description : ""}`,
        entityId: patientId,
        entityType: "patient"
      });
      
      return loyaltyAccount;
    } catch (error) {
      console.error("Error updating loyalty points:", error);
      throw error;
    }
  }
  
  async getLoyaltyTransactions(patientId: number, limit: number = 20): Promise<LoyaltyTransaction[]> {
    try {
      return await db
        .select()
        .from(schema.loyaltyTransactions)
        .where(eq(schema.loyaltyTransactions.patientId, patientId))
        .orderBy(desc(schema.loyaltyTransactions.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error fetching loyalty transactions:", error);
      throw error;
    }
  }
  
  // Enhanced Reporting
  async getRevenueByPeriod(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' = 'day'): Promise<any[]> {
    try {
      // Format will vary based on database type; this implementation is PostgreSQL specific
      let dateFormat;
      switch (groupBy) {
        case 'day':
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          dateFormat = 'YYYY-"W"IW'; // ISO week format
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
      }
      
      const result = await db.execute(sql`
        SELECT 
          TO_CHAR(date, ${dateFormat}) as period,
          SUM(CAST(amount AS NUMERIC)) as revenue
        FROM 
          payments
        WHERE 
          date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
        GROUP BY 
          period
        ORDER BY 
          period
      `);
      
      return result.rows;
    } catch (error) {
      console.error("Error fetching revenue by period:", error);
      throw error;
    }
  }
  
  async getServicePopularity(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          s.id,
          s.name,
          COUNT(a.id) as count,
          SUM(CAST(p.amount AS NUMERIC)) as revenue
        FROM 
          appointments a
        JOIN 
          services s ON a.service_id = s.id
        LEFT JOIN 
          payments p ON a.id = p.appointment_id
        WHERE 
          a.date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
          AND a.status = 'completed'
        GROUP BY 
          s.id, s.name
        ORDER BY 
          count DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error("Error fetching service popularity:", error);
      throw error;
    }
  }
  
  async getPatientRetention(periodMonths: number = 6): Promise<any> {
    try {
      const now = new Date();
      const startDate = new Date();
      startDate.setMonth(now.getMonth() - periodMonths);
      
      const result = await db.execute(sql`
        WITH patient_appointments AS (
          SELECT 
            patient_id,
            COUNT(id) as appointment_count,
            MIN(date) as first_appointment,
            MAX(date) as last_appointment
          FROM 
            appointments
          WHERE 
            patient_id IS NOT NULL
          GROUP BY 
            patient_id
        )
        SELECT 
          COUNT(*) as total_patients,
          SUM(CASE WHEN appointment_count > 1 THEN 1 ELSE 0 END) as returning_patients,
          ROUND((SUM(CASE WHEN appointment_count > 1 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) as retention_rate
        FROM 
          patient_appointments
        WHERE 
          first_appointment >= ${startDate.toISOString()}
      `);
      
      return result.rows[0];
    } catch (error) {
      console.error("Error calculating patient retention:", error);
      throw error;
    }
  }
  
  async getStaffProductivity(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      // For this to work properly, we would need a staff_id field in appointments
      // This is a placeholder implementation
      const result = await db.execute(sql`
        SELECT 
          u.id,
          u.name,
          COUNT(a.id) as appointment_count,
          SUM(s.duration) as total_minutes,
          SUM(CAST(p.amount AS NUMERIC)) as revenue
        FROM 
          users u
        LEFT JOIN 
          appointments a ON a.user_id = u.id
        LEFT JOIN
          services s ON a.service_id = s.id
        LEFT JOIN
          payments p ON a.id = p.appointment_id
        WHERE 
          u.role IN ('admin', 'provider')
          AND (a.date IS NULL OR a.date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()})
        GROUP BY 
          u.id, u.name
        ORDER BY 
          appointment_count DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error("Error fetching staff productivity:", error);
      throw error;
    }
  }

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
