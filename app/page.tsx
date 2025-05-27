"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, BarChart3, Dumbbell, Calendar } from "lucide-react"
import WorkoutList from "@/components/workout-list"
import { getWorkouts } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import type { Workout } from "@/lib/types"

export default function Home() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [workoutsByDay, setWorkoutsByDay] = useState<Record<string, Workout[]>>({})

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (user) {
        const data = await getWorkouts()
        setWorkouts(data)

        // Nhóm buổi tập theo ngày trong tuần
        const groupedByDay: Record<string, Workout[]> = {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        }

        data.forEach((workout) => {
          const date = new Date(workout.date)
          const day = date.getDay() // 0 = Chủ nhật, 1 = Thứ hai, ...

          // Chuyển đổi số ngày sang key
          const dayKey = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][day]

          if (groupedByDay[dayKey]) {
            groupedByDay[dayKey].push(workout)
          }
        })

        setWorkoutsByDay(groupedByDay)
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [user])

  // Tính toán thống kê
  const currentMonth = new Date().getMonth()
  const workoutsThisMonth = workouts.filter((w) => new Date(w.date).getMonth() === currentMonth)
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0)
  const totalSets = workouts.reduce((sum, workout) => sum + workout.totalSets, 0)

  // Tính số ngày liên tiếp
  const calculateStreak = () => {
    if (workouts.length === 0) return 0

    const sortedDates = workouts
      .map((w) => new Date(w.date).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a) // Sắp xếp giảm dần
      .filter((date, index, self) => self.indexOf(date) === index) // Loại bỏ trùng lặp

    let streak = 1
    const today = new Date().setHours(0, 0, 0, 0)
    const yesterday = today - 86400000 // 24 giờ tính bằng ms

    // Nếu không tập hôm nay, kiểm tra hôm qua
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0
    }

    // Đếm số ngày liên tiếp
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = sortedDates[i]
      const next = sortedDates[i + 1]

      if (current - next === 86400000) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  // Tạo lịch tập luyện từ dữ liệu thực tế
  const renderWorkoutSchedule = () => {
    // Tính toán ngày trong tuần hiện tại
    const getCurrentWeekDates = () => {
      const today = new Date()
      const currentDay = today.getDay() // 0 = Chủ nhật, 1 = Thứ hai, ...
      const monday = new Date(today)

      // Tính ngày thứ hai của tuần hiện tại
      const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1
      monday.setDate(today.getDate() - daysFromMonday)

      const weekDates = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        weekDates.push(date)
      }

      return weekDates
    }

    const weekDates = getCurrentWeekDates()

    const days = [
      { key: "monday", label: "Thứ Hai", dateIndex: 0 },
      { key: "tuesday", label: "Thứ Ba", dateIndex: 1 },
      { key: "wednesday", label: "Thứ Tư", dateIndex: 2 },
      { key: "thursday", label: "Thứ Năm", dateIndex: 3 },
      { key: "friday", label: "Thứ Sáu", dateIndex: 4 },
      { key: "saturday", label: "Thứ Bảy", dateIndex: 5 },
      { key: "sunday", label: "Chủ Nhật", dateIndex: 6 },
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {days.map((day) => {
          const dayWorkouts = workoutsByDay[day.key] || []
          const mostFrequentCategory = getMostFrequentCategory(dayWorkouts)

          return (
            <div key={day.key} className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-1">
                {day.label} {mostFrequentCategory ? `- ${mostFrequentCategory}` : ""}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {weekDates[day.dateIndex].toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              {dayWorkouts.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {getCommonExercises(dayWorkouts).map((exercise, index) => (
                    <li key={index}>
                      • {exercise.name} ({exercise.sets} sets)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Không có buổi tập</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Lấy danh mục phổ biến nhất cho một ngày
  const getMostFrequentCategory = (dayWorkouts: Workout[]): string | null => {
    if (dayWorkouts.length === 0) return null

    const categories: Record<string, number> = {}
    dayWorkouts.forEach((workout) => {
      categories[workout.category] = (categories[workout.category] || 0) + 1
    })

    let maxCategory = null
    let maxCount = 0

    Object.entries(categories).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxCategory = category
      }
    })

    return maxCategory
  }

  // Lấy các bài tập phổ biến cho một ngày
  const getCommonExercises = (dayWorkouts: Workout[]): { name: string; sets: number }[] => {
    if (dayWorkouts.length === 0) return []

    // Đếm số lần xuất hiện của mỗi bài tập
    const exerciseCounts: Record<string, { count: number; totalSets: number }> = {}

    dayWorkouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (!exerciseCounts[exercise.name]) {
          exerciseCounts[exercise.name] = { count: 0, totalSets: 0 }
        }
        exerciseCounts[exercise.name].count += 1
        exerciseCounts[exercise.name].totalSets += exercise.sets.length
      })
    })

    // Chuyển đổi thành mảng và sắp xếp theo số lần xuất hiện
    const sortedExercises = Object.entries(exerciseCounts)
      .map(([name, { count, totalSets }]) => ({
        name,
        count,
        sets: Math.round(totalSets / count), // Số set trung bình
      }))
      .sort((a, b) => b.count - a.count)

    // Trả về tối đa 5 bài tập phổ biến nhất
    return sortedExercises.slice(0, 5).map(({ name, sets }) => ({ name, sets }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Theo dõi tập Gym</h1>
        <p className="text-muted-foreground">Theo dõi quá trình tập luyện của bạn</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Buổi tập gần đây</h2>
            <Link href="/workouts">
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </div>
          <WorkoutList workouts={workouts} limit={3} loading={loading} />
        </div>

        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Thống kê</h2>
            <Link href="/stats">
              <Button variant="ghost" size="sm">
                Chi tiết
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{workoutsThisMonth.length}</p>
              <p className="text-sm text-muted-foreground">Buổi tập tháng này</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{totalExercises}</p>
              <p className="text-sm text-muted-foreground">Tổng số bài tập</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{totalSets}</p>
              <p className="text-sm text-muted-foreground">Tổng số set</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{calculateStreak()}</p>
              <p className="text-sm text-muted-foreground">Ngày liên tiếp</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link href="/workouts/new" className="flex-1">
          <Button className="w-full" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Thêm buổi tập mới
          </Button>
        </Link>
        <Link href="/exercises" className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            <Dumbbell className="mr-2 h-5 w-5" />
            Thư viện bài tập
          </Button>
        </Link>
        <Link href="/stats" className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            <BarChart3 className="mr-2 h-5 w-5" />
            Tiến trình
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Lịch tập luyện</h2>
          <Link href="/calendar">
            <Button variant="ghost" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Xem lịch đầy đủ
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Đang tải lịch tập luyện...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chưa có dữ liệu lịch tập luyện. Thêm buổi tập để xây dựng lịch tập.</p>
          </div>
        ) : (
          renderWorkoutSchedule()
        )}
      </div>
    </div>
  )
}
