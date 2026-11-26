export interface ArtifactCameraView {
  yawDeg: number;
  pitchDeg: number;
  zoom: number;
  panRight?: number;
  panUp?: number;
}

export interface ArtifactAnnotation {
  id: string;
  label: string;
  detail: string;
  cameraView?: ArtifactCameraView;
}

export interface HistoricalArtifact3D {
  id: string;
  uid: string;
  title: string;
  subtitle: string;
  gradeLabel: 'Khối 10' | 'Khối 11–12' | 'Khối 12';
  periodLabel: string;
  description: string;
  historicalFact: string;
  author: string;
  sketchfabUrl: string;
  embedUrl: string;
  previewImage: string;
  annotations: ArtifactAnnotation[];
}

export const ARTIFACTS_3D: HistoricalArtifact3D[] = [
  {
    id: 'sung-than-cong-co',
    uid: 'd93798b2ee5d443fbc37ea9d46c38b23',
    title: 'Súng Thần Công Cổ Thế Kỷ XVIII',
    subtitle: 'Hỏa khí tiền nạp nòng đồng đặt trên giá xe gỗ nẹp sắt',
    gradeLabel: 'Khối 10',
    periodLabel: 'Lịch sử Trung – Cận đại',
    description:
      'Mẫu đại bác tiền nạp tiêu biểu giai đoạn thế kỷ XVII–XVIII với nòng đúc liền khối, quai treo cân bằng và bệ gỗ bốn bánh cơ động trên chiến lũy hoặc chiến thuyền.',
    historicalFact:
      'Tại Đại Việt, từ thời Hồ – Lê sơ đến triều Tây Sơn và triều Nguyễn, kỹ thuật đúc súng thần công đồng phát triển rực rỡ phục vụ phòng thủ thành lũy và thủy chiến.',
    author: 'Kingy',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/naval-cannon-18th-century-english-style-d93798b2ee5d443fbc37ea9d46c38b23',
    embedUrl:
      'https://sketchfab.com/models/d93798b2ee5d443fbc37ea9d46c38b23/embed',
    previewImage:
      'https://media.sketchfab.com/models/d93798b2ee5d443fbc37ea9d46c38b23/thumbnails/cd8190106a2e4aeb812a5cd6f7193507/a12bc71db57949e19748260b326ccb8a.jpeg',
    annotations: [
      {
        id: 'muzzle-bore',
        label: '1. Nòng đồng đúc miệng loe & ngõng pháo',
        detail:
          'Phần miệng nòng loe giúp nạp thuốc phóng và đạn cầu từ phía trước; hai trục ngõng ngang thân pháo cho phép thay đổi góc ngẩng bắn tầm xa.',
        cameraView: { yawDeg: -24, pitchDeg: 14, zoom: 0.62, panRight: -0.14, panUp: 0.04 },
      },
      {
        id: 'lifting-dolphins',
        label: '2. Hai quai cẩu cân bằng trọng tâm',
        detail:
          'Cặp quai đúc nổi trên lưng nòng pháo giúp buộc dây tời cẩu khẩu pháo nặng hàng tấn lắp đặt lên giá xe gỗ hoặc hầm pháo.',
        cameraView: { yawDeg: 34, pitchDeg: 38, zoom: 0.56, panRight: 0.02, panUp: 0.09 },
      },
      {
        id: 'wooden-carriage',
        label: '3. Giá xe gỗ nẹp sắt & bốn bánh chịu lực',
        detail:
          'Khung gỗ bậc thang nẹp đai sắt chịu giật lùi khi khai hỏa, kết hợp dây chằng giảm chấn giúp kíp pháo thủ kéo pháo trở lại vị trí bắn.',
        cameraView: { yawDeg: 78, pitchDeg: 16, zoom: 0.72, panRight: 0.08, panUp: -0.07 },
      },
    ],
  },
  {
    id: 'xe-dap-tho-dien-bien',
    uid: '29b644ad4b6d4d4a92bb5f61766f669c',
    title: 'Xe Đạp Thồ Kháng Chiến Điện Biên',
    subtitle: 'Kỳ tích vận tải hậu cần vượt đèo Pha Đin nuôi sống chiến dịch',
    gradeLabel: 'Khối 12',
    periodLabel: 'Kháng chiến chống Pháp (1953–1954)',
    description:
      'Xe đạp khung thép nguyên bản được dân công hỏa tuyến cải tiến bằng cọc tre, nẹp gỗ và má phanh phụ để chở hàng trăm kilôgam gạo, đạn qua dốc núi Tây Bắc.',
    historicalFact:
      'Hơn 20.990 xe đạp thồ đã tham gia Chiến dịch Điện Biên Phủ, đạt kỷ lục 352 kg mỗi chuyến (dân công Ma Văn Thắng), tăng năng suất gấp 10–15 lần gánh bộ.',
    author: 'CharlesNG',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/old-bicycle-29b644ad4b6d4d4a92bb5f61766f669c',
    embedUrl:
      'https://sketchfab.com/models/29b644ad4b6d4d4a92bb5f61766f669c/embed',
    previewImage:
      'https://media.sketchfab.com/models/29b644ad4b6d4d4a92bb5f61766f669c/thumbnails/97f183fdcefb4adba6b12a44767396c0/86a6023a41e4437d83ebb8c3a9f891fc.jpeg',
    annotations: [
      {
        id: 'bamboo-handlebar',
        label: '1. Tay lái nối cọc tre điều hướng',
        detail:
          'Dân công buộc thêm đoạn tre dài vào ghi-đông làm đòn bẩy giữ thăng bằng và điều hướng từ bên cạnh khi bao gạo chất cao quá đầu người.',
        cameraView: { yawDeg: 38, pitchDeg: 24, zoom: 0.52, panRight: 0.16, panUp: 0.16 },
      },
      {
        id: 'reinforced-frame',
        label: '2. Khung sườn thép gia cố chịu tải nặng',
        detail:
          'Khung tam giác thép được nẹp gỗ cứng và quấn săm cao su ở vành bánh, cho phép chịu tải từ 200 đến hơn 300 kg liên tục trên đường đá lầy.',
        cameraView: { yawDeg: -10, pitchDeg: 14, zoom: 0.68, panRight: 0.0, panUp: 0.02 },
      },
      {
        id: 'brake-carrier',
        label: '3. Thanh đẩy hậu & má phanh gỗ đổ dốc',
        detail:
          'Cọc tre chống dưới yên kết hợp miếng gỗ nghiến kẹp bổ sung vào lốp bánh sau giúp hãm tốc an toàn khi xuống các cung đèo dốc 15% ở Pha Đin.',
        cameraView: { yawDeg: -62, pitchDeg: 18, zoom: 0.58, panRight: -0.18, panUp: -0.03 },
      },
    ],
  },
  {
    id: 'phao-cao-xa-37mm',
    uid: '120eeca98b394b6ea07dd5668984f338',
    title: 'Pháo Cao Xạ 37mm (Hệ 61-K / 70-K)',
    subtitle: 'Lưới lửa phòng không khống chế không phận lòng chảo Mường Thanh',
    gradeLabel: 'Khối 12',
    periodLabel: 'Chiến dịch Điện Biên Phủ (1954)',
    description:
      'Pháo phòng không tự động cỡ nòng 37mm do Liên Xô chế tạo (dòng 61-K lục quân và biến thể 70-K đồng chuẩn đạn kẹp), bắn liên thanh khống chế máy bay tiếp vận địch.',
    historicalFact:
      'Trung đoàn Pháo cao xạ 367 đã kéo pháo vượt núi vào trận địa Điện Biên Phủ, bắn rơi 52 máy bay Pháp, buộc máy bay tiếp tế C-47 phải thả dù từ độ cao lớn.',
    author: 'ThomasBeerens',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/37-mm67-15-70-k-single-120eeca98b394b6ea07dd5668984f338',
    embedUrl:
      'https://sketchfab.com/models/120eeca98b394b6ea07dd5668984f338/embed',
    previewImage:
      'https://media.sketchfab.com/models/120eeca98b394b6ea07dd5668984f338/thumbnails/628ec1ad447c4077ab347bf6fbe0486d/eee0cd2d04924c9388e35693bb2299b8.jpeg',
    annotations: [
      {
        id: 'flash-hider-barrel',
        label: '1. Nòng dài 37mm & loa giảm chớp đầu nòng',
        detail:
          'Tỷ lệ chiều dài nòng lớn tạo sơ tốc đầu đạn ~880 m/s, đạt trần bắn hiệu quả trên 3.000m; loa loe đầu nòng giúp giảm chớp sáng ban đêm.',
        cameraView: { yawDeg: 30, pitchDeg: 15, zoom: 0.66, panRight: 0.22, panUp: 0.0 },
      },
      {
        id: 'five-round-clip',
        label: '2. Hộp tiếp đạn kẹp 5 viên nạp trên',
        detail:
          'Kíp nạp đạn thả kẹp 5 viên đạn 37x252mm liên tiếp từ phía trên khóa nòng, duy trì tốc độ bắn thực tế tới 80–120 phát/phút.',
        cameraView: { yawDeg: -38, pitchDeg: 34, zoom: 0.50, panRight: -0.12, panUp: 0.12 },
      },
      {
        id: 'sight-handwheels',
        label: '3. Tay quay tầm – hướng & kính ngắm phòng không',
        detail:
          'Hai pháo thủ vận hành vô-lăng nâng hạ góc tà (tới +85°) và xoay vòng 360° theo đường ngắm đón đầu mục tiêu bay.',
        cameraView: { yawDeg: -85, pitchDeg: 20, zoom: 0.56, panRight: -0.14, panUp: -0.05 },
      },
    ],
  },
  {
    id: 'may-bay-b52',
    uid: '38b0c64bd552431394efa8625d7f5144',
    title: 'Máy Bay Ném Bom Chiến Lược B-52',
    subtitle: 'Pháo đài bay trong trận quyết chiến "Điện Biên Phủ trên không" 1972',
    gradeLabel: 'Khối 11–12',
    periodLabel: 'Hà Nội 12 ngày đêm (12/1972)',
    description:
      'Máy bay ném bom phản lực hạng nặng tầm xa 8 động cơ của Không quân Hoa Kỳ, bay ở tầng bình lưu 10–12 km mang theo tải trọng bom rải thảm lớn và hệ thống gây nhiễu điện tử.',
    historicalFact:
      'Trong chiến dịch 12 ngày đêm cuối tháng 12/1972, quân và dân miền Bắc đã bắn rơi 34 chiếc B-52 (trong tổng số 81 máy bay các loại), buộc Mỹ ký Hiệp định Paris 1973.',
    author: 'bohmerang',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/boeing-b-52-stratofortress-38b0c64bd552431394efa8625d7f5144',
    embedUrl:
      'https://sketchfab.com/models/38b0c64bd552431394efa8625d7f5144/embed',
    previewImage:
      'https://media.sketchfab.com/models/38b0c64bd552431394efa8625d7f5144/thumbnails/4d6ad965421443519456cd6d2b47a1bd/4631298b950e471681bd06bcc3a38709.jpeg',
    annotations: [
      {
        id: 'eight-engines',
        label: '1. Cụm 8 động cơ phản lực dưới cánh',
        detail:
          'Bốn cụm vỏ động cơ kép treo dưới hai cánh tạo lực đẩy lớn cho phép bay hành trình liên lục địa ở độ cao trên 10.000m và tỏa tín hiệu nhiệt mạnh.',
        cameraView: { yawDeg: 26, pitchDeg: -8, zoom: 0.58, panRight: 0.14, panUp: -0.02 },
      },
      {
        id: 'swept-wing',
        label: '2. Sải cánh cụp 56,4m chứa khoang nhiên liệu',
        detail:
          'Cánh xuôi sau góc 35° diện tích lớn giúp giữ ổn định khí động ở tầng bình lưu, hai đầu cánh có bánh phụ giữ thăng bằng khi cất hạ cánh.',
        cameraView: { yawDeg: 0, pitchDeg: 62, zoom: 0.88, panRight: 0.0, panUp: 0.0 },
      },
      {
        id: 'bomb-bay-ecm',
        label: '3. Khoang bom thân dài & hệ thống gây nhiễu',
        detail:
          'Thân dài gần 48,5m tích hợp khoang bom trung tâm sức chứa tới 27–31 tấn bom và các tổ hợp phát nhiễu radar – mục tiêu đánh chặn của tên lửa SAM-2.',
        cameraView: { yawDeg: 118, pitchDeg: 16, zoom: 0.72, panRight: 0.05, panUp: 0.02 },
      },
    ],
  },
  {
    id: 'xe-tang-t54a',
    uid: '0359275bbdea4bb784b7c5ce16ec6103',
    title: 'Xe Tăng Chủ Lực T-54A (Số Hiệu 13)',
    subtitle: 'Lực lượng đột kích thọc sâu trong Chiến dịch Hồ Chí Minh lịch sử',
    gradeLabel: 'Khối 12',
    periodLabel: 'Đại thắng Mùa Xuân (30/04/1975)',
    description:
      'Xe tăng hạng trung chủ lực nổi tiếng với lớp giáp nghiêng bền chắc, tháp pháo đúc hình bán cầu và pháo chính 100mm có bộ ổn định nòng theo mặt phẳng đứng.',
    historicalFact:
      'Các đại đội xe tăng T-54/Type-59 thuộc Quân đoàn 2 (trong đó có xe tăng 843 và 390) đã dẫn đầu mũi thọc sâu tiến vào húc đổ cổng Dinh Độc Lập trưa 30/04/1975.',
    author: 'parama',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/russian-t-54a-model-1951-0359275bbdea4bb784b7c5ce16ec6103',
    embedUrl:
      'https://sketchfab.com/models/0359275bbdea4bb784b7c5ce16ec6103/embed',
    previewImage:
      'https://media.sketchfab.com/models/0359275bbdea4bb784b7c5ce16ec6103/thumbnails/86ae7224f779447c8d4727e0b6c6eee9/fd6b0a43eab54e1b93c30ee615adf3a3.jpeg',
    annotations: [
      {
        id: 'main-gun-100mm',
        label: '1. Pháo chính 100mm D-10T ổn định nòng',
        detail:
          'Trang bị bầu hút khói đặc trưng gần đầu nòng (biến thể T-54A) và cơ cấu ổn định dọc STP-1 giúp ngắm bắn chính xác khi đang hành tiến.',
        cameraView: { yawDeg: 42, pitchDeg: 18, zoom: 0.68, panRight: 0.22, panUp: 0.08 },
      },
      {
        id: 'cast-turret',
        label: '2. Tháp pháo đúc bán cầu & sao vàng QĐNDVN',
        detail:
          'Thiết kế tháp pháo vòm tròn liền khối dày tới 200mm mặt trước, làm trượt góc đạn chống tăng địch và gắn súng máy phòng không 12,7mm trên nóc.',
        cameraView: { yawDeg: -8, pitchDeg: 26, zoom: 0.56, panRight: 0.0, panUp: 0.08 },
      },
      {
        id: 'tracks-fuel',
        label: '3. Bộ xích thép 5 cặp bánh chịu nặng',
        detail:
          'Dải xích rộng 580mm phân tán áp suất lên đất bùn lầy kết hợp thùng dầu phụ phía đuôi xe giúp tăng tầm hành quân cơ động đường dài.',
        cameraView: { yawDeg: -38, pitchDeg: 10, zoom: 0.66, panRight: -0.08, panUp: -0.06 },
      },
    ],
  },
];
