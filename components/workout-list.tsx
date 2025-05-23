"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow, isValid, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { Dumbbell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Workout } from "@/lib/types"

interface WorkoutListProps {
  workouts: Workout[]
  limit?: number
  loading?: boolean
}

// Hàm helper để parse date an toàn
function safeParseDate(dateInput: any): Date {
  if (!dateInput) {
    return new Date()
  }

  // Nếu đã là Date object
  if (dateInput instanceof Date) {
    return isValid(dateInput) ? dateInput : new Date()
  }

  // Nếu là string
  if (typeof dateInput === "string") {
    try {
      const parsed = parseISO(dateInput)
      return isValid(parsed) ? parsed : new Date()
    } catch (error) {
      console.error("Lỗi khi parse date string:", error)
      return new Date()
    }
  }

  // Nếu là Firestore Timestamp
  if (dateInput && typeof dateInput.toDate === "function") {
    try {
      const date = dateInput.toDate()
      return isValid(date) ? date : new Date()
    } catch (error) {
      console.error("Lỗi khi chuyển đổi Firestore timestamp:", error)
      return new Date()
    }
  }

  // Nếu là number (timestamp)
  if (typeof dateInput === "number") {
    try {
      const date = new Date(dateInput)
      return isValid(date) ? date : new Date()
    } catch (error) {
      console.error("Lỗi khi chuyển đổi timestamp:", error)
      return new Date()
    }
  }

  // Fallback
  console.warn("Không thể parse date, sử dụng thời gian hiện tại:", dateInput)
  return new Date()
}

export default function WorkoutList({ workouts, limit, loading = false }: WorkoutListProps) {
  const [displayWorkouts, setDisplayWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    if (limit) {
      setDisplayWorkouts(workouts.slice(0, limit))
    } else {
      setDisplayWorkouts(workouts)
    }
  }, [workouts, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (displayWorkouts.length === 0) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Chưa có buổi tập nào</h3>
        <p className="text-muted-foreground">Bắt đầu thêm buổi tập của bạn</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayWorkouts.map((workout) => {
        const workoutDate = safeParseDate(workout.date)

        return (
          <Link key={workout.id} href={`/workouts/${workout.id}`}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{workout.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(workoutDate, { addSuffix: true, locale: vi })}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{workout.exercises?.length || 0} bài tập</Badge>
                      <Badge variant="outline">{workout.totalSets || 0} sets</Badge>
                    </div>
                  </div>
                  <Badge>{workout.category}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
