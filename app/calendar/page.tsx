"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, PlusCircle } from "lucide-react"
import { getWorkouts } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import type { Workout } from "@/lib/types"

export default function CalendarPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (user) {
        const data = await getWorkouts()
        setWorkouts(data)
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [user])

  // Lấy các ngày trong tháng hiện tại
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Chuyển đến tháng trước
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  // Chuyển đến tháng sau
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  // Kiểm tra xem ngày có buổi tập không
  const hasWorkout = (date: Date) => {
    return workouts.some((workout) => {
      const workoutDate = new Date(workout.date)
      return isSameDay(workoutDate, date)
    })
  }

  // Lấy số buổi tập trong ngày
  const getWorkoutCount = (date: Date) => {
    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.date)
      return isSameDay(workoutDate, date)
    }).length
  }

  // Xử lý khi chọn ngày
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)

    // Lấy các buổi tập trong ngày đã chọn
    const workoutsOnDate = workouts.filter((workout) => {
      const workoutDate = new Date(workout.date)
      return isSameDay(workoutDate, date)
    })

    setSelectedWorkouts(workoutsOnDate)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Lịch tập luyện</h1>
        <p className="text-muted-foreground">Xem lịch tập luyện của bạn theo tháng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">{format(currentMonth, "MMMM yyyy", { locale: vi })}</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date())}>
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Đang tải lịch tập luyện...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, index) => (
                      <div key={index} className="text-center font-medium text-sm py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {/* Thêm các ô trống cho ngày đầu tháng */}
                    {Array.from({ length: daysInMonth[0].getDay() }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square p-1"></div>
                    ))}

                    {/* Hiển thị các ngày trong tháng */}
                    {daysInMonth.map((day) => {
                      const isToday = isSameDay(day, new Date())
                      const isSelected = selectedDate && isSameDay(day, selectedDate)
                      const workoutCount = getWorkoutCount(day)

                      return (
                        <div
                          key={day.toString()}
                          className={`
                            aspect-square p-1 relative
                            ${isToday ? "bg-primary/10 rounded-md" : ""}
                            ${isSelected ? "ring-2 ring-primary rounded-md" : ""}
                          `}
                          onClick={() => handleDateClick(day)}
                        >
                          <div
                            className={`
                            h-full w-full flex flex-col items-center justify-center rounded-md
                            ${hasWorkout(day) ? "bg-muted cursor-pointer hover:bg-muted/80" : "cursor-pointer hover:bg-muted/50"}
                          `}
                          >
                            <span className={`text-sm ${isToday ? "font-bold" : ""}`}>{format(day, "d")}</span>
                            {workoutCount > 0 && (
                              <Badge variant="outline" className="mt-1 text-xs px-1.5 py-0">
                                {workoutCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                {selectedDate ? format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi }) : "Chọn ngày để xem chi tiết"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {selectedWorkouts.map((workout) => (
                      <Link key={workout.id} href={`/workouts/${workout.id}`}>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{workout.name}</h3>
                            <Badge>{workout.category}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">{workout.exercises.length} bài tập</Badge>
                            <Badge variant="outline">{workout.totalSets} sets</Badge>
                            <Badge variant="outline">{workout.duration} phút</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Không có buổi tập nào vào ngày này</p>
                    <Link href="/workouts/new">
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Thêm buổi tập
                      </Button>
                    </Link>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chọn một ngày từ lịch để xem chi tiết buổi tập</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
