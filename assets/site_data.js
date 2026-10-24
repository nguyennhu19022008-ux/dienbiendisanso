// Dữ liệu 8 Tour 3D và 10 Cứ điểm Sa bàn
const TOURS_DATA = [
  {
    id: 1,
    category: "Chỉ huy",
    catKey: "command",
    sequence: "CHẶNG 01",
    badge: "CHẶNG 01 · CHỈ HUY",
    title: "Sở chỉ huy Chiến dịch Mường Phăng",
    coords: "21°27'42\" N · 103°09'14\" E",
    latLng: "21.461° N · 103.154° E",
    image: "images/muong-phang.webp",
    externalUrl: "https://demo.egal.vn/dienbien/data/1/",
    desc: "Nằm ẩn mình dưới tán rừng nguyên sinh Phăng Lăng, đây là nơi Đại tướng Võ Nguyên Giáp đưa ra 'quyết định khó khăn nhất trong cuộc đời chỉ huy': chuyển từ phương châm 'Đánh nhanh, thắng nhanh' sang 'Đánh chắc, tiến chắc', tạo nền móng quyết định cho thắng lợi hoàn toàn.",
    mission: "Quan sát cách bố trí hầm tác chiến, lán làm việc và hệ thống giao thông hào xuyên núi dài 320m dưới tán rừng rậm. Phân tích vì sao máy bay trinh sát Pháp hoàn toàn không phát hiện được.",
    viewpoints: [
      "Lán làm việc của Đại tướng Võ Nguyên Giáp",
      "Đường hầm xuyên núi dài 320m",
      "Lán tác chiến của Tham mưu trưởng Hoàng Văn Thái",
      "Trạm cơ yếu và thông tin liên lạc dã chiến"
    ],
    steamLink: "Địa lý quân sự (độ che phủ tán rừng chống trinh sát hồng ngoại thời kỳ đầu), thông tin vô tuyến & dây bọc cao su dã chiến, kết cấu hầm vòm chống sập bằng gỗ dổi chịu lực."
  },
  {
    id: 2,
    category: "Chiến trường",
    catKey: "battle",
    sequence: "CHẶNG 02",
    badge: "CHẶNG 02 · CHIẾN TRƯỜNG",
    title: "Cứ điểm Đồi A1 (Eliane 2)",
    coords: "21°23'14\" N · 103°01'06\" E",
    latLng: "21.387° N · 103.018° E",
    image: "images/a1.webp",
    externalUrl: "https://demo.egal.vn/dienbien/data/2/",
    desc: "Cứ điểm kiên cố nhất của phân khu trung tâm, nơi diễn ra 39 ngày đêm chiến đấu giằng co ác liệt từng mét chiến hào. Đỉnh đồi còn lưu lại hố bộc phá 960kg TNT sâu 13m và xác xe tăng Bazeilles của quân viễn chinh Pháp.",
    mission: "Quan sát độ sâu và đường kính hố bộc phá 960kg TNT. Đối chiếu với cấu trúc lô cốt 'cây rơm' ngầm của Pháp để hiểu vì sao chỉ có sức ép nổ ngầm mới triệt tiêu được công sự kiên cố này.",
    viewpoints: [
      "Hố bộc phá 960kg TNT sâu 13m",
      "Xác xe tăng Bazeilles trúng đạn bazooka",
      "Hệ thống hầm ngầm bê tông cốt thép",
      "Chiến hào vây lấn thu hẹp cự ly từ 500m xuống 20m"
    ],
    steamLink: "Địa chất phong hóa núi đá vôi, kỹ thuật đào đường hầm ngầm chữ chi 47m thông gió tự nhiên, bài toán năng lượng sóng nổ định hướng."
  },
  {
    id: 3,
    category: "Chiến trường",
    catKey: "battle",
    sequence: "CHẶNG 03",
    badge: "CHẶNG 03 · CHIẾN TRƯỜNG",
    title: "Cứ điểm Đồi D1 (Dominique 2)",
    coords: "21°23'42\" N · 103°01'25\" E",
    latLng: "21.395° N · 103.023° E",
    image: "images/d1.webp",
    externalUrl: "https://demo.egal.vn/dienbien/data/3/",
    desc: "Cao điểm khống chế cao nhất dãy đồi phía Đông (cao hơn lòng chảo 50m). Ngày nay, đây là nơi đặt Quần thể Tượng đài Chiến thắng Điện Biên Phủ bằng đồng sừng sững, biểu tượng tự hào của dân tộc.",
    mission: "Đứng từ đỉnh D1 quan sát 360 độ toàn cảnh cánh đồng Mường Thanh, sông Nậm Rốm và sân bay dã chiến. Đánh giá tầm bao quát hỏa lực khi ta làm chủ cao điểm này.",
    viewpoints: [
      "Tượng đài Chiến thắng bằng đồng cao 16,6m",
      "Tầm nhìn khống chế toàn bộ phân khu trung tâm",
      "Trận địa hỏa lực pháo binh và súng cối",
      "Bình đồ lòng chảo và sông Nậm Rốm"
    ],
    steamLink: "Trắc địa hình học & tầm nhìn không gian (Line of Sight), cơ học kết cấu công trình tượng đồng 220 tấn chịu tải gió lốc thung lũng."
  },
  {
    id: 4,
    category: "Di sản",
    catKey: "heritage",
    sequence: "MỞ RỘNG",
    badge: "MỞ RỘNG · DI SẢN LỊCH SỬ",
    title: "Di tích Lịch sử Thành Bản Phủ",
    coords: "21°18'50\" N · 103°00'12\" E",
    latLng: "21.314° N · 103.003° E",
    image: "images/muong-phang.webp",
    externalUrl: "https://demo.egal.vn/dienbien/data/4/",
    desc: "Thành lũy thế kỷ XVIII do thủ lĩnh áo vải Hoàng Công Chất xây dựng nhằm bảo vệ vùng biên viễn Mường Thanh khỏi giặc Phẻ, minh chứng cho bề dày lịch sử và truyền thống giữ nước kiên cường của nhân dân Tây Bắc.",
    mission: "Quan sát dấu tích hào nước và lũy tre bao bọc thành lũy đất đắp. So sánh kỹ thuật phòng thủ truyền thống thế kỷ 18 với hệ thống cứ điểm hiện đại năm 1954.",
    viewpoints: [
      "Đền thờ Tướng quân Hoàng Công Chất",
      "Tường thành đất và hàng rào tre gai phòng ngự",
      "Cây đa lịch sử cổ thụ hơn 300 năm",
      "Hệ thống thủy lợi và hào nước bảo vệ"
    ],
    steamLink: "Vật liệu xây dựng bản địa (đất đầm chặt, rễ tre gia cường chống sạt lở), thủy văn nông nghiệp vùng bồn địa."
  },
  {
    id: 5,
    category: "Tưởng niệm",
    catKey: "memorial",
    sequence: "TRI ÂN 01",
    badge: "TRI ÂN 01 · TƯỞNG NIỆM",
    title: "Nghĩa trang Liệt sĩ Đồi A1",
    coords: "21°23'19\" N · 103°01'18\" E",
    latLng: "21.389° N · 103.022° E",
    image: "images/a1-cemetery.webp",
    externalUrl: "https://demo.egal.vn/dienbien/data/5/",
    desc: "Nơi an nghỉ vĩnh hằng của 644 cán bộ, chiến sĩ đã anh dũng hy sinh trong 56 ngày đêm bão lửa, trong đó có các Anh hùng liệt sĩ Tô Vĩnh Diện, Bế Văn Đàn, Phan Đình Giót, Trần Can.",
    mission: "Tìm hiểu kiến trúc không gian tưởng niệm, cấu trúc hàng mộ thẳng tắp và cảm nhận sự thiêng liêng, lòng biết ơn vô hạn của các thế hệ hôm nay.",
    viewpoints: [
      "Đài hương tưởng niệm trung tâm",
      "Phần mộ Anh hùng Tô Vĩnh Diện lấy thân chèn pháo",
      "Phần mộ Anh hùng Bế Văn Đàn lấy thân làm giá súng",
      "Phần mộ Anh hùng Phan Đình Giót lấp lỗ châu mai"
    ],
    steamLink: "Quy hoạch kiến trúc cảnh quan công cộng, bảo tồn di sản ký ức, tâm lý học giáo dục truyền thống yêu nước."
  },
  {
    id: 6,
    category: "Tưởng niệm",
    catKey: "memorial",
    sequence: "TRI ÂN 02",
    badge: "TRI ÂN 02 · TƯỞNG NIỆM",
    title: "Nghĩa trang Liệt sĩ Cứ điểm Him Lam",
    coords: "21°24'11\" N · 103°02'00\" E",
    latLng: "21.403° N · 103.033° E",
    image: "images/him-lam-aerial.webp",
    externalUrl: "https://demo.egal.vn/dienbien/data/6/",
    desc: "Nơi tưởng niệm các chiến sĩ đã ngã xuống trong trận đánh mở màn chiều ngày 13/3/1954, đập tan 'cánh cửa thép' bất khả xâm phạm của tập đoàn cứ điểm trong vòng chưa đầy 6 giờ.",
    mission: "Tìm các lớp không gian từ cổng vào đến đài tưởng niệm. Phân tích trục nhìn hướng về cứ điểm Him Lam để cảm nhận tinh thần quyết chiến quyết thắng.",
    viewpoints: [
      "Đài tưởng niệm chiến sĩ Him Lam",
      "Trục chính hành lễ uy nghiêm",
      "Không gian hoa ban và cây xanh",
      "Bia tưởng niệm Anh hùng Phan Đình Giót"
    ],
    steamLink: "Thiết kế cảnh quan bền vững theo địa hình dốc, chiếu sáng ban đêm tiết kiệm năng lượng mặt trời."
  },
  {
    id: 7,
    category: "Tưởng niệm",
    catKey: "memorial",
    sequence: "TRI ÂN 03",
    badge: "TRI ÂN 03 · TƯỞNG NIỆM",
    title: "Nghĩa trang Liệt sĩ Cứ điểm Độc Lập",
    coords: "21°25'30\" N · 103°00'45\" E",
    latLng: "21.425° N · 103.012° E",
    image: "images/a1-cemetery.webp",
    externalUrl: "https://demo.egal.vn/dienbien/data/7/",
    desc: "Nơi an nghỉ của các anh hùng liệt sĩ đã hy sinh trong trận đánh công kiên thứ hai (rạng sáng 15/3/1954), tiêu diệt hoàn toàn cứ điểm Độc Lập (Gabrielle), bức hàng phân khu Bản Kéo sau đó.",
    mission: "Quan sát vị trí nghĩa trang đối chiếu với địa hình quả đồi Độc Lập độc lập trơ trọi giữa cánh đồng, giải thích vì sao quân Pháp từng gọi đây là 'con mắt thần của thung lũng'.",
    viewpoints: [
      "Quần thể mộ liệt sĩ Trung đoàn 102 & 88",
      "Đài tưởng niệm chiến công rạng sáng 15/3/1954",
      "Bản đồ sa bàn trận đánh mở phân khu Bắc"
    ],
    steamLink: "Hình học không gian trận địa pháo bắn thẳng 105mm áp đảo hỏa lực địch."
  },
  {
    id: 8,
    category: "Tưởng niệm",
    catKey: "memorial",
    sequence: "TRI ÂN 04",
    badge: "TRI ÂN 04 · TƯỞNG NIỆM",
    title: "Nghĩa trang Liệt sĩ Thanh niên Xung phong Tông Khao",
    coords: "21°26'10\" N · 102°59'35\" E",
    latLng: "21.436° N · 102.993° E",
    image: "images/him-lam-memorial.webp",
    externalUrl: "https://demo.egal.vn/dienbien/data/8/",
    desc: "Nơi yên nghỉ của những chàng trai, cô gái thanh niên xung phong, dân công hỏa tuyến đã không quản hy sinh phá bom nổ chậm, thông đèo mở đường cho pháo và đạn vào trận địa.",
    mission: "Khám phá câu chuyện mở đường dã chiến, kỹ thuật rà phá bom nổ chậm và tinh thần 'tim có thể ngừng đập nhưng mạch máu giao thông không thể tắc'.",
    viewpoints: [
      "Đài tưởng niệm TNXP anh dũng",
      "Tượng đài nữ thanh niên xung phong phá bom",
      "Tư liệu tuyến đường máu lửa đèo Pha Đín"
    ],
    steamLink: "Khoa học vật liệu thuốc nổ, kỹ thuật phá bom từ trường, nguyên lý đòn bẩy và ròng rọc vận tải."
  }
];

// Dữ liệu 10 Cứ điểm Sa bàn (#map)
const HOTSPOTS_DATA = [
  {
    id: "H01",
    pinNum: "01",
    name: "Cứ điểm Him Lam",
    layer: "Chiến đấu",
    layerKey: "battle",
    time: "13–14/03/1954",
    image: "images/him-lam-aerial.webp",
    left: "72%", top: "35%",
    tourId: 6,
    desc: "Cánh cửa thép bảo vệ phía Đông Bắc tập đoàn cứ điểm. 17h05 ngày 13/3/1954, đại bác của ta đồng loạt khai hỏa. Anh hùng Phan Đình Giót đã lấy thân mình lấp lỗ châu mai, mở đường cho đồng đội xung kích làm chủ hoàn toàn cứ điểm trong đêm.",
    steamQuestion: "Nếu thay đổi góc bắn và hướng tiếp cận, địa hình đồi dốc Him Lam sẽ làm thay đổi thời gian hành quân và độ an toàn của bộ binh như thế nào?",
    steamAnalysis: "Mật độ đạn pháo trên mét vuông bê tông cốt thép, kỹ thuật bắn cấp tập triệt tiêu hỏa điểm địch."
  },
  {
    id: "H02",
    pinNum: "02",
    name: "Cứ điểm Độc Lập",
    layer: "Chiến đấu",
    layerKey: "battle",
    time: "14–15/03/1954",
    image: "images/him-lam-memorial.webp",
    left: "54%", top: "23%",
    tourId: 7,
    desc: "Cứ điểm biệt lập trên đỉnh đồi dài 700m, được Pháp trang bị công sự ngầm kiên cố. Bộ đội ta đã đào hào áp sát, dùng pháo 105mm bắn thẳng tiêu diệt sở chỉ huy cứ điểm rạng sáng 15/3/1954.",
    steamQuestion: "Vì sao quân ta phải đợi trời tối mới triển khai pháo bắn thẳng lên sườn đồi thay vì bắn cầu vồng từ xa?",
    steamAnalysis: "Quỹ đạo parabol đạn pháo cầu vồng vs quỹ đạo thẳng, tính toán góc tới vuông góc mặt lô cốt."
  },
  {
    id: "H03",
    pinNum: "03",
    name: "Sở chỉ huy Mường Phăng",
    layer: "Chỉ huy",
    layerKey: "command",
    time: "31/01 – 15/05/1954",
    image: "images/muong-phang.webp",
    left: "82%", top: "15%",
    tourId: 1,
    desc: "Bộ não đầu não của chiến dịch. Nơi Đại tướng Võ Nguyên Giáp và Bộ chỉ huy ngày đêm phân tích tin tức tình báo trinh sát, chỉ đạo tác chiến toàn mặt trận qua hệ thống điện thoại hữu tuyến dã chiến.",
    steamQuestion: "Làm thế nào để truyền tin điện thoại qua hàng chục km rừng rậm mùa mưa mà tín hiệu không bị suy hao hay đứt đoạn?",
    steamAnalysis: "Vật lý điện trở dây dẫn đồng bọc cao su, mạch lặp tín hiệu và an toàn bảo mật mật mã cơ yếu."
  },
  {
    id: "H04",
    pinNum: "04",
    name: "Tuyến hậu cần Pha Đín",
    layer: "Hậu cần",
    layerKey: "logistics",
    time: "Toàn chiến dịch",
    image: "images/him-lam-memorial.webp",
    left: "16%", top: "18%",
    tourId: 8,
    desc: "Huyết mạch giao thông dài hàng trăm km qua đèo Pha Đín hiểm trở. Hơn 26 vạn dân công cùng 2 vạn xe đạp thồ đã vận chuyển hơn 25.000 tấn gạo, đạn dược vượt đèo dốc tiếp viện cho tiền tuyến.",
    steamQuestion: "Lực ma sát và độ mòn lốp xe đạp thồ thay đổi thế nào khi tải trọng tăng từ 50kg lên 300kg trên đường dốc đá?",
    steamAnalysis: "Cơ học xe đạp thồ: hạ thấp trọng tâm, gia cố khung sắt, quấn dây gai tăng ma sát bám đường dốc."
  },
  {
    id: "H05",
    pinNum: "05",
    name: "Đường kéo pháo",
    layer: "Kỹ thuật",
    layerKey: "tech",
    time: "15/01 – 05/02/1954",
    image: "images/muong-phang.webp",
    left: "30%", top: "32%",
    tourId: 1,
    desc: "Tuyến đường xẻ núi bạt rừng dài 15km để kéo những khẩu pháo nặng hơn 2 tấn lên đỉnh đồi cao hơn 1.000m hoàn toàn bằng sức người, dây tời và gỗ chèn. Nơi Anh hùng Tô Vĩnh Diện hy sinh chèn pháo.",
    steamQuestion: "Hệ thống ròng rọc và dây tời hỗ trợ giảm bao nhiêu lần lực kéo của bộ đội khi pháo trượt trên dốc nghiêng 40 độ?",
    steamAnalysis: "Định luật bảo toàn công cơ học, lực ma sát lăn của con lăn gỗ, sức căng đứt dây chão gai dừa."
  },
  {
    id: "H06",
    pinNum: "06",
    name: "Hệ thống giao thông hào",
    layer: "Kỹ thuật",
    layerKey: "tech",
    time: "20/03 – 07/05/1954",
    image: "images/a1.webp",
    left: "43%", top: "52%",
    tourId: 2,
    desc: "Mạng lưới chiến hào 'trói chặt' tập đoàn cứ điểm với tổng chiều dài hơn 500km. Gồm hào trục cho bộ binh cơ động và hào chiến đấu áp sát hàng rào dây thép gai Pháp từ cự ly 500m xuống 20m.",
    steamQuestion: "Vì sao chiến hào luôn được đào theo hình dích dắc (chữ chi) chứ không bao giờ đào theo một đường thẳng?",
    steamAnalysis: "Khí động học phân tán sóng xung kích bom nổ, ngăn mảnh đạn pháo quét dọc thân hào và chống bắn tỉa."
  },
  {
    id: "H07",
    pinNum: "07",
    name: "Cứ điểm Đồi D1",
    layer: "Chiến đấu",
    layerKey: "battle",
    time: "30/03 – 01/05/1954",
    image: "images/d1.webp",
    left: "59%", top: "58%",
    tourId: 3,
    desc: "Cao điểm cao nhất phía Đông khống chế sân bay Mường Thanh. Trung đoàn 209 (Đại đoàn 312) đã tiến công làm chủ đồi D1, đặt đài quan sát chỉ huy khống chế toàn bộ máy bay hạ cánh.",
    steamQuestion: "Góc tà và tầm nhìn quan sát từ đồi D1 có ưu thế gì so với các vị trí khác trong việc chỉ huy pháo cao xạ 37mm?",
    steamAnalysis: "Góc quan sát toàn phần (FOV 360°), đo độ cao mục tiêu bay bằng kính trắc viễn cự ly."
  },
  {
    id: "H08",
    pinNum: "08",
    name: "Cụm cứ điểm C1 – C2",
    layer: "Chiến đấu",
    layerKey: "battle",
    time: "30/03 – 01/05/1954",
    image: "images/a1.webp",
    left: "72%", top: "66%",
    tourId: 2,
    desc: "Cứ điểm C1 chứng kiến cuộc giằng co ác liệt nhất. Ta và địch chia đôi quả đồi, chỉ cách nhau một bờ đất chiến hào suốt hàng tuần lễ trước khi ta hoàn toàn làm chủ vào ngày 1/5/1954.",
    steamQuestion: "Trong điều kiện chia đôi đồi, kỹ thuật đào hào ngầm và hỏa lực lựu đạn chùm đóng vai trò quyết định ra sao?",
    steamAnalysis: "Quỹ đạo ném lựu đạn góc cao, cách âm hầm đất và kỹ thuật giữ thông gió dưới lòng đất."
  },
  {
    id: "H09",
    pinNum: "09",
    name: "Cứ điểm Đồi A1",
    layer: "Kỹ thuật",
    layerKey: "tech",
    time: "30/03 – 06/05/1954",
    image: "images/a1.webp",
    left: "62%", top: "78%",
    tourId: 2,
    desc: "Trận địa ngầm công kiên đỉnh cao. Tổ đào hầm bí mật đào đường hầm dài 47m vào sâu lòng đồi dưới làn bom đạn, đặt khối bộc phá 960kg TNT. 20h30 ngày 6/5/1954, tiếng nổ rung chuyển báo hiệu giờ tổng công kích.",
    steamQuestion: "Làm thế nào để đào 47m hầm ngầm đất đồi nung cứng mà không gây tiếng động cho lính Pháp ở ngay phía trên?",
    steamAnalysis: "Kỹ thuật gọt đất bằng xẻng cùn, bọc vải bao tải chứa đất chuyển ra ngoài, quạt thông gió tự chế."
  },
  {
    id: "H10",
    pinNum: "10",
    name: "Hầm chỉ huy De Castries",
    layer: "Chỉ huy",
    layerKey: "command",
    time: "07/05/1954",
    image: "images/muong-phang.webp",
    left: "47%", top: "70%",
    tourId: 1,
    desc: "Căn hầm kiên cố dài 20m, trần lợp bằng vòm thép gợn sóng và bao cát dày 1,5m. 17h30 ngày 7/5/1954, tổ xung kích của đồng chí Tạ Quốc Luật tiến vào bắt sống tướng De Castries và toàn bộ bộ chỉ huy Pháp.",
    steamQuestion: "Cấu trúc vòm thép chịu lực lượn sóng phân bổ áp lực bom nổ từ trên xuống theo nguyên lý vật lý nào?",
    steamAnalysis: "Kết cấu vòm chịu nén tối ưu (Arch structure), truyền lực nén trực tiếp vào nền đất móng."
  }
];

if (typeof window !== 'undefined') {
  window.TOURS_DATA = TOURS_DATA;
  window.HOTSPOTS_DATA = HOTSPOTS_DATA;
}
