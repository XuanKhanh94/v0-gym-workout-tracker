import type { Exercise } from "./types"

// Danh sách bài tập từ giáo án tập gym 12 tuần
export const exerciseData: Omit<Exercise, "id">[] = [
  // Nhóm cơ Ngực
  {
    name: "Đẩy ngực ngang với tạ đòn",
    muscleGroup: "Ngực",
    equipment: "Barbell",
    difficulty: "Trung bình",
    description:
      "Bài tập cơ bản cho ngực, vai trước và tay sau. Nằm trên ghế, đẩy tạ đòn lên cao và hạ xuống ngang ngực.",
  },
  {
    name: "Đẩy ngực trên với tạ đơn",
    muscleGroup: "Ngực",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description: "Tập trung vào phần trên của cơ ngực. Nằm trên ghế nghiêng, đẩy tạ đơn lên cao và hạ xuống.",
  },
  {
    name: "Ép ngực trên với tạ đơn",
    muscleGroup: "Ngực",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description: "Tập trung vào phần trên của cơ ngực. Nằm trên ghế nghiêng, ép tạ đơn từ ngoài vào trong.",
  },
  {
    name: "Chống đẩy",
    muscleGroup: "Ngực",
    equipment: "Bodyweight",
    difficulty: "Trung bình",
    description: "Bài tập cơ bản cho ngực, vai và tay sau sử dụng trọng lượng cơ thể.",
  },
  {
    name: "Hít xà song song",
    muscleGroup: "Ngực",
    equipment: "Bodyweight",
    difficulty: "Khó",
    description: "Bài tập tập trung vào ngực dưới và tay sau. Thực hiện trên xà song song, hạ người xuống và đẩy lên.",
  },

  // Nhóm cơ Vai
  {
    name: "Đẩy vai với tạ đơn",
    muscleGroup: "Vai",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description: "Bài tập cơ bản cho vai. Ngồi hoặc đứng, đẩy tạ đơn từ ngang vai lên trên đầu.",
  },
  {
    name: "Giang vai ngang với tạ đơn",
    muscleGroup: "Vai",
    equipment: "Dumbbell",
    difficulty: "Dễ",
    description: "Tập trung vào cơ vai giữa. Đứng thẳng, giang tay ngang vai với tạ đơn.",
  },
  {
    name: "Đẩy vai kiểu Arnold",
    muscleGroup: "Vai",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description: "Bài tập phức hợp cho vai. Bắt đầu với tạ đơn ở vị trí cuốn tay, xoay và đẩy lên trên đầu.",
  },
  {
    name: "Kéo cáp ngược (Face Pull)",
    muscleGroup: "Vai",
    equipment: "Cable",
    difficulty: "Dễ",
    description: "Tập trung vào vai sau và cơ lưng trên. Kéo dây cáp về phía mặt, khuỷu tay cao.",
  },
  {
    name: "Đẩy vai có đà",
    muscleGroup: "Vai",
    equipment: "Barbell",
    difficulty: "Khó",
    description: "Bài tập nâng cao cho vai. Sử dụng lực từ chân để tạo đà đẩy tạ đòn lên trên đầu.",
  },

  // Nhóm cơ Lưng
  {
    name: "Kéo xô ngang",
    muscleGroup: "Lưng",
    equipment: "Cable",
    difficulty: "Trung bình",
    description: "Bài tập cơ bản cho lưng rộng. Kéo thanh xô từ trên cao xuống trước ngực.",
  },
  {
    name: "Kéo tạ đòn kiểu chèo",
    muscleGroup: "Lưng",
    equipment: "Barbell",
    difficulty: "Trung bình",
    description: "Tập trung vào phát triển độ dày của lưng. Cúi người về phía trước và kéo tạ đòn lên phía bụng.",
  },
  {
    name: "Kéo cáp ngồi",
    muscleGroup: "Lưng",
    equipment: "Cable",
    difficulty: "Dễ",
    description: "Bài tập tốt cho người mới bắt đầu tập lưng. Ngồi trên máy và kéo thanh cáp về phía bụng.",
  },
  {
    name: "Hít xà",
    muscleGroup: "Lưng",
    equipment: "Bodyweight",
    difficulty: "Khó",
    description: "Bài tập cơ bản cho lưng và tay trước. Nắm xà ngang và kéo người lên cho đến khi cằm vượt qua xà.",
  },
  {
    name: "Kéo xà có thêm tạ",
    muscleGroup: "Lưng",
    equipment: "Bodyweight",
    difficulty: "Khó",
    description: "Phiên bản nâng cao của hít xà, thêm tạ để tăng cường độ khó.",
  },
  {
    name: "Kéo tạ kiểu T",
    muscleGroup: "Lưng",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description: "Tập trung vào lưng giữa. Cúi người về phía trước và kéo tạ đơn lên tạo hình chữ T với cơ thể.",
  },
  {
    name: "Deadlift",
    muscleGroup: "Lưng",
    equipment: "Barbell",
    difficulty: "Khó",
    description: "Bài tập tổng hợp cho lưng dưới, mông và chân sau. Nâng tạ đòn từ sàn lên đến khi đứng thẳng.",
  },
  {
    name: "Deadlift tay rộng",
    muscleGroup: "Lưng",
    equipment: "Barbell",
    difficulty: "Khó",
    description: "Biến thể của deadlift với tay nắm rộng hơn, tập trung nhiều hơn vào lưng trên.",
  },

  // Nhóm cơ Tay
  {
    name: "Đẩy tay sau bằng cáp (Triceps Pushdown)",
    muscleGroup: "Tay",
    equipment: "Cable",
    difficulty: "Dễ",
    description: "Bài tập cơ bản cho cơ tay sau. Đẩy dây cáp xuống dưới bằng lực từ tay sau.",
  },
  {
    name: "Cuốn tạ đơn",
    muscleGroup: "Tay",
    equipment: "Dumbbell",
    difficulty: "Dễ",
    description: "Bài tập cơ bản cho cơ tay trước. Cuốn tạ đơn lên bằng cách gập khuỷu tay.",
  },
  {
    name: "Cuốn tạ búa",
    muscleGroup: "Tay",
    equipment: "Dumbbell",
    difficulty: "Dễ",
    description: "Biến thể của cuốn tạ đơn với tư thế cầm tạ như cầm búa, tập trung vào cơ cẳng tay và tay trước.",
  },
  {
    name: "Duỗi tay sau với tạ đơn",
    muscleGroup: "Tay",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description: "Tập trung vào cơ tay sau. Nâng tạ đơn lên trên đầu và duỗi cánh tay.",
  },
  {
    name: "Cuốn tạ đòn",
    muscleGroup: "Tay",
    equipment: "Barbell",
    difficulty: "Trung bình",
    description: "Bài tập hiệu quả cho cơ tay trước. Cuốn tạ đòn lên bằng cách gập khuỷu tay.",
  },
  {
    name: "Cuốn tạ đơn cô lập",
    muscleGroup: "Tay",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description:
      "Bài tập tập trung vào cơ tay trước. Thực hiện với một tay tì lên đùi hoặc ghế để cô lập cơ tay trước.",
  },

  // Nhóm cơ Chân
  {
    name: "Squat",
    muscleGroup: "Chân",
    equipment: "Barbell",
    difficulty: "Khó",
    description: "Bài tập cơ bản cho toàn bộ cơ chân và core. Đặt tạ đòn trên vai và ngồi xuống, sau đó đứng lên.",
  },
  {
    name: "Đạp đùi",
    muscleGroup: "Chân",
    equipment: "Machine",
    difficulty: "Dễ",
    description: "Tập trung vào cơ đùi trước. Ngồi trên máy và đạp chân lên.",
  },
  {
    name: "Deadlift Rumani",
    muscleGroup: "Chân",
    equipment: "Barbell",
    difficulty: "Trung bình",
    description: "Tập trung vào cơ đùi sau và mông. Cúi người về phía trước với chân thẳng hoặc hơi cong.",
  },
  {
    name: "Gập chân",
    muscleGroup: "Chân",
    equipment: "Machine",
    difficulty: "Dễ",
    description: "Tập trung vào cơ đùi sau. Nằm sấp trên máy và gập chân lên.",
  },
  {
    name: "Nâng bắp chân",
    muscleGroup: "Chân",
    equipment: "Machine",
    difficulty: "Dễ",
    description: "Tập trung vào cơ bắp chân. Đứng thẳng và nâng gót chân lên.",
  },
  {
    name: "Split Squat (Bulgarian)",
    muscleGroup: "Chân",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description:
      "Bài tập tập trung vào đùi trước và mông. Một chân đặt phía sau trên ghế, chân trước ngồi xuống và đứng lên.",
  },
  {
    name: "Đẩy hông (Hip Thrust)",
    muscleGroup: "Chân",
    equipment: "Barbell",
    difficulty: "Trung bình",
    description: "Tập trung vào cơ mông. Ngồi dựa lưng vào ghế, đặt tạ đòn trên hông và đẩy hông lên.",
  },
  {
    name: "Nâng bắp chân ngồi",
    muscleGroup: "Chân",
    equipment: "Machine",
    difficulty: "Dễ",
    description: "Tập trung vào cơ bắp chân. Ngồi trên máy và nâng mũi chân lên.",
  },
  {
    name: "Squat trước",
    muscleGroup: "Chân",
    equipment: "Barbell",
    difficulty: "Khó",
    description: "Biến thể của squat với tạ đòn đặt phía trước vai. Tập trung nhiều hơn vào đùi trước và core.",
  },
  {
    name: "Đá chân sau kích mông",
    muscleGroup: "Chân",
    equipment: "Machine",
    difficulty: "Dễ",
    description: "Tập trung vào cơ mông. Đứng thẳng và đá chân về phía sau.",
  },

  // Nhóm cơ Bụng
  {
    name: "Plank",
    muscleGroup: "Bụng",
    equipment: "Bodyweight",
    difficulty: "Trung bình",
    description: "Bài tập cơ bản cho core. Giữ tư thế chống đẩy với khuỷu tay chạm sàn.",
  },
  {
    name: "Plank nghiêng",
    muscleGroup: "Bụng",
    equipment: "Bodyweight",
    difficulty: "Trung bình",
    description: "Biến thể của plank, tập trung vào cơ bụng bên. Giữ tư thế với một khuỷu tay và một bên cơ thể.",
  },
  {
    name: "Lăn bụng với bánh xe",
    muscleGroup: "Bụng",
    equipment: "Other",
    difficulty: "Khó",
    description: "Bài tập nâng cao cho cơ bụng. Quỳ trên sàn và lăn bánh xe về phía trước, sau đó kéo lại.",
  },

  // Nhóm cơ Toàn thân
  {
    name: "Clean & Press",
    muscleGroup: "Toàn thân",
    equipment: "Barbell",
    difficulty: "Khó",
    description: "Bài tập tổng hợp cho toàn thân. Kéo tạ đòn từ sàn lên vai, sau đó đẩy lên trên đầu.",
  },
  {
    name: "Đi bộ nắm tạ (Farmer's Walk)",
    muscleGroup: "Toàn thân",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description: "Bài tập đơn giản nhưng hiệu quả cho toàn thân. Cầm tạ nặng và đi bộ một quãng đường.",
  },
]
