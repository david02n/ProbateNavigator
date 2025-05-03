import { 
  users, 
  assessmentResults,
  type User, 
  type InsertUser, 
  type AssessmentResult, 
  type InsertAssessmentResult 
} from "@shared/schema";
import * as session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
    this.userIdCounter = 1;
    this.assessmentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
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
      userId: assessment.userId || null,
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

export const storage = new MemStorage();
