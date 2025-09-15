export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'TEAM_MEMBER';
  department?: string;
  position?: string;
  manager?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  timezone: string;
  employeeId?: string;
  hireDate: string;
  salary?: {
    base: number;
    currency: string;
  };
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER' | 'LEGEND';
  points: number;
  achievements: string[];
  rewards: Reward[];
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      taskUpdates: boolean;
      projectUpdates: boolean;
      chatMessages: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  type: 'STAR' | 'BUTTERFLY' | 'TROPHY' | 'CROWN' | 'MEDAL' | 'SHIELD' | 'HEART' | 'ZAP' | 'FLOWER';
  count: number;
  earnedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignee: User;
  createdBy: User;
  project?: Project;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  category: 'DEVELOPMENT' | 'DESIGN' | 'TESTING' | 'DOCUMENTATION' | 'RESEARCH' | 'MEETING' | 'OTHER';
  dueDate?: string;
  startDate: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours: number;
  progress: number;
  milestones: Milestone[];
  reviewRequired: boolean;
  reviewedBy?: User;
  reviewedAt?: string;
  reviewComments?: string;
  qualityScore?: number;
  dependencies: string[];
  subtasks: string[];
  parentTask?: string;
  attachments: Attachment[];
  comments: Comment[];
  points: number;
  tags: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
}

export interface Attachment {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
  isEdited: boolean;
  editedAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  code: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'DEVELOPMENT' | 'DESIGN' | 'RESEARCH' | 'MARKETING' | 'SALES' | 'SUPPORT' | 'OTHER';
  startDate: string;
  endDate?: string;
  deadline?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  projectManager: User;
  createdBy: User;
  team: TeamMember[];
  client?: Client;
  budget?: Budget;
  progress: number;
  milestones: ProjectMilestone[];
  roadmap: RoadmapPhase[];
  tasks: string[];
  deliverables: Deliverable[];
  risks: Risk[];
  documents: Document[];
  metrics: ProjectMetrics;
  settings: ProjectSettings;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  user: User;
  role: 'LEAD' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'ANALYST' | 'CONTRIBUTOR';
  joinedAt: string;
  isActive: boolean;
}

export interface Client {
  name: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface Budget {
  allocated: number;
  spent: number;
  currency: string;
}

export interface ProjectMilestone {
  _id?: string;
  title: string;
  description?: string;
  dueDate: string;
  completedAt?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  deliverables: string[];
  dependencies: string[];
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  tasks: string[];
  deliverables: string[];
}

export interface Deliverable {
  name: string;
  description?: string;
  type: 'DOCUMENT' | 'CODE' | 'DESIGN' | 'REPORT' | 'PRESENTATION' | 'OTHER';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  dueDate?: string;
  completedAt?: string;
  assignedTo?: User;
  files: Attachment[];
}

export interface Risk {
  title: string;
  description?: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'IDENTIFIED' | 'MITIGATED' | 'RESOLVED' | 'ACCEPTED';
  mitigation?: string;
  owner?: User;
  identifiedAt: string;
}

export interface Document {
  name: string;
  type: 'REQUIREMENT' | 'DESIGN' | 'TEST_PLAN' | 'USER_MANUAL' | 'OTHER';
  url: string;
  uploadedBy: User;
  uploadedAt: string;
  version: string;
}

export interface ProjectMetrics {
  tasksCompleted: number;
  tasksTotal: number;
  onTimeDelivery: number;
  budgetUtilization: number;
  teamSatisfaction: number;
  clientSatisfaction: number;
}

export interface ProjectSettings {
  allowSelfAssignment: boolean;
  requireApproval: boolean;
  autoArchive: boolean;
  notificationSettings: {
    milestoneUpdates: boolean;
    taskUpdates: boolean;
    deadlineReminders: boolean;
  };
}

export interface Message {
  _id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'TASK_UPDATE' | 'PROJECT_UPDATE';
  sender: User;
  recipients: MessageRecipient[];
  chatType: 'DIRECT' | 'GROUP' | 'PROJECT' | 'TASK' | 'TEAM';
  chatId: string;
  project?: string;
  task?: string;
  team?: string;
  attachments: Attachment[];
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  isEdited: boolean;
  editedAt?: string;
  reactions: Reaction[];
  replyTo?: string;
  thread?: string;
  isThread: boolean;
  threadCount: number;
  mentions: Mention[];
  hashtags: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecipient {
  user: User;
  readAt?: string;
  deliveredAt?: string;
}

export interface Reaction {
  user: User;
  emoji: string;
  createdAt: string;
}

export interface Mention {
  user: User;
  position: {
    start: number;
    end: number;
  };
}

export interface Payroll {
  _id: string;
  employee: User;
  payPeriod: {
    startDate: string;
    endDate: string;
    month: number;
    year: number;
  };
  salary: {
    base: number;
    overtime: number;
    bonus: number;
    commission: number;
    allowances: Allowance[];
  };
  deductions: Deduction[];
  tax: TaxInfo;
  attendance: AttendanceInfo;
  performance: PerformanceInfo;
  calculations: PayrollCalculations;
  payment: PaymentInfo;
  approval: ApprovalInfo;
  payslip: PayslipInfo;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Allowance {
  type: 'HOUSING' | 'TRANSPORT' | 'MEAL' | 'MEDICAL' | 'OTHER';
  amount: number;
  description?: string;
}

export interface Deduction {
  type: 'TAX' | 'INSURANCE' | 'RETIREMENT' | 'LOAN' | 'ADVANCE' | 'OTHER';
  amount: number;
  description?: string;
  isPercentage: boolean;
  percentage?: number;
}

export interface TaxInfo {
  grossIncome: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
}

export interface AttendanceInfo {
  totalDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours: number;
  regularHours: number;
}

export interface PerformanceInfo {
  points: number;
  rating?: number;
  bonusMultiplier: number;
  efficiency?: number;
}

export interface PayrollCalculations {
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
}

export interface PaymentInfo {
  method: 'BANK_TRANSFER' | 'CHECK' | 'CASH' | 'CRYPTO';
  bankDetails?: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  paymentDate?: string;
  transactionId?: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED' | 'CANCELLED';
}

export interface ApprovalInfo {
  approvedBy?: User;
  approvedAt?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  comments?: string;
  rejectionReason?: string;
}

export interface PayslipInfo {
  generatedAt: string;
  generatedBy: User;
  downloadUrl?: string;
  isDownloaded: boolean;
  downloadedAt?: string;
}

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: 'TASK_COMPLETION' | 'PROJECT_COMPLETION' | 'TIME_TRACKING' | 'ATTENDANCE' | 'PERFORMANCE' | 'COLLABORATION' | 'LEADERSHIP' | 'SPECIAL';
  category: 'PRODUCTIVITY' | 'TEAMWORK' | 'INNOVATION' | 'LEADERSHIP' | 'CONSISTENCY' | 'MILESTONE' | 'SPECIAL';
  requirements: {
    criteria: 'TASK_COUNT' | 'PROJECT_COUNT' | 'HOURS_WORKED' | 'DAYS_PRESENT' | 'POINTS_EARNED' | 'STREAK_DAYS' | 'CUSTOM';
    value: number;
    timeframe: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ALL_TIME';
    conditions: any[];
  };
  rewards: {
    points: number;
    items: Reward[];
    badge?: {
      name: string;
      color: string;
      description: string;
    };
  };
  visibility: 'PUBLIC' | 'PRIVATE' | 'TEAM_ONLY' | 'ROLE_BASED';
  roles: string[];
  isActive: boolean;
  isRepeatable: boolean;
  maxEarnings: number;
  statistics: {
    totalEarned: number;
    uniqueEarners: number;
    lastEarned?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role?: string;
  department?: string;
  position?: string;
}

export interface TaskForm {
  title: string;
  description: string;
  assignee: string;
  project?: string;
  priority: string;
  category: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  reviewRequired: boolean;
}

export interface ProjectForm {
  name: string;
  description: string;
  code: string;
  priority: string;
  category: string;
  deadline?: string;
  estimatedDuration?: number;
  projectManager?: string;
  team?: string[];
  client?: Client;
  budget?: Budget;
}
