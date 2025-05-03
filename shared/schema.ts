import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  isGuest: boolean("is_guest").default(false),
});

// Assessment results model
export const assessmentResults = pgTable("assessment_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  isProbateRequired: boolean("is_probate_required"),
  probateType: text("probate_type"), // "grant_of_probate", "letters_of_administration", etc.
  hasWill: boolean("has_will"),
  isInsolvent: boolean("is_insolvent"),
  hasDispute: boolean("has_dispute"),
  assessmentData: text("assessment_data"), // JSON string of all answers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .pick({
    email: true,
    password: true,
    firstName: true,
    lastName: true,
    isGuest: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

export const insertAssessmentResultSchema = createInsertSchema(assessmentResults)
  .pick({
    userId: true,
    isProbateRequired: true,
    probateType: true,
    hasWill: true,
    isInsolvent: true,
    hasDispute: true,
    assessmentData: true,
  });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAssessmentResult = z.infer<typeof insertAssessmentResultSchema>;
export type AssessmentResult = typeof assessmentResults.$inferSelect;
