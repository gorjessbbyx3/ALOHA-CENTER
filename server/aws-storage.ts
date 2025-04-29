import { db, executeSQL } from './aws-db';
import { 
  users, appointments, patients, services, payments, activities, rooms,
  User, Patient, Service, Room, Appointment, Payment, Activity,
  InsertUser, InsertPatient, InsertService, InsertRoom, InsertAppointment, InsertPayment, InsertActivity 
} from "@shared/schema";
import { desc, eq, gte, and, sql } from "drizzle-orm";
import { IStorage } from './storage';

export class AWSStorage implements IStorage {
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
      userId: patient.userId
    });
    
    return patient;
  }
  
  // Helper method to get next patient ID number
  private async getNextPatientIdNumber(): Promise<number> {
    const result = await executeSQL('SELECT COUNT(*) as count FROM patients');
    const count = result.records?.[0]?.values?.[0]?.longValue || 0;
    return Number(count);
  }
  
  async updatePatient(id: number, data: Partial<InsertPatient>): Promise<Patient> {
    const [updatedPatient] = await db
      .update(patients)
      .set(data)
      .where(eq(patients.id, id))
      .returning();
    
    if (!updatedPatient) {
      throw new Error(`Patient with ID ${id} not found`);
    }
    
    return updatedPatient;
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
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }
  
  // Room operations
  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }
  
  async getRooms(active?: boolean): Promise<Room[]> {
    if (typeof active === 'boolean') {
      return await db.select().from(rooms).where(eq(rooms.isActive, active));
    }
    return await db.select().from(rooms);
  }
  
  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await db.insert(rooms).values(insertRoom).returning();
    return room;
  }
  
  async updateRoom(id: number, data: Partial<InsertRoom>): Promise<Room> {
    const [updatedRoom] = await db
      .update(rooms)
      .set(data)
      .where(eq(rooms.id, id))
      .returning();
    
    if (!updatedRoom) {
      throw new Error(`Room with ID ${id} not found`);
    }
    
    return updatedRoom;
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
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
    
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.date, startOfDay),
          sql`appointments.date <= ${endOfDay}`
        )
      );
  }
  
  async getAppointmentsByRoom(roomId: number, date?: Date): Promise<Appointment[]> {
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      
      return await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.roomId, roomId),
            gte(appointments.date, startOfDay),
            sql`appointments.date <= ${endOfDay}`
          )
        );
    }
    
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.roomId, roomId));
  }
  
  async getAppointmentsForToday(): Promise<Appointment[]> {
    return this.getAppointmentsByDate(new Date());
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values({
        ...insertAppointment,
        createdAt: new Date()
      })
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
    const [updatedAppointment] = await db
      .update(appointments)
      .set(data)
      .where(eq(appointments.id, id))
      .returning();
    
    if (!updatedAppointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    // Create activity
    await this.createActivity({
      type: "appointment.updated",
      description: `Appointment updated for ${new Date(updatedAppointment.date).toLocaleDateString()}`,
      entityId: id,
      entityType: "appointment",
      userId: null
    });
    
    return updatedAppointment;
  }
  
  async cancelAppointment(id: number): Promise<Appointment> {
    const [canceledAppointment] = await db
      .update(appointments)
      .set({ status: "canceled" })
      .where(eq(appointments.id, id))
      .returning();
    
    if (!canceledAppointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    // Create activity
    await this.createActivity({
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
      .values({
        ...insertPayment,
        date: new Date()
      })
      .returning();
    
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
    const [updatedPayment] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    
    if (!updatedPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    return updatedPayment;
  }
  
  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values({
        ...insertActivity,
        timestamp: new Date()
      })
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
    // Get today's appointments
    const todayAppointments = (await this.getAppointmentsForToday()).length;
    
    // New patients in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const result = await executeSQL(`
      SELECT 
        COUNT(*) as new_patients,
        COALESCE(SUM(CASE WHEN a.status = 'canceled' AND a.date >= $1 THEN 1 ELSE 0 END), 0) as cancellations,
        COALESCE(SUM(CASE WHEN p.date >= $1 THEN CAST(p.amount AS DECIMAL) ELSE 0 END), 0) as weekly_revenue
      FROM patients pt
      LEFT JOIN appointments a ON true
      LEFT JOIN payments p ON true
      WHERE pt.last_visit IS NULL OR pt.last_visit >= $1
    `, [oneWeekAgo.toISOString()]);
    
    const newPatients = Number(result.records?.[0]?.values?.[0]?.longValue || 0);
    const cancellations = Number(result.records?.[0]?.values?.[1]?.longValue || 0);
    const weeklyRevenue = Number(result.records?.[0]?.values?.[2]?.doubleValue || 0);
    
    return {
      todayAppointments,
      newPatients,
      weeklyRevenue,
      cancellations
    };
  }
}