import type { Exercise, WorkoutProgram } from "./types"

// Dữ liệu bài tập từ giáo án tập gym 12 tuần
export const gymProgram12Weeks: WorkoutProgram = {
  id: "12-week-program",
  name: "Giáo án tập gym 12 tuần tăng cân cho người gầy",
  description: "Chương trình tập gym 12 tuần giúp tăng cân, ưu tiên tăng cơ nạc cho người gầy",
  duration: 12, // 12 tuần
  level: "Beginner", // Dành cho người mới
  goal: "Tăng cân",
  phases: [
    {
      id: "phase-1",
      name: "Tuần 1-4: Làm quen & xây nền tảng",
      weeks: 4,
      workoutDays: [
        {
          id: "day-1",
          name: "Buổi 1 - Đẩy (Ngực, Vai, Tay sau)",
          exercises: [
            { name: "Đẩy ngực ngang với tạ đòn", sets: 4, reps: 10 },
            { name: "Đẩy ngực trên với tạ đơn", sets: 3, reps: 10 },
            { name: "Đẩy vai với tạ đơn", sets: 3, reps: 10 },
            { name: "Giang vai ngang với tạ đơn", sets: 3, reps: 12 },
            { name: "Đẩy tay sau bằng cáp (Triceps Pushdown)", sets: 3, reps: 12 },
          ],
        },
        {
          id: "day-2",
          name: "Buổi 2 - Kéo (Lưng, Tay trước)",
          exercises: [
            { name: "Kéo xô ngang", sets: 4, reps: 10 },
            { name: "Kéo tạ đòn kiểu chèo", sets: 3, reps: 10 },
            { name: "Kéo cáp ngồi", sets: 3, reps: 10 },
            { name: "Cuốn tạ đơn", sets: 3, reps: 12 },
            { name: "Cuốn tạ búa", sets: 3, reps: 12 },
          ],
        },
        {
          id: "day-3",
          name: "Buổi 3 - Nghỉ hoặc cardio nhẹ",
          exercises: [
            { name: "Đi bộ nhanh", sets: 1, reps: 1, duration: 30, note: "30 phút đi bộ nhanh hoặc nghỉ hoàn toàn" },
          ],
        },
        {
          id: "day-4",
          name: "Buổi 4 - Chân, Mông",
          exercises: [
            { name: "Squat", sets: 4, reps: 10 },
            { name: "Đạp đùi", sets: 3, reps: 12 },
            { name: "Deadlift Rumani", sets: 3, reps: 10 },
            { name: "Gập chân", sets: 3, reps: 12 },
            { name: "Nâng bắp chân", sets: 3, reps: 15 },
          ],
        },
        {
          id: "day-5",
          name: "Buổi 5 - Toàn thân",
          exercises: [
            { name: "Deadlift", sets: 4, reps: 6 },
            { name: "Hít xà", sets: 3, reps: 0, note: "Tối đa số lần có thể" },
            { name: "Chống đẩy", sets: 3, reps: 0, note: "Tối đa số lần có thể" },
            { name: "Plank", sets: 3, reps: 1, duration: 60, note: "30-60 giây mỗi hiệp" },
          ],
        },
      ],
    },
    {
      id: "phase-2",
      name: "Tuần 5-8: Tăng cường sức mạnh",
      weeks: 4,
      workoutDays: [
        {
          id: "day-1",
          name: "Buổi 1 - Đẩy",
          exercises: [
            { name: "Đẩy ngực ngang với tạ đòn", sets: 4, reps: 8 },
            { name: "Đẩy ngực trên với tạ đòn", sets: 3, reps: 8 },
            { name: "Đẩy vai kiểu Arnold", sets: 3, reps: 10 },
            { name: "Duỗi tay sau với tạ đơn", sets: 3, reps: 10 },
          ],
        },
        {
          id: "day-2",
          name: "Buổi 2 - Kéo",
          exercises: [
            { name: "Hít xà", sets: 4, reps: 0, note: "Tối đa số lần có thể" },
            { name: "Kéo tạ đòn kiểu chèo", sets: 4, reps: 8 },
            { name: "Kéo cáp ngược (Face Pull)", sets: 3, reps: 12 },
            { name: "Cuốn tạ đòn", sets: 3, reps: 10 },
          ],
        },
        {
          id: "day-3",
          name: "Buổi 3 - Nghỉ hoặc cardio nhẹ",
          exercises: [{ name: "Đi bộ nhẹ", sets: 1, reps: 1, duration: 30, note: "20-30 phút đi bộ nhẹ hoặc tập thở" }],
        },
        {
          id: "day-4",
          name: "Buổi 4 - Chân",
          exercises: [
            { name: "Squat", sets: 4, reps: 8 },
            { name: "Split Squat (Bulgarian)", sets: 3, reps: 10, note: "10 lần mỗi chân" },
            { name: "Đẩy hông (Hip Thrust)", sets: 3, reps: 12 },
            { name: "Nâng bắp chân", sets: 3, reps: 15 },
          ],
        },
        {
          id: "day-5",
          name: "Buổi 5 - Toàn thân",
          exercises: [
            { name: "Clean & Press", sets: 3, reps: 6 },
            { name: "Deadlift", sets: 4, reps: 5 },
            { name: "Chống đẩy", sets: 3, reps: 0, note: "Tối đa số lần có thể" },
            { name: "Plank nghiêng", sets: 3, reps: 1, duration: 30, note: "30 giây mỗi bên" },
          ],
        },
      ],
    },
    {
      id: "phase-3",
      name: "Tuần 9-12: Phát triển cơ tối đa (Hypertrophy)",
      weeks: 4,
      workoutDays: [
        {
          id: "day-1",
          name: "Buổi 1 - Đẩy (Ngực, Vai, Tay sau)",
          exercises: [
            { name: "Đẩy ngực ngang với tạ đòn", sets: 5, reps: 6 },
            { name: "Ép ngực trên với tạ đơn", sets: 4, reps: 12 },
            { name: "Giang vai ngang", sets: 4, reps: 15 },
            { name: "Hít xà song song", sets: 3, reps: 0, note: "Tối đa số lần có thể" },
          ],
        },
        {
          id: "day-2",
          name: "Buổi 2 - Kéo (Lưng, Tay trước)",
          exercises: [
            { name: "Kéo xà có thêm tạ", sets: 4, reps: 6 },
            { name: "Kéo tạ kiểu T", sets: 4, reps: 10 },
            { name: "Cuốn tạ đòn", sets: 3, reps: 10 },
            { name: "Cuốn tạ đơn cô lập", sets: 3, reps: 12 },
          ],
        },
        {
          id: "day-3",
          name: "Buổi 3 - Nghỉ hoặc yoga nhẹ",
          exercises: [{ name: "Yoga nhẹ", sets: 1, reps: 1, duration: 30, note: "Tập thở sâu, giãn cơ, ngủ đủ" }],
        },
        {
          id: "day-4",
          name: "Buổi 4 - Chân, Mông",
          exercises: [
            { name: "Squat trước", sets: 4, reps: 8 },
            { name: "Deadlift Rumani", sets: 4, reps: 10 },
            { name: "Đá chân sau kích mông", sets: 3, reps: 15 },
            { name: "Nâng bắp chân ngồi", sets: 3, reps: 20 },
          ],
        },
        {
          id: "day-5",
          name: "Buổi 5 - Toàn thân",
          exercises: [
            { name: "Deadlift tay rộng", sets: 3, reps: 5 },
            { name: "Đẩy vai có đà", sets: 3, reps: 6 },
            { name: "Đi bộ nắm tạ (Farmer's Walk)", sets: 3, reps: 1, note: "20m mỗi hiệp" },
            { name: "Lăn bụng với bánh xe", sets: 3, reps: 12 },
          ],
        },
      ],
    },
  ],
}

// Danh sách tất cả các bài tập từ giáo án
export const extractExercisesFromProgram = (program: WorkoutProgram): Exercise[] => {
  const exerciseMap = new Map<string, Exercise>()

  program.phases.forEach((phase) => {
    phase.workoutDays.forEach((day) => {
      day.exercises.forEach((exercise) => {
        if (!exerciseMap.has(exercise.name)) {
          // Xác định nhóm cơ dựa trên tên buổi tập
          let muscleGroup = "Khác"
          if (day.name.includes("Đẩy") || day.name.includes("Ngực") || day.name.includes("Vai")) {
            if (exercise.name.includes("ngực")) muscleGroup = "Ngực"
            else if (exercise.name.includes("vai")) muscleGroup = "Vai"
            else if (exercise.name.includes("tay sau") || exercise.name.includes("Triceps")) muscleGroup = "Tay"
            else muscleGroup = "Ngực"
          } else if (day.name.includes("Kéo") || day.name.includes("Lưng")) {
            if (exercise.name.includes("lưng") || exercise.name.includes("Kéo")) muscleGroup = "Lưng"
            else if (exercise.name.includes("tay") || exercise.name.includes("Cuốn")) muscleGroup = "Tay"
            else muscleGroup = "Lưng"
          } else if (day.name.includes("Chân") || day.name.includes("Mông")) {
            muscleGroup = "Chân"
          } else if (day.name.includes("Toàn thân")) {
            if (exercise.name.includes("Deadlift")) muscleGroup = "Lưng"
            else if (exercise.name.includes("Plank") || exercise.name.includes("bụng")) muscleGroup = "Bụng"
            else muscleGroup = "Toàn thân"
          }

          // Xác định thiết bị
          let equipment = "Other"
          if (exercise.name.includes("tạ đòn")) equipment = "Barbell"
          else if (exercise.name.includes("tạ đơn") || exercise.name.includes("tạ búa")) equipment = "Dumbbell"
          else if (exercise.name.includes("cáp")) equipment = "Cable"
          else if (exercise.name.includes("máy")) equipment = "Machine"
          else if (
            exercise.name.includes("Hít xà") ||
            exercise.name.includes("Chống đẩy") ||
            exercise.name.includes("Plank")
          )
            equipment = "Bodyweight"

          // Xác định độ khó
          let difficulty = "Trung bình"
          if (
            exercise.name.includes("Deadlift") ||
            exercise.name.includes("Squat") ||
            exercise.name.includes("Clean")
          ) {
            difficulty = "Khó"
          } else if (
            exercise.name.includes("Giang") ||
            exercise.name.includes("Cuốn") ||
            exercise.name.includes("Nâng bắp chân")
          ) {
            difficulty = "Dễ"
          }

          // Tạo mô tả
          const description = `Bài tập ${muscleGroup.toLowerCase()} sử dụng ${equipment.toLowerCase()}.`

          exerciseMap.set(exercise.name, {
            id: `auto-${exerciseMap.size + 1}`,
            name: exercise.name,
            muscleGroup,
            equipment,
            difficulty,
            description,
          })
        }
      })
    })
  })

  return Array.from(exerciseMap.values())
}

// Danh sách tất cả các bài tập từ giáo án
export const exercisesFromProgram = extractExercisesFromProgram(gymProgram12Weeks)
