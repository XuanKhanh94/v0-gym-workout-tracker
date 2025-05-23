export interface Workout {
  id: string
  name: string
  date: string
  category: string
  exercises: {
    name: string
    sets: {
      reps: string
      weight: string
    }[]
  }[]
  totalSets: number
  duration: number
  notes?: string
}

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  difficulty: string
  description: string
}

// Thêm các kiểu dữ liệu mới cho chương trình tập
export interface WorkoutProgram {
  id: string
  name: string
  description: string
  duration: number // số tuần
  level: string // Beginner, Intermediate, Advanced
  goal: string // Tăng cân, Giảm cân, Tăng sức mạnh, etc.
  phases: WorkoutPhase[]
}

export interface WorkoutPhase {
  id: string
  name: string
  weeks: number
  workoutDays: WorkoutDay[]
}

export interface WorkoutDay {
  id: string
  name: string
  exercises: WorkoutExercise[]
}

export interface WorkoutExercise {
  name: string
  sets: number
  reps: number
  duration?: number // thời gian tính bằng giây (nếu có)
  note?: string
}

// Thêm vào file types.ts
export interface UserRole {
  id: string
  uid: string
  email: string
  displayName?: string
  role: "admin" | "user"
  createdAt: any
  updatedAt?: any
}
