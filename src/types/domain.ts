export type LostReportStatus = 'SEARCHING' | 'RECOVERED';
export type FoundPostStatus = 'OPEN' | 'RETURNED';
export type MatchStatus = 'POSSIBLE' | 'DISMISSED' | 'COMPLETED';

export type DemoImageKey =
  | 'wallet'
  | 'student-card'
  | 'calculator'
  | 'airpods'
  | 'backpack';

export type User = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  faculty: string;
  initials: string;
};

export type LostReport = {
  id: string;
  ownerId: string;
  itemName: string;
  category: string;
  color: string;
  privateDescription: string;
  possibleLocations: string[];
  lostAt: string;
  status: LostReportStatus;
  createdAt: string;
};

export type FoundPost = {
  id: string;
  finderId: string;
  title: string;
  category: string;
  color: string;
  description: string;
  campus: string;
  building: string;
  specificLocation: string;
  foundAt: string;
  imageUri?: string;
  imageKey?: DemoImageKey;
  custody: string;
  status: FoundPostStatus;
  createdAt: string;
};

export type Match = {
  id: string;
  lostReportId: string;
  foundPostId: string;
  score: number;
  reasons: string[];
  status: MatchStatus;
  isRead: boolean;
  createdAt: string;
};

export type NewLostReportInput = Omit<
  LostReport,
  'id' | 'ownerId' | 'status' | 'createdAt'
>;

export type NewFoundPostInput = Omit<
  FoundPost,
  'id' | 'finderId' | 'status' | 'createdAt' | 'imageKey'
>;

export type CreateResult = {
  id: string;
  matchCount: number;
};
