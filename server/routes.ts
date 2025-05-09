import { createServer } from 'http';
import express from 'express';
import { db } from './db';
import { pgTable, serial, text, timestamp, integer, numeric, boolean } from 'drizzle-orm/pg-core';
import { Storage } from './storage';

export async function registerRoutes(app: express.Application) {
  const server = createServer(app);

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Treatment packages API
  app.get('/api/treatment-packages', async (req, res) => {
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

      const packages = await db.select().from(treatmentPackages).where({ active: true });
      res.json(packages);
    } catch (error) {
      console.error("Error fetching treatment packages:", error);
      res.status(500).json({ message: "Failed to fetch treatment packages" });
    }
  });

  // Users API
  app.get('/api/users', async (req, res) => {
    try {
      const users = pgTable("users", {
        id: serial("id").primaryKey(),
        username: text("username").notNull().unique(),
        password: text("password").notNull(),
        email: text("email").notNull(),
        name: text("name"),
        role: text("role").default("user"),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
      });

      const allUsers = await db.select().from(users);

      // Don't return passwords in the response
      const safeUsers = allUsers.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });

      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Seed initial data if needed
  await seedInitialData();

  return server;
}

async function seedInitialData() {
  // Seed users if not exists
  try {
    const users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email").notNull(),
      name: text("name"),
      role: text("role").default("user"),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow(),
    });

    const existingUsers = await db.select().from(users);

    if (existingUsers.length === 0) {
      console.log("Seeding initial user data...");

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
            description: "A gentle therapeutic light therapy package designed for seniors.",
            focus: "Cellular support, circulation, mood and mobility",
            idealFor: "Seniors looking to maintain vitality and mobility",
            duration: "30 minutes",
            sessionType: "Red Light Therapy",
            sessionCount: 8,
            sessionCost: 45,
            totalCost: 320,
            addOns: "Complimentary mobility assessment",
            bonuses: "Free wellness guide for seniors",
            active: true,
            category: "specialty",
            packageType: "light_therapy"
          },
          {
            name: "standard_wellness",
            displayName: "Wellness Essentials",
            description: "Our standard light therapy package for overall wellness.",
            focus: "General wellness, stress reduction, and recovery",
            idealFor: "Adults seeking overall health improvement",
            duration: "45 minutes",
            sessionType: "Full Spectrum Light Therapy",
            sessionCount: 10,
            sessionCost: 50,
            totalCost: 450,
            addOns: "Complimentary wellness consultation",
            bonuses: "Wellness journal included",
            active: true,
            category: "standard",
            packageType: "light_therapy"
          }
        ]);
      }
    } catch (error) {
      console.error("Error seeding treatment packages:", error);
    }
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}