import { calculateMatch, MATCH_THRESHOLD } from '@/features/matches/calculate-match';
import type { FoundPost, LostReport, Match, User } from '@/types/domain';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60_000).toISOString();
const daysAgo = (days: number) => hoursAgo(days * 24);

export const currentUser: User = {
  id: 'user-owner',
  name: 'Nguyễn Minh Anh',
  email: 'student@hcmut.edu.vn',
  studentId: '2210001',
  faculty: 'Khoa Khoa học & Kỹ thuật Máy tính',
  initials: 'MA',
};

export const seedUsers: User[] = [
  currentUser,
  {
    id: 'user-tuan',
    name: 'Lê Minh Tuấn',
    email: 'tuan.le@hcmut.edu.vn',
    studentId: '2213472',
    faculty: 'Khoa Điện - Điện tử',
    initials: 'MT',
  },
  {
    id: 'user-linh',
    name: 'Phạm Ngọc Linh',
    email: 'linh.pham@hcmut.edu.vn',
    studentId: '2310188',
    faculty: 'Khoa Kỹ thuật Hóa học',
    initials: 'NL',
  },
  {
    id: 'user-son',
    name: 'Nguyễn Hồng Sơn',
    email: 'son.nguyen@hcmut.edu.vn',
    studentId: '2212758',
    faculty: 'Khoa Cơ khí',
    initials: 'NS',
  },
];

export const seedLostReports: LostReport[] = [
  {
    id: 'lost-casio-blue',
    ownerId: currentUser.id,
    itemName: 'Máy tính Casio fx-580VN X',
    category: 'Máy tính',
    color: 'Xanh dương',
    privateDescription:
      'Mặt sau có nhãn tên Minh Anh và một vết xước nhỏ cạnh ngăn pin. Bao máy màu xám.',
    possibleLocations: ['Tòa H6', 'Cơ sở 2 (Dĩ An)'],
    lostAt: hoursAgo(5),
    status: 'SEARCHING',
    createdAt: hoursAgo(4.5),
  },
  {
    id: 'lost-student-card',
    ownerId: 'user-linh',
    itemName: 'Thẻ sinh viên HCMUT',
    category: 'Giấy tờ / Thẻ',
    color: 'Xanh dương',
    privateDescription: 'Thẻ mang tên Phạm Ngọc Linh, có dây đeo xanh đậm.',
    possibleLocations: ['Thư viện A2', 'Khu tự học tầng 2'],
    lostAt: hoursAgo(8),
    status: 'SEARCHING',
    createdAt: hoursAgo(7),
  },
  {
    id: 'lost-wallet-recovered',
    ownerId: currentUser.id,
    itemName: 'Ví da nam',
    category: 'Ví & Ba lô',
    color: 'Đen',
    privateDescription: 'Bên trong có thẻ thư viện và ảnh gia đình.',
    possibleLocations: ['Tòa H1', 'Cơ sở 2 (Dĩ An)'],
    lostAt: daysAgo(5),
    status: 'RECOVERED',
    createdAt: daysAgo(5),
  },
];

export const seedFoundPosts: FoundPost[] = [
  {
    id: 'found-casio-blue',
    finderId: 'user-tuan',
    title: 'Máy tính Casio fx-580VN X màu xanh',
    category: 'Máy tính',
    color: 'Xanh dương',
    description: 'Nhặt được sau giờ học, máy đang được giữ nguyên hiện trạng để chờ xác minh.',
    campus: 'Cơ sở 2 (Dĩ An)',
    building: 'Tòa H6',
    specificLocation: 'Phòng 106, dãy bàn gần cửa sổ',
    foundAt: hoursAgo(3),
    imageKey: 'calculator',
    custody: 'Đang được Lê Minh Tuấn giữ tại lớp',
    status: 'OPEN',
    createdAt: hoursAgo(2.5),
  },
  {
    id: 'found-student-card',
    finderId: currentUser.id,
    title: 'Thẻ sinh viên HCMUT có dây đeo xanh',
    category: 'Giấy tờ / Thẻ',
    color: 'Xanh dương',
    description: 'Thẻ được nhặt ở khu tự học. Một phần thông tin đã được che để bảo vệ chủ thẻ.',
    campus: 'Cơ sở 1 (Lý Thường Kiệt)',
    building: 'Thư viện A2',
    specificLocation: 'Khu tự học tầng 2',
    foundAt: hoursAgo(6),
    imageKey: 'student-card',
    custody: 'Đã gửi tại quầy thư viện A2',
    status: 'OPEN',
    createdAt: hoursAgo(5.5),
  },
  {
    id: 'found-airpods',
    finderId: 'user-linh',
    title: 'Hộp sạc Apple AirPods Pro',
    category: 'Điện tử',
    color: 'Trắng',
    description: 'Hộp sạc màu trắng được nhặt tại căn tin, không có tai nghe bên trong.',
    campus: 'Cơ sở 1 (Lý Thường Kiệt)',
    building: 'Căn tin C6',
    specificLocation: 'Bàn sát cửa sổ',
    foundAt: hoursAgo(12),
    imageKey: 'airpods',
    custody: 'Đang gửi tại quầy thu ngân căn tin',
    status: 'OPEN',
    createdAt: hoursAgo(11.5),
  },
  {
    id: 'found-backpack',
    finderId: 'user-son',
    title: 'Ba lô Jansport màu đen',
    category: 'Ví & Ba lô',
    color: 'Đen',
    description: 'Ba lô được nhặt trong phòng tự học, đã niêm phong để chờ người mất xác minh.',
    campus: 'Cơ sở 2 (Dĩ An)',
    building: 'Tòa H1',
    specificLocation: 'Phòng tự học, dãy bàn 4',
    foundAt: daysAgo(1),
    imageKey: 'backpack',
    custody: 'Phòng bảo vệ cổng chính Cơ sở 2',
    status: 'OPEN',
    createdAt: hoursAgo(23),
  },
  {
    id: 'found-wallet-returned',
    finderId: 'user-son',
    title: 'Ví da nam màu đen',
    category: 'Ví & Ba lô',
    color: 'Đen',
    description: 'Ví đã được xác minh và bàn giao lại cho chủ sở hữu.',
    campus: 'Cơ sở 2 (Dĩ An)',
    building: 'Tòa H1',
    specificLocation: 'Sảnh tầng trệt',
    foundAt: daysAgo(5),
    imageKey: 'wallet',
    custody: 'Đã trả lại chủ sở hữu',
    status: 'RETURNED',
    createdAt: daysAgo(5),
  },
];

const generatedMatches: Match[] = seedLostReports
  .filter((report) => report.status === 'SEARCHING')
  .flatMap((report) =>
    seedFoundPosts
      .filter((post) => post.status === 'OPEN')
      .map((post) => ({ report, post, calculation: calculateMatch(report, post) }))
      .filter(({ calculation }) => calculation.score >= MATCH_THRESHOLD)
      .map(({ report, post, calculation }, index) => ({
        id: `match-${report.id}-${post.id}-${index}`,
        lostReportId: report.id,
        foundPostId: post.id,
        score: calculation.score,
        reasons: calculation.reasons,
        status: 'POSSIBLE' as const,
        isRead: false,
        createdAt: post.createdAt,
      })),
  );

export const seedMatches: Match[] = [
  ...generatedMatches,
  {
    id: 'match-wallet-completed',
    lostReportId: 'lost-wallet-recovered',
    foundPostId: 'found-wallet-returned',
    score: 9,
    reasons: ['Cùng danh mục', 'Cùng màu đen', 'Cùng khu vực Tòa H1', 'Thời gian phù hợp'],
    status: 'COMPLETED',
    isRead: true,
    createdAt: daysAgo(4),
  },
];
