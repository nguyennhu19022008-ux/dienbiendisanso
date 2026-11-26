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
    externalUrl: "https://demo.egal.vn/dienbien/data/3/",
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
    externalUrl: "https://demo.egal.vn/dienbien/data/2/",
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
    time: "30/03 – 01/04/1954",
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

// Dữ liệu Gói Trải Nghiệm Lớp Học 45 - 60 Phút (THPT Nguyễn Du - STEAM Heritage Kit)
const CLASSROOM_KIT_DATA = {
  workflowSteps: [
    {
      step: "01",
      title: "Khởi động",
      duration: "5 phút",
      minutes: 5,
      tabTarget: "missions",
      activity: "Nêu tình huống mở đầu và giao nhiệm vụ cho các nhóm trên màn hình chính.",
      tool: "Màn hình tổng quan Web + Đồng hồ đếm giờ"
    },
    {
      step: "02",
      title: "Khám phá số",
      duration: "10–15 phút",
      minutes: 15,
      tabTarget: "missions",
      activity: "Học sinh truy cập Tour 360° (Mường Phăng, Đồi A1, Đồi D1) thu thập dữ kiện địa hình và lịch sử.",
      tool: "Tour 360° eGAL + Phiếu học tập"
    },
    {
      step: "03",
      title: "Thực hành STEAM",
      duration: "15–20 phút",
      minutes: 20,
      tabTarget: "logistics",
      activity: "Giải thẻ tình huống hậu cần, tính toán sức chở xe đạp thồ và vạch tuyến đường tối ưu.",
      tool: "Mô phỏng Xe đạp thồ + Bản đồ Tuyến A3/Số"
    },
    {
      step: "04",
      title: "Báo cáo nhóm",
      duration: "10 phút",
      minutes: 10,
      tabTarget: "submit",
      activity: "Đại diện các nhóm nộp phiếu và trình bày ngắn gọn phương án, lập luận lựa chọn.",
      tool: "Phiếu nộp nhanh / Google Form lớp học"
    },
    {
      step: "05",
      title: "Đánh giá",
      duration: "5 phút",
      minutes: 5,
      tabTarget: "rubric",
      activity: "Chấm điểm nhanh theo tiêu chí (độ chính xác lịch sử, tính hợp lý STEAM) và tổng kết.",
      tool: "Bảng Rubric tương tác trực tuyến"
    }
  ],
  focusMissions: [
    {
      id: "M01",
      tourIndex: 0,
      badge: "ĐIỂM NHẤN 01 · CHỈ HUY",
      title: "Sở chỉ huy Chiến dịch Mường Phăng",
      image: "images/muong-phang.webp",
      duration: "5 phút quan sát",
      questions: [
        "1. Đường hầm xuyên núi nối lán làm việc của Đại tướng Võ Nguyên Giáp và Bộ Tham mưu dài bao nhiêu mét?",
        "2. Quan sát tán rừng nguyên sinh Phăng Lăng trong ảnh 360°: đặc điểm địa hình này giúp tránh máy bay trinh sát Pháp ra sao?",
        "3. Quyết định chuyển phương châm tại đây là gì và nó tác động thế nào đến bài toán vận tải hậu cần?"
      ],
      hintAnswer: "Đường hầm dài 320m dưới tán rừng già đa tầng che khuất hoàn toàn khỏi không ảnh và trinh sát thời kỳ đầu; chuyển sang 'Đánh chắc, tiến chắc' đòi hỏi mạng lưới giao thông hào và nguồn cung gạo đạn ổn định suốt 56 ngày đêm."
    },
    {
      id: "M02",
      tourIndex: 1,
      badge: "ĐIỂM NHẤN 02 · CHIẾN TRƯỜNG",
      title: "Cứ điểm Đồi A1 (Eliane 2)",
      image: "images/a1.webp",
      duration: "5 phút quan sát",
      questions: [
        "1. Ghi lại 3 thông số cốt lõi tại đỉnh Đồi A1: chiều dài đường hầm ngầm, khối lượng thuốc nổ và độ sâu hố bộc phá.",
        "2. Quan sát địa thế dốc đồi (+32m) và xác xe tăng Bazeilles: vì sao bộ binh xung phong bề mặt bị giằng co tới 39 ngày đêm?",
        "3. Công binh đã xử lý tiếng động và thông gió trong lòng đồi đất sét nung cứng như thế nào?"
      ],
      hintAnswer: "Hầm ngầm chữ chi dài 47m, đặt khối bộc phá 960kg TNT tạo hố sâu 13m. Địch có hầm ngầm bê tông 'cây rơm' nhiều tầng chống được pháo thông thường; công binh dùng xẻng cùn, bọc vải bao tải chuyển đất ban đêm và quạt thông gió tự chế."
    },
    {
      id: "M03",
      tourIndex: 2,
      badge: "ĐIỂM NHẤN 03 · ĐỊA HÌNH & HẬU CẦN",
      title: "Đồi D1 (+50m) & Nút thắt tiếp tế",
      image: "images/d1.webp",
      duration: "4 phút quan sát",
      questions: [
        "1. Đứng từ đỉnh Đồi D1 (+50m so với lòng chảo), góc quan sát bao quát xuống sân bay Mường Thanh đạt xấp xỉ bao nhiêu độ?",
        "2. Dữ liệu thống kê trên web cho biết kỷ lục xe đạp thồ chở được tối đa bao nhiêu kg trên một xe?",
        "3. Từ ưu thế cao điểm phía Đông, nếu đoàn tiếp tế đi qua cánh đồng trống ban ngày thì điều gì sẽ xảy ra?"
      ],
      hintAnswer: "Đỉnh D1 cao hơn thung lũng +50m, góc tà xạ giới -4°12' xuống tim đường băng (1.200m). Kỷ lục xe đạp thồ đạt 352 kg/xe (ông Ma Văn Thắng). Đi qua đồng trống ban ngày sẽ lộ thiên hoàn toàn trước hỏa lực pháo binh và máy bay trinh sát địch."
    }
  ],
  situationCards: [
    {
      id: "TH-01",
      tag: "THẺ TÌNH HUỐNG 01 · CƠ HỌC & ĐỘ DỐC",
      title: "Vượt đèo Pha Đin với Xe đạp thồ tải nặng",
      context: "Đoàn tiếp tế cần chuyển 12 tấn gạo vượt đoạn dốc đèo dài 24 km có độ dốc trung bình 15%, nền đường đất trơn lầy do mưa xuân Tây Bắc.",
      dataPoints: [
        "Tải trọng an toàn tối đa trên dốc 15%: 220 kg/xe",
        "Định mức xe thô sơ không gia cố khung: tối đa 110 kg/xe",
        "Tốc độ hành quân leo dốc ban đêm: 2,5 km/giờ"
      ],
      task: "Tính số lượt xe tối thiểu để chuyển hết 12 tấn gạo. Đề xuất 2 cải tiến cơ học đơn giản bằng tre/gỗ (thanh gác tay lái, phanh guốc gỗ) giúp 1 người điều khiển giữ được 220 kg mà không gãy khung hoặc trượt dốc."
    },
    {
      id: "TH-02",
      tag: "THẺ TÌNH HUỐNG 02 · TOÁN HẬU CẦN",
      title: "Nghịch lý Tiêu hao Lương thực: Gánh bộ vs. Xe thồ",
      context: "Từ kho hậu phương (Thanh Hóa / Phú Thọ) vào mặt trận dài 250 km. Thời gian cả đi có hàng và về không hàng là 16 ngày.",
      dataPoints: [
        "Mỗi dân công tự ăn trên đường đi và về: 1,2 kg gạo/ngày (19,2 kg/chuyến)",
        "Sức mang tối đa bằng gánh bộ đường dài: 25 kg/người/chuyến",
        "Sức chở trung bình xe đạp thồ cải tiến: 250 kg/xe/chuyến"
      ],
      task: "Tính lượng gạo thực sự còn lại giao cho bộ đội của 1 người gánh bộ so với 1 người đẩy xe thồ. Chứng minh bằng phép tính tỷ lệ tiêu hao (bao nhiêu kg gạo phải ăn dọc đường để đưa được 1 kg vào Điện Biên?)."
    },
    {
      id: "TH-03",
      tag: "THẺ TÌNH HUỐNG 03 · ĐỊA HÌNH CHIẾN THUẬT",
      title: "Chọn hành lang vận tải né vùng quan sát hỏa lực",
      context: "Trước ngày 30/03/1954, địch vẫn kiểm soát sân bay Mường Thanh và các cao điểm Him Lam, Độc Lập, D1, A1, dùng máy bay L-19 trinh sát ban ngày.",
      dataPoints: [
        "Bán kính tầm nhìn từ đỉnh D1 (+50m): bao phủ 92% lòng chảo trống",
        "Độ che phủ tán rừng Phăng Lăng – Khe núi phía Đông Bắc: >85%",
        "Hệ thống giao thông hào vây lấn sâu 1,5m hình chữ chi 120°"
      ],
      task: "Sử dụng Bản đồ Vạch Tuyến bên cạnh, nối các trạm từ Kho Hậu Phương (N1) tới Trận Địa Lòng Chảo (N8) sao cho quãng đường hợp lý nhất nhưng độ an toàn đạt trên 80%. Giải thích vì sao bỏ qua đường Quốc lộ 41 ngắn hơn."
    },
    {
      id: "TH-04",
      tag: "THẺ TÌNH HUỐNG 04 · KỸ THUẬT CÔNG KIÊN",
      title: "Bài toán đào 47m hầm ngầm Đồi A1 không tiếng động",
      context: "Tổ công binh đào đường hầm bí mật dài 47m xuyên vào lòng đồi A1 (đất đồi pha đá vôi cứng) ngay dưới chân hệ thống lô cốt địch.",
      dataPoints: [
        "Kích thước tiết diện hầm: rộng 0,9m × cao 1,2m",
        "Thời gian thi công: 15 ngày đêm liên tục (từ 20/04 – 05/05)",
        "Khối lượng bộc phá nạp buồng nổ cuối hầm: 960 kg TNT"
      ],
      task: "Tính tổng thể tích (m³) đất đá cần đào và trung bình mỗi ngày phải vận chuyển ra ngoài bao nhiêu bao tải đất (1m³ đất ≈ 1,6 tấn). Giải thích cơ chế thông gió không điện bằng ống tre và quạt mo."
    }
  ],
  logisticsNodes: [
    { id: "N1", code: "N1", name: "Kho Pha Đin", short: "Kho Pha Đin", x: 90, y: 78, terrain: "Đèo núi cao (+15% dốc)", risk: 12, note: "Điểm xuất phát lương thực từ hậu phương Sơn La." },
    { id: "N2", code: "N2", name: "Khe Rừng Tuần Giáo", short: "Rừng Tuần Giáo", x: 245, y: 66, terrain: "Đường mòn tán rừng", risk: 8, note: "Che phủ rừng rậm, máy bay trinh sát L-19 khó phát hiện." },
    { id: "N3", code: "N3", name: "Cửa ngõ Mường Phăng", short: "Mường Phăng", x: 420, y: 92, terrain: "Rừng nguyên sinh (320m hầm)", risk: 5, note: "An toàn nhất, sát Sở chỉ huy Chiến dịch." },
    { id: "N4", code: "N4", name: "Quốc lộ 41 Trống", short: "Quốc lộ 41", x: 255, y: 215, terrain: "Đường nhựa lộ thiên", risk: 45, note: "Ngắn nhưng hoàn toàn lộ trước pháo bắn thẳng & không quân." },
    { id: "N5", code: "N5", name: "Đường Hào Bắc", short: "Hào Bắc (Độc Lập)", x: 430, y: 210, terrain: "Chiến hào chữ chi 120°", risk: 14, note: "Được thành hào bảo vệ 75% sóng xung kích bom nổ." },
    { id: "N6", code: "N6", name: "Cánh đồng Mường Thanh", short: "Đồng Mường Thanh", x: 320, y: 315, terrain: "Thung lũng phẳng, không che chắn", risk: 55, note: "Nằm gọn trong góc tà ngắm thẳng -4°12' từ Đồi D1." },
    { id: "N7", code: "N7", name: "Sườn Đông D1 – C1", short: "Sườn Đông D1", x: 545, y: 270, terrain: "Hào tiếp cận dãy đồi Đông", risk: 18, note: "Tuyến cơ động đêm dọc sườn khuất sau khi làm chủ D1." },
    { id: "N8", code: "N8", name: "Trận địa Đồi A1", short: "Trận địa A1", x: 515, y: 390, terrain: "Công sự ngầm tiền tiêu", risk: 10, note: "Đích tiếp tế gạo, đạn và khối thuốc nổ công kiên." }
  ],
  logisticsEdges: [
    { from: "N1", to: "N2", dist: 42, safe: true },
    { from: "N1", to: "N4", dist: 34, safe: false },
    { from: "N2", to: "N3", dist: 38, safe: true },
    { from: "N2", to: "N4", dist: 24, safe: false },
    { from: "N3", to: "N5", dist: 28, safe: true },
    { from: "N3", to: "N7", dist: 44, safe: true },
    { from: "N4", to: "N5", dist: 30, safe: false },
    { from: "N4", to: "N6", dist: 25, safe: false },
    { from: "N5", to: "N7", dist: 26, safe: true },
    { from: "N5", to: "N6", dist: 22, safe: false },
    { from: "N6", to: "N8", dist: 29, safe: false },
    { from: "N7", to: "N8", dist: 27, safe: true }
  ],
  rubricCriteria: [
    {
      id: "R1",
      name: "1. Độ chính xác dữ kiện lịch sử từ Web 3D",
      weight: 3,
      levels: [
        { score: 3.0, label: "Xuất sắc (3.0đ)", desc: "Nêu đúng 100% thông số Mường Phăng (320m), A1 (47m, 960kg TNT), D1 (+50m) và gắn với bối cảnh." },
        { score: 2.25, label: "Khá tốt (2.25đ)", desc: "Nêu đúng đa số dữ liệu từ Tour 360°, có sai sót nhỏ ở 1 thông số phụ." },
        { score: 1.5, label: "Đạt (1.5đ)", desc: "Nêu được dữ liệu cơ bản nhưng chưa đối chiếu chéo với địa hình bản đồ." },
        { score: 0.75, label: "Cần bổ sung (0.75đ)", desc: "Thiếu dữ liệu thực tế từ Web hoặc nhầm lẫn giữa các cứ điểm (ví dụ nhầm A1 và D1)." }
      ]
    },
    {
      id: "R2",
      name: "2. Tư duy tính toán Toán học & STEAM",
      weight: 3,
      levels: [
        { score: 3.0, label: "Xuất sắc (3.0đ)", desc: "Tính đúng tải trọng xe đạp thồ / tỷ lệ tiêu hao lương thực, giải thích rõ nguyên lý cơ học hoặc hình học." },
        { score: 2.25, label: "Khá tốt (2.25đ)", desc: "Tính đúng kết quả chính, trình bày công thức rõ ràng nhưng giải thích vật lý còn ngắn." },
        { score: 1.5, label: "Đạt (1.5đ)", desc: "Có hướng tính đúng nhưng nhầm đơn vị đo (tấn/kg) hoặc thiếu bước so sánh gánh bộ." },
        { score: 0.75, label: "Cần bổ sung (0.75đ)", desc: "Chưa hoàn thành phép tính hoặc số liệu ước lượng cảm tính." }
      ]
    },
    {
      id: "R3",
      name: "3. Tính hợp lý & An toàn Tuyến hậu cần",
      weight: 2,
      levels: [
        { score: 2.0, label: "Xuất sắc (2.0đ)", desc: "Tuyến vạch đạt độ an toàn >= 80%, né vùng hỏa lực mở (Quốc lộ 41, Đồng trống) và tận dụng tán rừng/hào chữ chi." },
        { score: 1.5, label: "Khá tốt (1.5đ)", desc: "Tuyến đi hợp lý ở phần lớn chặng nhưng còn đi qua 1 nút có rủi ro trung bình cao." },
        { score: 1.0, label: "Đạt (1.0đ)", desc: "Chỉ chọn đường ngắn nhất theo đường thẳng, chưa xét góc tà quan sát từ Đồi D1." },
        { score: 0.5, label: "Cần bổ sung (0.5đ)", desc: "Tuyến bị đứt đoạn hoặc đi xuyên trực tiếp vùng hỏa lực địch." }
      ]
    },
    {
      id: "R4",
      name: "4. Báo cáo nhóm & Phản tư giới hạn mô hình",
      weight: 2,
      levels: [
        { score: 2.0, label: "Xuất sắc (2.0đ)", desc: "Trình bày tự tin dưới 2 phút, chỉ ra được giới hạn thực tế (mưa bùn, bom đạn, mệt mỏi) so với giả định trên giấy." },
        { score: 1.5, label: "Khá tốt (1.5đ)", desc: "Trình bày mạch lạc, trả lời được 1 câu hỏi phản biện từ nhóm bạn hoặc giáo viên." },
        { score: 1.0, label: "Đạt (1.0đ)", desc: "Đọc lại số liệu trên phiếu, chưa nêu được yếu tố phản tư giới hạn mô hình." },
        { score: 0.5, label: "Cần bổ sung (0.5đ)", desc: "Báo cáo rời rạc, vượt quá thời gian hoặc thiếu thành viên tham gia." }
      ]
    }
  ]
};

// Danh sách Hiện vật Lịch sử 3D Sketchfab đã xác minh API (isProtected === false) + Ghi chú Mức 1 & Góc Camera 3D
const ARTIFACTS_3D = [
  {
    id: "sung-than-cong-co",
    uid: "d93798b2ee5d443fbc37ea9d46c38b23",
    title: "Súng Thần Công Cổ Thế Kỷ XVIII",
    subtitle: "Hỏa khí tiền nạp nòng đồng đặt trên giá xe gỗ nẹp sắt",
    gradeLabel: "Khối 10",
    periodLabel: "Lịch sử Trung – Cận đại",
    description:
      "Mẫu đại bác tiền nạp tiêu biểu giai đoạn thế kỷ XVII–XVIII với nòng đúc liền khối, quai treo cân bằng và bệ gỗ bốn bánh cơ động trên chiến lũy hoặc chiến thuyền.",
    historicalFact:
      "Tại Đại Việt, từ thời Hồ – Lê sơ đến triều Tây Sơn và triều Nguyễn, kỹ thuật đúc súng thần công đồng phát triển rực rỡ phục vụ phòng thủ thành lũy và thủy chiến.",
    author: "Kingy",
    sketchfabUrl:
      "https://sketchfab.com/3d-models/naval-cannon-18th-century-english-style-d93798b2ee5d443fbc37ea9d46c38b23",
    embedUrl:
      "https://sketchfab.com/models/d93798b2ee5d443fbc37ea9d46c38b23/embed",
    previewImage:
      "https://media.sketchfab.com/models/d93798b2ee5d443fbc37ea9d46c38b23/thumbnails/cd8190106a2e4aeb812a5cd6f7193507/a12bc71db57949e19748260b326ccb8a.jpeg",
    annotations: [
      {
        id: "muzzle-bore",
        label: "1. Nòng đồng đúc miệng loe & ngõng pháo",
        detail:
          "Phần miệng nòng loe giúp nạp thuốc phóng và đạn cầu từ phía trước; hai trục ngõng ngang thân pháo cho phép thay đổi góc ngẩng bắn tầm xa.",
        cameraView: { yawDeg: -24, pitchDeg: 14, zoom: 0.62, panRight: -0.14, panUp: 0.04 }
      },
      {
        id: "lifting-dolphins",
        label: "2. Hai quai cẩu cân bằng trọng tâm",
        detail:
          "Cặp quai đúc nổi trên lưng nòng pháo giúp buộc dây tời cẩu khẩu pháo nặng hàng tấn lắp đặt lên giá xe gỗ hoặc hầm pháo.",
        cameraView: { yawDeg: 34, pitchDeg: 38, zoom: 0.56, panRight: 0.02, panUp: 0.09 }
      },
      {
        id: "wooden-carriage",
        label: "3. Giá xe gỗ nẹp sắt & bốn bánh chịu lực",
        detail:
          "Khung gỗ bậc thang nẹp đai sắt chịu giật lùi khi khai hỏa, kết hợp dây chằng giảm chấn giúp kíp pháo thủ kéo pháo trở lại vị trí bắn.",
        cameraView: { yawDeg: 78, pitchDeg: 16, zoom: 0.72, panRight: 0.08, panUp: -0.07 }
      }
    ]
  },
  {
    id: "xe-dap-tho-dien-bien",
    uid: "29b644ad4b6d4d4a92bb5f61766f669c",
    title: "Xe Đạp Thồ Kháng Chiến Điện Biên",
    subtitle: "Kỳ tích vận tải hậu cần vượt đèo Pha Đin nuôi sống chiến dịch",
    gradeLabel: "Khối 12",
    periodLabel: "Kháng chiến chống Pháp (1953–1954)",
    description:
      "Xe đạp khung thép nguyên bản được dân công hỏa tuyến cải tiến bằng cọc tre, nẹp gỗ và má phanh phụ để chở hàng trăm kilôgam gạo, đạn qua dốc núi Tây Bắc.",
    historicalFact:
      "Hơn 20.990 xe đạp thồ đã tham gia Chiến dịch Điện Biên Phủ, đạt kỷ lục 352 kg mỗi chuyến (dân công Ma Văn Thắng), tăng năng suất gấp 10–15 lần gánh bộ.",
    author: "CharlesNG",
    sketchfabUrl:
      "https://sketchfab.com/3d-models/old-bicycle-29b644ad4b6d4d4a92bb5f61766f669c",
    embedUrl:
      "https://sketchfab.com/models/29b644ad4b6d4d4a92bb5f61766f669c/embed",
    previewImage:
      "https://media.sketchfab.com/models/29b644ad4b6d4d4a92bb5f61766f669c/thumbnails/97f183fdcefb4adba6b12a44767396c0/86a6023a41e4437d83ebb8c3a9f891fc.jpeg",
    annotations: [
      {
        id: "bamboo-handlebar",
        label: "1. Tay lái nối cọc tre điều hướng",
        detail:
          "Dân công buộc thêm đoạn tre dài vào ghi-đông làm đòn bẩy giữ thăng bằng và điều hướng từ bên cạnh khi bao gạo chất cao quá đầu người.",
        cameraView: { yawDeg: 38, pitchDeg: 24, zoom: 0.52, panRight: 0.16, panUp: 0.16 }
      },
      {
        id: "reinforced-frame",
        label: "2. Khung sườn thép gia cố chịu tải nặng",
        detail:
          "Khung tam giác thép được nẹp gỗ cứng và quấn săm cao su ở vành bánh, cho phép chịu tải từ 200 đến hơn 300 kg liên tục trên đường đá lầy.",
        cameraView: { yawDeg: -10, pitchDeg: 14, zoom: 0.68, panRight: 0.0, panUp: 0.02 }
      },
      {
        id: "brake-carrier",
        label: "3. Thanh đẩy hậu & má phanh gỗ đổ dốc",
        detail:
          "Cọc tre chống dưới yên kết hợp miếng gỗ nghiến kẹp bổ sung vào lốp bánh sau giúp hãm tốc an toàn khi xuống các cung đèo dốc 15% ở Pha Đin.",
        cameraView: { yawDeg: -62, pitchDeg: 18, zoom: 0.58, panRight: -0.18, panUp: -0.03 }
      }
    ]
  },
  {
    id: "phao-cao-xa-37mm",
    uid: "120eeca98b394b6ea07dd5668984f338",
    title: "Pháo Cao Xạ 37mm (Hệ 61-K / 70-K)",
    subtitle: "Lưới lửa phòng không khống chế không phận lòng chảo Mường Thanh",
    gradeLabel: "Khối 12",
    periodLabel: "Chiến dịch Điện Biên Phủ (1954)",
    description:
      "Pháo phòng không tự động cỡ nòng 37mm do Liên Xô chế tạo (dòng 61-K lục quân và biến thể 70-K đồng chuẩn đạn kẹp), bắn liên thanh khống chế máy bay tiếp vận địch.",
    historicalFact:
      "Trung đoàn Pháo cao xạ 367 đã kéo pháo vượt núi vào trận địa Điện Biên Phủ, bắn rơi 52 máy bay Pháp, buộc máy bay tiếp tế C-47 phải thả dù từ độ cao lớn.",
    author: "ThomasBeerens",
    sketchfabUrl:
      "https://sketchfab.com/3d-models/37-mm67-15-70-k-single-120eeca98b394b6ea07dd5668984f338",
    embedUrl:
      "https://sketchfab.com/models/120eeca98b394b6ea07dd5668984f338/embed",
    previewImage:
      "https://media.sketchfab.com/models/120eeca98b394b6ea07dd5668984f338/thumbnails/628ec1ad447c4077ab347bf6fbe0486d/eee0cd2d04924c9388e35693bb2299b8.jpeg",
    annotations: [
      {
        id: "flash-hider-barrel",
        label: "1. Nòng dài 37mm & loa giảm chớp đầu nòng",
        detail:
          "Tỷ lệ chiều dài nòng lớn tạo sơ tốc đầu đạn ~880 m/s, đạt trần bắn hiệu quả trên 3.000m; loa loe đầu nòng giúp giảm chớp sáng ban đêm.",
        cameraView: { yawDeg: 30, pitchDeg: 15, zoom: 0.66, panRight: 0.22, panUp: 0.0 }
      },
      {
        id: "five-round-clip",
        label: "2. Hộp tiếp đạn kẹp 5 viên nạp trên",
        detail:
          "Kíp nạp đạn thả kẹp 5 viên đạn 37x252mm liên tiếp từ phía trên khóa nòng, duy trì tốc độ bắn thực tế tới 80–120 phát/phút.",
        cameraView: { yawDeg: -38, pitchDeg: 34, zoom: 0.50, panRight: -0.12, panUp: 0.12 }
      },
      {
        id: "sight-handwheels",
        label: "3. Tay quay tầm – hướng & kính ngắm phòng không",
        detail:
          "Hai pháo thủ vận hành vô-lăng nâng hạ góc tà (tới +85°) và xoay vòng 360° theo đường ngắm đón đầu mục tiêu bay.",
        cameraView: { yawDeg: -85, pitchDeg: 20, zoom: 0.56, panRight: -0.14, panUp: -0.05 }
      }
    ]
  },
  {
    id: "may-bay-b52",
    uid: "38b0c64bd552431394efa8625d7f5144",
    title: "Máy Bay Ném Bom Chiến Lược B-52",
    subtitle: 'Pháo đài bay trong trận quyết chiến "Điện Biên Phủ trên không" 1972',
    gradeLabel: "Khối 11–12",
    periodLabel: "Hà Nội 12 ngày đêm (12/1972)",
    description:
      "Máy bay ném bom phản lực hạng nặng tầm xa 8 động cơ của Không quân Hoa Kỳ, bay ở tầng bình lưu 10–12 km mang theo tải trọng bom rải thảm lớn và hệ thống gây nhiễu điện tử.",
    historicalFact:
      "Trong chiến dịch 12 ngày đêm cuối tháng 12/1972, quân và dân miền Bắc đã bắn rơi 34 chiếc B-52 (trong tổng số 81 máy bay các loại), buộc Mỹ ký Hiệp định Paris 1973.",
    author: "bohmerang",
    sketchfabUrl:
      "https://sketchfab.com/3d-models/boeing-b-52-stratofortress-38b0c64bd552431394efa8625d7f5144",
    embedUrl:
      "https://sketchfab.com/models/38b0c64bd552431394efa8625d7f5144/embed",
    previewImage:
      "https://media.sketchfab.com/models/38b0c64bd552431394efa8625d7f5144/thumbnails/4d6ad965421443519456cd6d2b47a1bd/4631298b950e471681bd06bcc3a38709.jpeg",
    annotations: [
      {
        id: "eight-engines",
        label: "1. Cụm 8 động cơ phản lực dưới cánh",
        detail:
          "Bốn cụm vỏ động cơ kép treo dưới hai cánh tạo lực đẩy lớn cho phép bay hành trình liên lục địa ở độ cao trên 10.000m và tỏa tín hiệu nhiệt mạnh.",
        cameraView: { yawDeg: 26, pitchDeg: -8, zoom: 0.58, panRight: 0.14, panUp: -0.02 }
      },
      {
        id: "swept-wing",
        label: "2. Sải cánh cụp 56,4m chứa khoang nhiên liệu",
        detail:
          "Cánh xuôi sau góc 35° diện tích lớn giúp giữ ổn định khí động ở tầng bình lưu, hai đầu cánh có bánh phụ giữ thăng bằng khi cất hạ cánh.",
        cameraView: { yawDeg: 0, pitchDeg: 62, zoom: 0.88, panRight: 0.0, panUp: 0.0 }
      },
      {
        id: "bomb-bay-ecm",
        label: "3. Khoang bom thân dài & hệ thống gây nhiễu",
        detail:
          "Thân dài gần 48,5m tích hợp khoang bom trung tâm sức chứa tới 27–31 tấn bom và các tổ hợp phát nhiễu radar – mục tiêu đánh chặn của tên lửa SAM-2.",
        cameraView: { yawDeg: 118, pitchDeg: 16, zoom: 0.72, panRight: 0.05, panUp: 0.02 }
      }
    ]
  },
  {
    id: "xe-tang-t54a",
    uid: "0359275bbdea4bb784b7c5ce16ec6103",
    title: "Xe Tăng Chủ Lực T-54A (Số Hiệu 13)",
    subtitle: "Lực lượng đột kích thọc sâu trong Chiến dịch Hồ Chí Minh lịch sử",
    gradeLabel: "Khối 12",
    periodLabel: "Đại thắng Mùa Xuân (30/04/1975)",
    description:
      "Xe tăng hạng trung chủ lực nổi tiếng với lớp giáp nghiêng bền chắc, tháp pháo đúc hình bán cầu và pháo chính 100mm có bộ ổn định nòng theo mặt phẳng đứng.",
    historicalFact:
      "Các đại đội xe tăng T-54/Type-59 thuộc Quân đoàn 2 (trong đó có xe tăng 843 và 390) đã dẫn đầu mũi thọc sâu tiến vào húc đổ cổng Dinh Độc Lập trưa 30/04/1975.",
    author: "parama",
    sketchfabUrl:
      "https://sketchfab.com/3d-models/russian-t-54a-model-1951-0359275bbdea4bb784b7c5ce16ec6103",
    embedUrl:
      "https://sketchfab.com/models/0359275bbdea4bb784b7c5ce16ec6103/embed",
    previewImage:
      "https://media.sketchfab.com/models/0359275bbdea4bb784b7c5ce16ec6103/thumbnails/86ae7224f779447c8d4727e0b6c6eee9/fd6b0a43eab54e1b93c30ee615adf3a3.jpeg",
    annotations: [
      {
        id: "main-gun-100mm",
        label: "1. Pháo chính 100mm D-10T ổn định nòng",
        detail:
          "Trang bị bầu hút khói đặc trưng gần đầu nòng (biến thể T-54A) và cơ cấu ổn định dọc STP-1 giúp ngắm bắn chính xác khi đang hành tiến.",
        cameraView: { yawDeg: 42, pitchDeg: 18, zoom: 0.68, panRight: 0.22, panUp: 0.08 }
      },
      {
        id: 'cast-turret',
        label: "2. Tháp pháo đúc bán cầu & sao vàng QĐNDVN",
        detail:
          "Thiết kế tháp pháo vòm tròn liền khối dày tới 200mm mặt trước, làm trượt góc đạn chống tăng địch và gắn súng máy phòng không 12,7mm trên nóc.",
        cameraView: { yawDeg: -8, pitchDeg: 26, zoom: 0.56, panRight: 0.0, panUp: 0.08 }
      },
      {
        id: "tracks-fuel",
        label: "3. Bộ xích thép 5 cặp bánh chịu nặng",
        detail:
          "Dải xích rộng 580mm phân tán áp suất lên đất bùn lầy kết hợp thùng dầu phụ phía đuôi xe giúp tăng tầm hành quân cơ động đường dài.",
        cameraView: { yawDeg: -38, pitchDeg: 10, zoom: 0.66, panRight: -0.08, panUp: -0.06 }
      }
    ]
  }
];

if (typeof window !== 'undefined') {
  window.TOURS_DATA = TOURS_DATA;
  window.HOTSPOTS_DATA = HOTSPOTS_DATA;
  window.CLASSROOM_KIT_DATA = CLASSROOM_KIT_DATA;
  window.ARTIFACTS_3D = ARTIFACTS_3D;
}
