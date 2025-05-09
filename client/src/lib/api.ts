import { Appointment, Patient, Service } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Appointment related API functions
export async function getAppointments(): Promise<Appointment[]> {
  const response = await fetch("/api/appointments");
  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }
  return response.json();
}

export async function getAppointment(id: number): Promise<Appointment> {
  const response = await fetch(`/api/appointments/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch appointment with ID ${id}`);
  }
  return response.json();
}

export async function createAppointment(appointmentData: any): Promise<Appointment> {
  const response = await apiRequest("POST", "/api/appointments", appointmentData);
  return response.json();
}

export async function updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment> {
  const response = await apiRequest("PATCH", `/api/appointments/${id}`, data);
  return response.json();
}

export async function cancelAppointment(id: number): Promise<Appointment> {
  const response = await apiRequest("POST", `/api/appointments/${id}/cancel`, {});
  return response.json();
}

// Patient related API functions
export async function getPatients(): Promise<Patient[]> {
  const response = await fetch("/api/patients");
  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }
  return response.json();
}

export async function getPatient(id: number): Promise<Patient> {
  const response = await fetch(`/api/patients/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch patient with ID ${id}`);
  }
  return response.json();
}

export async function createPatient(patientData: any): Promise<Patient> {
  const response = await apiRequest("POST", "/api/patients", patientData);
  return response.json();
}

// Service related API functions
export async function getServices(): Promise<Service[]> {
  const response = await fetch("/api/services");
  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }
  return response.json();
}

// Payment related API functions
export async function createPaymentIntent(amount: number, appointmentId: number, patientId: number): Promise<{clientSecret: string}> {
  try {
    const response = await apiRequest("POST", "/api/create-payment-intent", {
      amount,
      appointmentId,
      patientId
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create payment intent");
    }
    
    return response.json();
  } catch (error) {
    console.error("Payment intent creation failed:", error);
    throw error;
  }
}

export async function recordPayment(paymentData: any): Promise<any> {
  const response = await apiRequest("POST", "/api/payments", paymentData);
  return response.json();
}

// Dashboard statistics API functions
export async function getDashboardStats(): Promise<any> {
  const response = await fetch("/api/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard statistics");
  }
  return response.json();
}

// Activities API functions
export async function getRecentActivities(limit: number = 10): Promise<any> {
  const response = await fetch(`/api/activities?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch recent activities");
  }
  return response.json();
}
