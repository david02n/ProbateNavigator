import { 
  users, 
  assessmentResults,
  probateCases,
  executors,
  estateAssets,
  estateLiabilities,
  documents,
  tasks,
  type User, 
  type InsertUser, 
  type AssessmentResult, 
  type InsertAssessmentResult,
  type ProbateCase,
  type InsertProbateCase,
  type Executor,
  type InsertExecutor,
  type EstateAsset,
  type InsertEstateAsset,
  type EstateLiability,
  type InsertEstateLiability,
  type Document,
  type InsertDocument,
  type Task,
  type InsertTask
} from "@shared/schema";
import * as session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session as any);
const PostgresSessionStore = connectPg(session as any);

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;
  
  // Assessment methods
  getAssessmentResult(id: number): Promise<AssessmentResult | undefined>;
  getAssessmentResultsByUserId(userId: number): Promise<AssessmentResult[]>;
  createAssessmentResult(assessment: InsertAssessmentResult): Promise<AssessmentResult>;
  updateAssessmentResult(id: number, assessment: Partial<InsertAssessmentResult>): Promise<AssessmentResult | undefined>;
  
  // Probate Case methods
  getProbateCase(id: number): Promise<ProbateCase | undefined>;
  getProbateCasesByUserId(userId: number): Promise<ProbateCase[]>;
  createProbateCase(caseData: InsertProbateCase): Promise<ProbateCase>;
  updateProbateCase(id: number, caseData: Partial<InsertProbateCase>): Promise<ProbateCase | undefined>;
  
  // Executor methods
  getExecutor(id: number): Promise<Executor | undefined>;
  getExecutorsByCaseId(caseId: number): Promise<Executor[]>;
  createExecutor(executorData: InsertExecutor): Promise<Executor>;
  updateExecutor(id: number, executorData: Partial<InsertExecutor>): Promise<Executor | undefined>;
  
  // Estate Asset methods
  getEstateAsset(id: number): Promise<EstateAsset | undefined>;
  getEstateAssetsByCaseId(caseId: number): Promise<EstateAsset[]>;
  createEstateAsset(assetData: InsertEstateAsset): Promise<EstateAsset>;
  updateEstateAsset(id: number, assetData: Partial<InsertEstateAsset>): Promise<EstateAsset | undefined>;
  
  // Estate Liability methods
  getEstateLiability(id: number): Promise<EstateLiability | undefined>;
  getEstateLiabilitiesByCaseId(caseId: number): Promise<EstateLiability[]>;
  createEstateLiability(liabilityData: InsertEstateLiability): Promise<EstateLiability>;
  updateEstateLiability(id: number, liabilityData: Partial<InsertEstateLiability>): Promise<EstateLiability | undefined>;
  
  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByCaseId(caseId: number): Promise<Document[]>;
  getDocumentsByType(caseId: number, type: string): Promise<Document[]>;
  createDocument(documentData: InsertDocument): Promise<Document>;
  updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByCaseId(caseId: number): Promise<Task[]>;
  createTask(taskData: InsertTask): Promise<Task>;
  updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assessments: Map<number, AssessmentResult>;
  private userIdCounter: number;
  private assessmentIdCounter: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.userIdCounter = 2; // Start at 2 since we'll create a test user with ID 1
    this.assessmentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Add a test user for login testing with correctly formatted password
    // Format should be scrypt(password, salt, 64).toString("hex") + "." + salt
    const testUserPassword = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92c10b7d1d0aae37510b659b3958424a67fdfce21c67f5b8c46989fdada96c823.1111111111111111"; // "1234" with salt "1111111111111111"
    const testUser: User = {
      id: 1,
      email: "test@probateswift.com",
      password: testUserPassword,
      firstName: "Test",
      lastName: "User",
      isGuest: false,
      createdAt: new Date(),
      lastLogin: null
    };
    this.users.set(1, testUser);
    
    // Add a test assessment result for the test user
    const testAssessment: AssessmentResult = {
      id: 1,
      userId: 1,
      isProbateRequired: true,
      probateType: "Grant of Probate",
      hasWill: true,
      isInsolvent: false,
      hasDispute: false,
      assessmentData: JSON.stringify({
        result: {
          isProbateRequired: true,
          probateType: "Grant of Probate"
        },
        answers: {
          q1: "yes",
          q2: "yes",
          q3: "no",
          q4: "no"
        }
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.assessments.set(1, testAssessment);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Construct the user with all required fields
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      createdAt: now,
      lastLogin: now,
      isGuest: insertUser.isGuest || false
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }

  // Assessment methods
  async getAssessmentResult(id: number): Promise<AssessmentResult | undefined> {
    return this.assessments.get(id);
  }

  async getAssessmentResultsByUserId(userId: number): Promise<AssessmentResult[]> {
    return Array.from(this.assessments.values()).filter(
      (assessment) => assessment.userId === userId
    );
  }

  async createAssessmentResult(assessment: InsertAssessmentResult): Promise<AssessmentResult> {
    const id = this.assessmentIdCounter++;
    const now = new Date();
    
    // Construct the assessment with all required fields
    const newAssessment: AssessmentResult = {
      id,
      userId: assessment.userId,
      isProbateRequired: assessment.isProbateRequired || null,
      probateType: assessment.probateType || null,
      hasWill: assessment.hasWill || null,
      isInsolvent: assessment.isInsolvent || null,
      hasDispute: assessment.hasDispute || null,
      assessmentData: assessment.assessmentData || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.assessments.set(id, newAssessment);
    return newAssessment;
  }

  async updateAssessmentResult(id: number, assessment: Partial<InsertAssessmentResult>): Promise<AssessmentResult | undefined> {
    const existingAssessment = this.assessments.get(id);
    if (!existingAssessment) {
      return undefined;
    }
    
    // Update only the fields that were provided
    const updatedAssessment: AssessmentResult = {
      ...existingAssessment,
      userId: assessment.userId !== undefined ? assessment.userId : existingAssessment.userId,
      isProbateRequired: assessment.isProbateRequired !== undefined ? assessment.isProbateRequired : existingAssessment.isProbateRequired,
      probateType: assessment.probateType !== undefined ? assessment.probateType : existingAssessment.probateType,
      hasWill: assessment.hasWill !== undefined ? assessment.hasWill : existingAssessment.hasWill,
      isInsolvent: assessment.isInsolvent !== undefined ? assessment.isInsolvent : existingAssessment.isInsolvent,
      hasDispute: assessment.hasDispute !== undefined ? assessment.hasDispute : existingAssessment.hasDispute,
      assessmentData: assessment.assessmentData !== undefined ? assessment.assessmentData : existingAssessment.assessmentData,
      updatedAt: new Date()
    };
    
    this.assessments.set(id, updatedAssessment);
    return updatedAssessment;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // Assessment methods
  async getAssessmentResult(id: number): Promise<AssessmentResult | undefined> {
    const [assessment] = await db.select().from(assessmentResults).where(eq(assessmentResults.id, id));
    return assessment;
  }

  async getAssessmentResultsByUserId(userId: number): Promise<AssessmentResult[]> {
    return await db.select().from(assessmentResults).where(eq(assessmentResults.userId, userId));
  }

  async createAssessmentResult(assessment: InsertAssessmentResult): Promise<AssessmentResult> {
    const [result] = await db.insert(assessmentResults).values(assessment).returning();
    return result;
  }

  async updateAssessmentResult(id: number, assessment: Partial<InsertAssessmentResult>): Promise<AssessmentResult | undefined> {
    const [updatedAssessment] = await db
      .update(assessmentResults)
      .set({ ...assessment, updatedAt: new Date() })
      .where(eq(assessmentResults.id, id))
      .returning();
    return updatedAssessment;
  }

  // Probate Case methods
  async getProbateCase(id: number): Promise<ProbateCase | undefined> {
    const [result] = await db.select().from(probateCases).where(eq(probateCases.id, id));
    return result;
  }

  async getProbateCasesByUserId(userId: number): Promise<ProbateCase[]> {
    return await db.select().from(probateCases).where(eq(probateCases.userId, userId));
  }

  async createProbateCase(caseData: InsertProbateCase): Promise<ProbateCase> {
    const [result] = await db.insert(probateCases).values(caseData).returning();
    return result;
  }

  async updateProbateCase(id: number, caseData: Partial<InsertProbateCase>): Promise<ProbateCase | undefined> {
    const [updatedCase] = await db
      .update(probateCases)
      .set({ ...caseData, updatedAt: new Date() })
      .where(eq(probateCases.id, id))
      .returning();
    return updatedCase;
  }

  // Executor methods
  async getExecutor(id: number): Promise<Executor | undefined> {
    const [result] = await db.select().from(executors).where(eq(executors.id, id));
    return result;
  }

  async getExecutorsByCaseId(caseId: number): Promise<Executor[]> {
    return await db.select().from(executors).where(eq(executors.caseId, caseId));
  }

  async createExecutor(executorData: InsertExecutor): Promise<Executor> {
    const [result] = await db.insert(executors).values(executorData).returning();
    return result;
  }

  async updateExecutor(id: number, executorData: Partial<InsertExecutor>): Promise<Executor | undefined> {
    const [updatedExecutor] = await db
      .update(executors)
      .set({ ...executorData, updatedAt: new Date() })
      .where(eq(executors.id, id))
      .returning();
    return updatedExecutor;
  }

  // Estate Asset methods
  async getEstateAsset(id: number): Promise<EstateAsset | undefined> {
    const [result] = await db.select().from(estateAssets).where(eq(estateAssets.id, id));
    return result;
  }

  async getEstateAssetsByCaseId(caseId: number): Promise<EstateAsset[]> {
    return await db.select().from(estateAssets).where(eq(estateAssets.caseId, caseId));
  }

  async createEstateAsset(assetData: InsertEstateAsset): Promise<EstateAsset> {
    const [result] = await db.insert(estateAssets).values(assetData).returning();
    return result;
  }

  async updateEstateAsset(id: number, assetData: Partial<InsertEstateAsset>): Promise<EstateAsset | undefined> {
    const [updatedAsset] = await db
      .update(estateAssets)
      .set({ ...assetData, updatedAt: new Date() })
      .where(eq(estateAssets.id, id))
      .returning();
    return updatedAsset;
  }

  // Estate Liability methods
  async getEstateLiability(id: number): Promise<EstateLiability | undefined> {
    const [result] = await db.select().from(estateLiabilities).where(eq(estateLiabilities.id, id));
    return result;
  }

  async getEstateLiabilitiesByCaseId(caseId: number): Promise<EstateLiability[]> {
    return await db.select().from(estateLiabilities).where(eq(estateLiabilities.caseId, caseId));
  }

  async createEstateLiability(liabilityData: InsertEstateLiability): Promise<EstateLiability> {
    const [result] = await db.insert(estateLiabilities).values(liabilityData).returning();
    return result;
  }

  async updateEstateLiability(id: number, liabilityData: Partial<InsertEstateLiability>): Promise<EstateLiability | undefined> {
    const [updatedLiability] = await db
      .update(estateLiabilities)
      .set({ ...liabilityData, updatedAt: new Date() })
      .where(eq(estateLiabilities.id, id))
      .returning();
    return updatedLiability;
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    const [result] = await db.select().from(documents).where(eq(documents.id, id));
    return result;
  }

  async getDocumentsByCaseId(caseId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.caseId, caseId));
  }

  async getDocumentsByType(caseId: number, type: string): Promise<Document[]> {
    return await db.select().from(documents)
      .where(and(
        eq(documents.caseId, caseId),
        eq(documents.type, type)
      ));
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [result] = await db.insert(documents).values(documentData).returning();
    return result;
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...documentData, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const [result] = await db.select().from(tasks).where(eq(tasks.id, id));
    return result;
  }

  async getTasksByCaseId(caseId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.caseId, caseId));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [result] = await db.insert(tasks).values(taskData).returning();
    return result;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
}

// Choose which storage implementation to use
export const storage = new DatabaseStorage();
