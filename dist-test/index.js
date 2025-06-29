var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import cors from "cors";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";

// server/stytch.ts
import * as stytch from "stytch";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  assessmentResults: () => assessmentResults,
  deceasedFormFields: () => deceasedFormFields,
  documents: () => documents,
  estateAssets: () => estateAssets,
  estateLiabilities: () => estateLiabilities,
  evaluationResponses: () => evaluationResponses,
  executors: () => executors,
  insertAssessmentResultSchema: () => insertAssessmentResultSchema,
  insertDeceasedFormFieldsSchema: () => insertDeceasedFormFieldsSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertEstateAssetSchema: () => insertEstateAssetSchema,
  insertEstateLiabilitySchema: () => insertEstateLiabilitySchema,
  insertEvaluationResponseSchema: () => insertEvaluationResponseSchema,
  insertExecutorSchema: () => insertExecutorSchema,
  insertProbateCaseSchema: () => insertProbateCaseSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertUserSchema: () => insertUserSchema,
  probateCases: () => probateCases,
  sessions: () => sessions,
  tasks: () => tasks,
  upsertUserSchema: () => upsertUserSchema,
  users: () => users
});
import { pgTable, text, serial, timestamp, boolean, integer, numeric, date, jsonb, uuid, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  // Replit user ID (string)
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Keep legacy fields for backward compatibility
  password: text("password"),
  lastLogin: timestamp("last_login"),
  isGuest: boolean("is_guest").default(false),
  firebaseUid: text("firebase_uid").unique(),
  photoURL: text("photo_url")
});
var assessmentResults = pgTable("assessment_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  browserSessionId: text("browser_session_id"),
  // For anonymous assessments
  isProbateRequired: boolean("is_probate_required"),
  probateType: text("probate_type"),
  // "grant_of_probate", "letters_of_administration", etc.
  hasWill: boolean("has_will"),
  isInsolvent: boolean("is_insolvent"),
  hasDispute: boolean("has_dispute"),
  assessmentData: text("assessment_data"),
  // JSON string of all answers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var evaluationResponses = pgTable("evaluation_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull(),
  caseId: integer("case_id").references(() => probateCases.id).notNull(),
  answers: jsonb("answers").$type().notNull().default({}),
  derivedFlags: jsonb("derived_flags").$type().notNull().default({}),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var probateCases = pgTable("probate_cases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  assessmentId: integer("assessment_id").references(() => assessmentResults.id),
  referenceNumber: text("reference_number").unique(),
  // Unique reference for the case
  status: text("status").notNull().default("draft"),
  // draft, submitted, approved, etc.
  deceasedFirstName: text("deceased_first_name"),
  deceasedLastName: text("deceased_last_name"),
  deceasedDateOfBirth: date("deceased_dob"),
  deceasedDateOfDeath: date("deceased_dod"),
  deceasedId: integer("deceased_id"),
  // Reference to the deceased person record
  estateValue: numeric("estate_value"),
  // Estimated total value of the estate
  ihtCompleted: boolean("iht_completed").default(false),
  // Inheritance tax form completed
  progress: integer("progress").default(0),
  // Progress percentage (0-100)
  estimatedCompletionDate: date("estimated_completion_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var executors = pgTable("people", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => probateCases.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  // Who created this person
  title: text("title"),
  // e.g. Mr, Mrs, Dr
  firstName: text("first_name").notNull(),
  // Maps to first_names
  middleNames: text("middle_names"),
  // Maps to middle_names
  lastName: text("last_name").notNull(),
  // Maps to last_name
  isNameDifferentInWill: boolean("is_name_different_in_will").default(false),
  // Whether their name is different in the will
  altNameInWill: text("alt_name_will"),
  // Maps to alt_name_will
  addressLine1: text("address_line1"),
  // Maps to address_line1
  addressLine2: text("address_line2"),
  // Maps to address_line2
  city: text("city"),
  // Maps to city (town or city)
  county: text("county"),
  // Maps to county
  postCode: text("post_code"),
  // Maps to postcode
  phoneHome: text("phone_home"),
  // Maps to phone_home
  phoneMobile: text("phone_mobile"),
  // Maps to phone_mobile
  email: text("email"),
  // Maps to email
  relationshipToDeceased: text("relationship"),
  // Maps to relationship
  isExecutor: boolean("is_executor").default(false),
  // Whether this person is an executor
  isApplicant: boolean("is_applicant").default(false),
  // Whether this person is the applicant
  isNotifying: boolean("is_notifying").default(false),
  // Whether this person is notifying only
  personPosition: integer("person_position"),
  // Internal position (1-4)
  status: text("status").default("profile_incomplete"),
  // completed, profile_incomplete, questionnaire_not_started
  needsMoreInfo: boolean("needs_more_info").default(false),
  // Flag for incomplete records
  documentId: integer("document_id"),
  // Reference to the document that created this person (e.g., death certificate)
  // Legacy fields maintained for compatibility
  address: text("address"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var estateAssets = pgTable("estate_assets", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => probateCases.id).notNull(),
  documentId: integer("document_id").references(() => documents.id),
  // Reference to the source document
  type: text("type").notNull(),
  // property, bank_account, investment, vehicle, etc.
  description: text("description").notNull(),
  value: numeric("value"),
  address: text("address"),
  // For properties
  accountNumber: text("account_number"),
  // For accounts/investments
  institution: text("institution"),
  // Bank/investment firm
  ownership: text("ownership").default("sole"),
  // sole, joint
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var estateLiabilities = pgTable("estate_liabilities", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => probateCases.id).notNull(),
  documentId: integer("document_id").references(() => documents.id),
  // Reference to the source document
  type: text("type").notNull(),
  // mortgage, loan, credit_card, utility, tax, funeral_expenses
  description: text("description").notNull(),
  amount: numeric("amount"),
  creditor: text("creditor"),
  accountNumber: text("account_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => probateCases.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  // Who uploaded the document
  type: text("type").notNull(),
  // will, death_certificate, iht_form, etc.
  filename: text("filename").notNull(),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  // MIME type
  storagePath: text("storage_path").notNull(),
  status: text("status").default("processing"),
  // processing, verified, rejected
  notes: text("notes"),
  metadata: jsonb("metadata").$type(),
  // For storing additional document info
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => probateCases.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("not_started"),
  // not_started, in_progress, completed, blocked
  type: text("type").notNull(),
  // document_upload, form_completion, information_gathering, etc.
  order: integer("order").notNull(),
  // For sequencing tasks
  isRequired: boolean("is_required").default(true),
  requiredDocumentTypes: text("required_document_types"),
  // JSON string of document types needed
  dependencies: text("dependencies"),
  // JSON string of task IDs that must be completed first
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true
}).extend({
  email: z.string().email("Please enter a valid email address").optional(),
  profileImageUrl: z.string().optional()
});
var upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true
});
var insertAssessmentResultSchema = createInsertSchema(assessmentResults).pick({
  userId: true,
  isProbateRequired: true,
  probateType: true,
  hasWill: true,
  isInsolvent: true,
  hasDispute: true,
  assessmentData: true
});
var insertProbateCaseSchema = createInsertSchema(probateCases).pick({
  userId: true,
  assessmentId: true,
  deceasedFirstName: true,
  deceasedLastName: true,
  deceasedDateOfBirth: true,
  deceasedDateOfDeath: true,
  estateValue: true,
  ihtCompleted: true
});
var insertExecutorSchema = createInsertSchema(executors).pick({
  caseId: true,
  userId: true,
  title: true,
  firstName: true,
  middleNames: true,
  lastName: true,
  isNameDifferentInWill: true,
  altNameInWill: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  county: true,
  postCode: true,
  phoneHome: true,
  phoneMobile: true,
  email: true,
  relationshipToDeceased: true,
  isExecutor: true,
  isApplicant: true,
  isNotifying: true,
  personPosition: true,
  status: true,
  needsMoreInfo: true,
  // Legacy fields included for compatibility
  address: true,
  phone: true
});
var insertEstateAssetSchema = createInsertSchema(estateAssets).pick({
  caseId: true,
  documentId: true,
  type: true,
  description: true,
  value: true,
  address: true,
  accountNumber: true,
  institution: true,
  ownership: true,
  notes: true
});
var insertEstateLiabilitySchema = createInsertSchema(estateLiabilities).pick({
  caseId: true,
  documentId: true,
  type: true,
  description: true,
  amount: true,
  creditor: true,
  accountNumber: true,
  notes: true
});
var insertDocumentSchema = createInsertSchema(documents).pick({
  caseId: true,
  userId: true,
  type: true,
  filename: true,
  fileSize: true,
  fileType: true,
  storagePath: true,
  status: true,
  notes: true,
  metadata: true
});
var insertEvaluationResponseSchema = createInsertSchema(evaluationResponses).pick({
  userId: true,
  caseId: true,
  answers: true,
  derivedFlags: true,
  completedAt: true
});
var insertTaskSchema = createInsertSchema(tasks).pick({
  caseId: true,
  title: true,
  description: true,
  status: true,
  type: true,
  order: true,
  isRequired: true,
  requiredDocumentTypes: true,
  dependencies: true
});
var deceasedFormFields = pgTable("deceased_form_fields", {
  personId: integer("person_id").primaryKey().references(() => executors.id),
  // Foreign key to people table with role = deceased
  dateOfBirth: date("date_of_birth"),
  // Required
  dateOfDeath: date("date_of_death"),
  // Required
  wasKnownByOtherNames: boolean("was_known_by_other_names"),
  // Required
  otherNamesHeldAssets: jsonb("other_names_held_assets").$type(),
  // Array of names, required if wasKnownByOtherNames is true
  domicileInEnglandOrWales: boolean("domicile_in_england_or_wales"),
  // Required
  maritalStatus: text("marital_status"),
  // ENUM: never_married, widowed, married, divorced, separated
  marriedDate: date("married_date"),
  // Required if maritalStatus = married
  divorcedDate: date("divorced_date"),
  // Required if maritalStatus = divorced
  divorceCourt: text("divorce_court"),
  // Required if maritalStatus = divorced
  separatedDate: date("separated_date"),
  // Required if maritalStatus = separated
  separationCourt: text("separation_court"),
  // Required if maritalStatus = separated
  hadForeignAssets: boolean("had_foreign_assets"),
  // Required
  foreignAssetValueGbp: numeric("foreign_asset_value_gbp"),
  // Required if hadForeignAssets = true
  landWasSettled: boolean("land_was_settled"),
  // Required
  executorsApplying: boolean("executors_applying"),
  // Required, can be prepopulated from people[]
  hasAdoptionHistory: boolean("has_adoption_history"),
  // Required
  adoptedRelatives: jsonb("adopted_relatives").$type(),
  // Required if hasAdoptionHistory = true
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertDeceasedFormFieldsSchema = createInsertSchema(deceasedFormFields).pick({
  personId: true,
  dateOfBirth: true,
  dateOfDeath: true,
  wasKnownByOtherNames: true,
  otherNamesHeldAssets: true,
  domicileInEnglandOrWales: true,
  maritalStatus: true,
  marriedDate: true,
  divorcedDate: true,
  divorceCourt: true,
  separatedDate: true,
  separationCourt: true,
  hadForeignAssets: true,
  foreignAssetValueGbp: true,
  landWasSettled: true,
  executorsApplying: true,
  hasAdoptionHistory: true,
  adoptedRelatives: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getAssessmentResult(id) {
    const [result] = await db.select().from(assessmentResults).where(eq(assessmentResults.id, id));
    return result;
  }
  async getAssessmentResultsByUserId(userId) {
    return await db.select().from(assessmentResults).where(eq(assessmentResults.userId, userId));
  }
  async createAssessmentResult(assessment) {
    const [result] = await db.insert(assessmentResults).values(assessment).returning();
    return result;
  }
  async updateAssessmentResult(id, assessment) {
    const [result] = await db.update(assessmentResults).set({ ...assessment, updatedAt: /* @__PURE__ */ new Date() }).where(eq(assessmentResults.id, id)).returning();
    return result;
  }
  // Probate Case methods
  async getProbateCase(id) {
    const [probateCase] = await db.select().from(probateCases).where(eq(probateCases.id, id));
    return probateCase;
  }
  async getProbateCasesByUserId(userId) {
    return await db.select().from(probateCases).where(eq(probateCases.userId, userId));
  }
  async createProbateCase(caseData) {
    const [probateCase] = await db.insert(probateCases).values(caseData).returning();
    return probateCase;
  }
  async updateProbateCase(id, caseData) {
    const [probateCase] = await db.update(probateCases).set({ ...caseData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(probateCases.id, id)).returning();
    return probateCase;
  }
  // People/Executor methods
  async getExecutor(id) {
    const [executor] = await db.select().from(executors).where(eq(executors.id, id));
    return executor;
  }
  async getExecutorsByCaseId(caseId) {
    return await db.select().from(executors).where(eq(executors.caseId, caseId));
  }
  async getPeopleByCaseId(caseId) {
    return await db.select().from(executors).where(eq(executors.caseId, caseId));
  }
  async createExecutor(executorData) {
    const [executor] = await db.insert(executors).values(executorData).returning();
    return executor;
  }
  async updateExecutor(id, executorData) {
    const [executor] = await db.update(executors).set({ ...executorData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(executors.id, id)).returning();
    return executor;
  }
  async deleteExecutor(id) {
    await db.delete(executors).where(eq(executors.id, id));
  }
  // Estate Asset methods
  async getEstateAsset(id) {
    const [asset] = await db.select().from(estateAssets).where(eq(estateAssets.id, id));
    return asset;
  }
  async getEstateAssetsByCaseId(caseId) {
    return await db.select().from(estateAssets).where(eq(estateAssets.caseId, caseId));
  }
  async createEstateAsset(assetData) {
    const [asset] = await db.insert(estateAssets).values(assetData).returning();
    return asset;
  }
  async updateEstateAsset(id, assetData) {
    const [asset] = await db.update(estateAssets).set({ ...assetData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(estateAssets.id, id)).returning();
    return asset;
  }
  async deleteEstateAsset(id) {
    await db.delete(estateAssets).where(eq(estateAssets.id, id));
  }
  // Estate Liability methods
  async getEstateLiability(id) {
    const [liability] = await db.select().from(estateLiabilities).where(eq(estateLiabilities.id, id));
    return liability;
  }
  async getEstateLiabilitiesByCaseId(caseId) {
    return await db.select().from(estateLiabilities).where(eq(estateLiabilities.caseId, caseId));
  }
  async createEstateLiability(liabilityData) {
    const [liability] = await db.insert(estateLiabilities).values(liabilityData).returning();
    return liability;
  }
  async updateEstateLiability(id, liabilityData) {
    const [liability] = await db.update(estateLiabilities).set({ ...liabilityData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(estateLiabilities.id, id)).returning();
    return liability;
  }
  async deleteEstateLiability(id) {
    await db.delete(estateLiabilities).where(eq(estateLiabilities.id, id));
  }
  // Document methods
  async getDocument(id) {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  async getDocumentsByCaseId(caseId) {
    return await db.select().from(documents).where(eq(documents.caseId, caseId));
  }
  async getDocumentsByType(caseId, type) {
    return await db.select().from(documents).where(eq(documents.caseId, caseId)).where(eq(documents.type, type));
  }
  async createDocument(documentData) {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }
  async updateDocument(id, documentData) {
    const [document] = await db.update(documents).set({ ...documentData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(documents.id, id)).returning();
    return document;
  }
  // Task methods
  async getTask(id) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  async getTasksByCaseId(caseId) {
    return await db.select().from(tasks).where(eq(tasks.caseId, caseId));
  }
  async createTask(taskData) {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }
  async updateTask(id, taskData) {
    const [task] = await db.update(tasks).set({ ...taskData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tasks.id, id)).returning();
    return task;
  }
  // Deceased Form Fields methods
  async getDeceasedFormFields(personId) {
    const [fields] = await db.select().from(deceasedFormFields).where(eq(deceasedFormFields.personId, personId));
    return fields;
  }
  async createDeceasedFormFields(data) {
    const [fields] = await db.insert(deceasedFormFields).values(data).returning();
    return fields;
  }
  async updateDeceasedFormFields(personId, data) {
    const [fields] = await db.update(deceasedFormFields).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(deceasedFormFields.personId, personId)).returning();
    return fields;
  }
  async isDeceasedFormFieldsComplete(personId) {
    const fields = await this.getDeceasedFormFields(personId);
    if (!fields) return false;
    const requiredFields = [
      "dateOfBirth",
      "dateOfDeath",
      "wasKnownByOtherNames",
      "domicileInEnglandOrWales",
      "maritalStatus",
      "hadForeignAssets",
      "landWasSettled",
      "executorsApplying",
      "hasAdoptionHistory"
    ];
    return requiredFields.every((field) => fields[field] !== null && fields[field] !== void 0);
  }
  async getDeceasedFormFieldsCompletionStatus(personId) {
    const fields = await this.getDeceasedFormFields(personId);
    if (!fields) {
      return { complete: false, missingFields: ["All fields"] };
    }
    const requiredFields = [
      "dateOfBirth",
      "dateOfDeath",
      "wasKnownByOtherNames",
      "domicileInEnglandOrWales",
      "maritalStatus",
      "hadForeignAssets",
      "landWasSettled",
      "executorsApplying",
      "hasAdoptionHistory"
    ];
    const missingFields = requiredFields.filter(
      (field) => fields[field] === null || fields[field] === void 0
    );
    return { complete: missingFields.length === 0, missingFields };
  }
  // Evaluation Response methods
  async getEvaluationResponse(caseId) {
    const [response] = await db.select().from(evaluationResponses).where(eq(evaluationResponses.caseId, caseId));
    return response;
  }
  async createEvaluationResponse(data) {
    const [response] = await db.insert(evaluationResponses).values(data).returning();
    return response;
  }
  async updateEvaluationResponse(caseId, data) {
    const [response] = await db.update(evaluationResponses).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(evaluationResponses.caseId, caseId)).returning();
    return response;
  }
};
var storage = new DatabaseStorage();

// server/stytch.ts
if (!process.env.STYTCH_PROJECT_ID || !process.env.STYTCH_SECRET) {
  throw new Error("STYTCH_PROJECT_ID and STYTCH_SECRET must be set");
}
var stytchClient = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_SECRET,
  env: process.env.NODE_ENV === "production" ? stytch.envs.live : stytch.envs.test
});
var verifyStytchSession = async (req, res, next) => {
  try {
    const sessionToken = req.session?.stytchSessionToken;
    if (!sessionToken) {
      console.log("No session token found in request");
      return res.status(401).json({ message: "No session token" });
    }
    console.log("Verifying session token with Stytch...");
    const authResult = await stytchClient.sessions.authenticate({
      session_token: sessionToken
    });
    if (authResult.status_code !== 200) {
      console.log("Invalid session from Stytch:", authResult.status_code);
      return res.status(401).json({ message: "Invalid session" });
    }
    const user = await storage.getUser(authResult.session.user_id);
    if (!user) {
      console.log("User not found in database:", authResult.session.user_id);
      return res.status(401).json({ message: "User not found" });
    }
    console.log("User authenticated successfully:", user.id);
    req.user = user;
    next();
  } catch (error) {
    console.error("Stytch session verification error:", error);
    res.status(401).json({ message: "Session verification failed" });
  }
};
function setupStytchAuth(app2) {
  app2.post("/api/auth/magic-link", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }
      const result = await stytchClient.magicLinks.email.loginOrCreate({
        email,
        login_magic_link_url: `${req.protocol}://${req.get("host")}/auth/callback`,
        signup_magic_link_url: `${req.protocol}://${req.get("host")}/auth/callback`
      });
      if (result.status_code === 200) {
        res.json({ message: "Magic link sent successfully" });
      } else {
        res.status(400).json({ message: "Failed to send magic link" });
      }
    } catch (error) {
      console.error("Magic link error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/send-magic-link", async (req, res) => {
    try {
      const { email, loginRedirectURL, signupRedirectURL } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const result = await stytchClient.magicLinks.email.loginOrCreate({
        email,
        login_magic_link_url: loginRedirectURL || `${req.protocol}://${req.get("host")}/auth/callback`,
        signup_magic_link_url: signupRedirectURL || `${req.protocol}://${req.get("host")}/auth/callback`
      });
      if (result.status_code === 200) {
        res.json({ success: true, message: "Magic link sent successfully" });
      } else {
        res.status(400).json({ message: "Failed to send magic link" });
      }
    } catch (error) {
      console.error("Magic link error:", error);
      res.status(500).json({ message: "Failed to send magic link" });
    }
  });
  app2.post("/api/auth/password-signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const result = await stytchClient.passwords.create({
        email,
        password,
        session_duration_minutes: 60 * 24 * 30
        // 30 days
      });
      if (result.status_code === 200 && result.session_token) {
        await storage.upsertUser({
          id: result.user_id,
          email: result.email,
          firstName: result.user?.name?.first_name || null,
          lastName: result.user?.name?.last_name || null,
          profileImageUrl: null
        });
        req.session.stytchSessionToken = result.session_token;
        res.json({ success: true, user_id: result.user_id });
      } else {
        res.status(400).json({ message: "Failed to sign up with password" });
      }
    } catch (error) {
      console.error("Stytch password signup error:", error);
      const msg = error?.error_message || error?.message || "Internal server error";
      res.status(500).json({ message: msg });
    }
  });
  app2.post("/api/auth/password-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const result = await stytchClient.passwords.authenticate({
        email,
        password,
        session_duration_minutes: 60 * 24 * 30
        // 30 days
      });
      if (result.status_code === 200 && result.session_token) {
        await storage.upsertUser({
          id: result.user_id,
          email: result.email,
          firstName: result.user?.name?.first_name || null,
          lastName: result.user?.name?.last_name || null,
          profileImageUrl: null
        });
        req.session.stytchSessionToken = result.session_token;
        res.json({ success: true, user_id: result.user_id });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Stytch password login error:", error);
      const msg = error?.error_message || error?.message || "Internal server error";
      res.status(401).json({ message: msg });
    }
  });
  app2.get("/api/auth/google", async (req, res) => {
    try {
      const redirectUrl = `${req.protocol}://${req.get("host")}/api/auth/callback`;
      console.log("Starting Google OAuth with redirect URL:", redirectUrl);
      const publicToken = process.env.STYTCH_PUBLIC_TOKEN || process.env.STYTCH_PROJECT_ID || "";
      const isLiveToken = publicToken.includes("live");
      const apiUrl = isLiveToken ? "https://api.stytch.com" : "https://test.stytch.com";
      console.log("Token type detection - isLive:", isLiveToken, "apiUrl:", apiUrl);
      console.log("Public token prefix:", publicToken.substring(0, 30));
      const params = new URLSearchParams({
        public_token: publicToken,
        login_redirect_url: redirectUrl,
        signup_redirect_url: redirectUrl
      });
      const oauthUrl = `${apiUrl}/v1/public/oauth/google/start?${params.toString()}`;
      console.log("Redirecting to Stytch Google OAuth URL:", oauthUrl);
      res.redirect(oauthUrl);
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.redirect("/auth?error=oauth_error");
    }
  });
  app2.get("/api/auth/callback", async (req, res) => {
    try {
      const { token, stytch_token_type } = req.query;
      if (!token || typeof token !== "string") {
        return res.redirect("/auth?error=invalid_token");
      }
      let result;
      if (stytch_token_type === "oauth") {
        result = await stytchClient.oauth.authenticate({
          token
        });
      } else {
        result = await stytchClient.magicLinks.authenticate({
          token
        });
      }
      if (result.status_code === 200) {
        req.session.stytchSessionToken = result.session_token;
        await storage.upsertUser({
          id: result.user.user_id,
          email: result.user.emails?.[0]?.email || null,
          firstName: result.user.name?.first_name || null,
          lastName: result.user.name?.last_name || null,
          profileImageUrl: null
        });
        res.redirect("/?auth_success=true");
      } else {
        res.redirect("/auth?error=authentication_failed");
      }
    } catch (error) {
      console.error("Authentication callback error:", error);
      res.redirect("/auth?error=server_error");
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      if (process.env.NODE_ENV === "development") {
        const testUser = {
          id: "dev-user-123",
          email: "dev@example.com",
          firstName: "Development",
          lastName: "User",
          profileImageUrl: null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        try {
          await storage.upsertUser(testUser);
        } catch (error) {
          console.log("Note: Could not create test user in database, using in-memory user");
        }
        return res.json(testUser);
      }
      const sessionToken = req.session?.stytchSessionToken;
      if (!sessionToken) {
        console.log("No session token found in request");
        return res.status(401).json({ message: "No session token" });
      }
      const authResult = await stytchClient.sessions.authenticate({
        session_token: sessionToken
      });
      if (authResult.status_code !== 200) {
        console.log("Invalid session from Stytch:", authResult.status_code);
        return res.status(401).json({ message: "Invalid session" });
      }
      const user = await storage.getUser(authResult.session.user_id);
      if (!user) {
        console.log("User not found in database:", authResult.session.user_id);
        return res.status(401).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", verifyStytchSession, async (req, res) => {
    try {
      const sessionToken = req.session?.stytchSessionToken;
      if (sessionToken) {
        await stytchClient.sessions.revoke({
          session_token: sessionToken
        });
      }
      req.session.destroy(() => {
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

// server/routes.ts
import multer from "multer";
import * as fs from "fs";
import * as path from "path";
import { WebSocketServer, WebSocket } from "ws";
var uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp2 = Date.now();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    cb(null, `${baseName}-${timestamp2}${extension}`);
  }
});
var upload = multer({ storage: storage2 });
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  setupStytchAuth(app2);
  console.log("Stytch authentication middleware registered");
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws",
    clientTracking: true
  });
  wss.on("connection", (ws2, req) => {
    console.log(`New WebSocket connection from ${req.socket.remoteAddress}`);
    ws2.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log("Received WebSocket message:", message);
        ws2.send(JSON.stringify({
          type: "echo",
          data: message,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    });
    ws2.on("close", () => {
      console.log("WebSocket connection closed");
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  const broadcast = (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "broadcast",
          data: message,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
    });
  };
  const requireAuth = verifyStytchSession;
  app2.post("/api/session-refresh", (req, res) => {
    if (req.session) {
      req.session.touch();
      res.json({
        message: "Session refreshed successfully",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      res.status(401).json({ message: "No active session" });
    }
  });
  app2.get("/api/test-auth", requireAuth, (req, res) => {
    const user = req.user;
    res.json({ message: "Authentication successful", user });
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/assessment", (req, res) => {
    res.json(null);
  });
  app2.get("/api/probate-cases", (req, res) => {
    res.json([]);
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(path3.join(__dirname, "../public")));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/config.ts
import { z as z2 } from "zod";
import path4 from "path";
var envSchema = z2.object({
  // Node environment
  NODE_ENV: z2.enum(["development", "production", "test"]).default("development"),
  // Server configuration
  PORT: z2.string().transform(Number).default("5000"),
  HOST: z2.string().default("0.0.0.0"),
  // Security
  SESSION_SECRET: z2.string().min(32, "Session secret must be at least 32 characters"),
  COOKIE_SECRET: z2.string().min(32, "Cookie secret must be at least 32 characters"),
  // Domains and CORS
  ALLOWED_ORIGINS: z2.string().transform((s) => s.split(",").map((origin) => origin.trim())).default("http://localhost:5000,https://probateswift.com"),
  // Database
  DATABASE_URL: z2.string().url("Invalid database URL"),
  // Firebase (if used)
  FIREBASE_PROJECT_ID: z2.string().optional(),
  FIREBASE_PRIVATE_KEY: z2.string().optional(),
  FIREBASE_CLIENT_EMAIL: z2.string().email().optional(),
  // File upload
  UPLOAD_DIR: z2.string().default(path4.join(process.cwd(), "uploads")),
  MAX_FILE_SIZE: z2.string().transform(Number).default("5242880"),
  // 5MB in bytes
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z2.string().transform(Number).default("900000"),
  // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z2.string().transform(Number).default("100")
});
var parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      const missingVars = error.errors.filter((err) => err.code === "invalid_type" && err.received === "undefined").map((err) => err.path.join("."));
      if (missingVars.length > 0) {
        console.error("Missing required environment variables:", missingVars.join(", "));
      }
      const invalidVars = error.errors.filter((err) => err.code !== "invalid_type").map((err) => `${err.path.join(".")}: ${err.message}`);
      if (invalidVars.length > 0) {
        console.error("Invalid environment variables:", invalidVars.join(", "));
      }
    }
    throw error;
  }
};
var config = parseEnv();
var isProduction = config.NODE_ENV === "production";

// server/middleware/security.ts
import helmet from "helmet";
import rateLimit from "express-rate-limit";
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 1e3,
  // Very high limit for development
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV === "development" && req.path.startsWith("/api/auth")) {
      return true;
    }
    return false;
  }
});
var helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://*.replit.dev",
        "https://*.stytch.com",
        "https://*.googleapis.com",
        "https://www.gstatic.com",
        "https://accounts.google.com",
        "https://replit.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://*.probateswift.com",
        "https://*.replit.dev",
        "wss://*.replit.dev",
        "https://*.googleapis.com",
        "https://firebase.googleapis.com",
        "https://accounts.google.com"
      ],
      fontSrc: [
        "'self'",
        "https:",
        "data:",
        "https://fonts.gstatic.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://accounts.google.com"
      ]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "sameorigin" },
  hidePoweredBy: true,
  hsts: config.NODE_ENV === "production" ? {
    maxAge: 31536e3,
    includeSubDomains: true,
    preload: true
  } : false,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});
var corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const allowedOrigins = config.ALLOWED_ORIGINS;
    const isReplitDomain = origin.includes(".replit.dev") || origin.includes(".kirk.replit.dev");
    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
    if (allowedOrigins.includes(origin) || isReplitDomain || isLocalhost) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400
  // 24 hours
};
var securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.removeHeader("X-Powered-By");
  next();
};
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: "Invalid request data",
          details: error.message
        });
      } else {
        res.status(400).json({
          error: "Invalid request data",
          details: "Unknown validation error"
        });
      }
    }
  };
};
var securityMiddleware = {
  helmet: helmetConfig,
  limiter,
  corsOptions,
  securityHeaders,
  validateRequest
};

// server/errors.ts
var AppError = class _AppError extends Error {
  constructor(statusCode, message, code, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, _AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
};
var ValidationError = class extends AppError {
  constructor(message, details) {
    super(400, message, "VALIDATION_ERROR");
    this.details = details;
  }
  details;
};
var NotFoundError = class extends AppError {
  constructor(message = "Resource not found") {
    super(404, message, "NOT_FOUND_ERROR");
  }
};
var errorHandler = (err, req, res, next) => {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...err instanceof ValidationError && err.details ? { details: err.details } : {}
    });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      code: "VALIDATION_ERROR",
      details: err.errors
    });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      code: "INVALID_TOKEN"
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      code: "TOKEN_EXPIRED"
    });
  }
  const statusCode = err.statusCode || 500;
  const message = config.NODE_ENV === "production" ? "Internal server error" : err.message || "An unexpected error occurred";
  return res.status(statusCode).json({
    error: message,
    code: "INTERNAL_SERVER_ERROR",
    ...config.NODE_ENV === "production" ? {} : { stack: err.stack }
  });
};
var notFoundHandler = (req, res) => {
  throw new NotFoundError(`Route ${req.method} ${req.path} not found`);
};

// server/index.ts
var app = express2();
app.set("trust proxy", 1);
app.use(securityMiddleware.helmet);
app.use(securityMiddleware.securityHeaders);
app.use(cors(securityMiddleware.corsOptions));
app.use(securityMiddleware.limiter);
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
(async () => {
  const server = await registerRoutes(app);
  if (config.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  app.use(notFoundHandler);
  app.use(errorHandler);
  server.listen({
    port: config.PORT,
    host: config.HOST,
    reusePort: true
  }, () => {
    log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
  });
})().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
