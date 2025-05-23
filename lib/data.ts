import type { Workout, Exercise } from "./types"

export const workouts: Workout[] = [
  {
    id: "1",
    name: "Ngày tập ngực",
    date: "2025-05-20T08:30:00Z",
    category: "Ngực",
    exercises: [
      {
        name: "Bench Press",
        sets: [
          { reps: "10", weight: "60" },
          { reps: "8", weight: "70" },
          { reps: "6", weight: "80" },
          { reps: "6", weight: "80" },
        ],
      },
      {
        name: "Incline Dumbbell Press",
        sets: [
          { reps: "12", weight: "20" },
          { reps: "10", weight: "22.5" },
          { reps: "8", weight: "25" },
        ],
      },
      {
        name: "Cable Fly",
        sets: [
          { reps: "15", weight: "15" },
          { reps: "12", weight: "17.5" },
          { reps: "10", weight: "20" },
        ],
      },
    ],
    totalSets: 10,
    duration: 65,
    notes: "Cảm thấy khỏe, tăng được trọng lượng ở bench press.",
  },
  {
    id: "2",
    name: "Ngày tập lưng",
    date: "2025-05-18T17:15:00Z",
    category: "Lưng",
    exercises: [
      {
        name: "Pull-ups",
        sets: [
          { reps: "8", weight: "0" },
          { reps: "7", weight: "0" },
          { reps: "6", weight: "0" },
          { reps: "5", weight: "0" },
        ],
      },
      {
        name: "Barbell Row",
        sets: [
          { reps: "12", weight: "60" },
          { reps: "10", weight: "70" },
          { reps: "8", weight: "80" },
        ],
      },
      {
        name: "Lat Pulldown",
        sets: [
          { reps: "12", weight: "50" },
          { reps: "10", weight: "60" },
          { reps: "8", weight: "70" },
        ],
      },
    ],
    totalSets: 10,
    duration: 70,
    notes: "Tập trung vào kỹ thuật kéo lat pulldown.",
  },
  {
    id: "3",
    name: "Ngày tập chân",
    date: "2025-05-16T09:00:00Z",
    category: "Chân",
    exercises: [
      {
        name: "Squat",
        sets: [
          { reps: "10", weight: "80" },
          { reps: "8", weight: "100" },
          { reps: "6", weight: "120" },
          { reps: "6", weight: "120" },
        ],
      },
      {
        name: "Leg Press",
        sets: [
          { reps: "12", weight: "120" },
          { reps: "10", weight: "140" },
          { reps: "8", weight: "160" },
        ],
      },
      {
        name: "Leg Extension",
        sets: [
          { reps: "15", weight: "40" },
          { reps: "12", weight: "45" },
          { reps: "10", weight: "50" },
        ],
      },
      {
        name: "Leg Curl",
        sets: [
          { reps: "15", weight: "35" },
          { reps: "12", weight: "40" },
          { reps: "10", weight: "45" },
        ],
      },
    ],
    totalSets: 13,
    duration: 80,
    notes: "Buổi tập nặng, cần nghỉ ngơi đầy đủ.",
  },
]

export const exerciseLibrary: Exercise[] = [
  {
    id: "1",
    name: "Bench Press",
    muscleGroup: "Ngực",
    equipment: "Barbell",
    difficulty: "Trung bình",
    description: "Bài tập cơ bản cho ngực, vai trước và tay sau.",
  },
  {
    id: "2",
    name: "Incline Dumbbell Press",
    muscleGroup: "Ngực",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description: "Tập trung vào phần trên của cơ ngực.",
  },
  {
    id: "3",
    name: "Cable Fly",
    muscleGroup: "Ngực",
    equipment: "Cable",
    difficulty: "Dễ",
    description: "Tập trung vào sự co giãn và co cơ ngực.",
  },
  {
    id: "4",
    name: "Pull-ups",
    muscleGroup: "Lưng",
    equipment: "Bodyweight",
    difficulty: "Khó",
    description: "Bài tập cơ bản cho lưng và tay trước.",
  },
  {
    id: "5",
    name: "Barbell Row",
    muscleGroup: "Lưng",
    equipment: "Barbell",
    difficulty: "Trung bình",
    description: "Tập trung vào phát triển độ dày của lưng.",
  },
  {
    id: "6",
    name: "Lat Pulldown",
    muscleGroup: "Lưng",
    equipment: "Cable",
    difficulty: "Dễ",
    description: "Bài tập tốt cho người mới bắt đầu tập lưng.",
  },
  {
    id: "7",
    name: "Squat",
    muscleGroup: "Chân",
    equipment: "Barbell",
    difficulty: "Khó",
    description: "Bài tập cơ bản cho toàn bộ cơ chân và core.",
  },
  {
    id: "8",
    name: "Leg Press",
    muscleGroup: "Chân",
    equipment: "Machine",
    difficulty: "Trung bình",
    description: "Tập trung vào đùi trước và mông.",
  },
  {
    id: "9",
    name: "Leg Extension",
    muscleGroup: "Chân",
    equipment: "Machine",
    difficulty: "Dễ",
    description: "Tập trung vào cơ đùi trước.",
  },
  {
    id: "10",
    name: "Leg Curl",
    muscleGroup: "Chân",
    equipment: "Machine",
    difficulty: "Dễ",
    description: "Tập trung vào cơ đùi sau.",
  },
  {
    id: "11",
    name: "Shoulder Press",
    muscleGroup: "Vai",
    equipment: "Dumbbell",
    difficulty: "Trung bình",
    description: "Bài tập cơ bản cho vai.",
  },
  {
    id: "12",
    name: "Lateral Raise",
    muscleGroup: "Vai",
    equipment: "Dumbbell",
    difficulty: "Dễ",
    description: "Tập trung vào cơ vai giữa.",
  },
  {
    id: "13",
    name: "Bicep Curl",
    muscleGroup: "Tay",
    equipment: "Dumbbell",
    difficulty: "Dễ",
    description: "Bài tập cơ bản cho cơ tay trước.",
  },
  {
    id: "14",
    name: "Tricep Extension",
    muscleGroup: "Tay",
    equipment: "Cable",
    difficulty: "Dễ",
    description: "Bài tập cơ bản cho cơ tay sau.",
  },
  {
    id: "15",
    name: "Deadlift",
    muscleGroup: "Lưng",
    equipment: "Barbell",
    difficulty: "Khó",
    description: "Bài tập tổng hợp cho lưng dưới, mông và chân sau.",
  },
]
