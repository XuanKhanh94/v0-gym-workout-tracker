"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format, isValid, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Edit, Trash2, Calendar, Clock } from "lucide-react"
import { getWorkout, deleteWorkout } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"
import type { Workout } from "@/lib/types"

// Hàm helper để parse date an toàn
function safeParseDate(dateInput: any): Date {
  if (!dateInput) {
    return new Date()
  }

  if (dateInput instanceof Date) {
    return isValid(dateInput) ? dateInput : new Date()
  }

  if (typeof dateInput === "string") {
    try {
      const parsed = parseISO(dateInput)
      return isValid(parsed) ? parsed : new Date()
    } catch (error) {
      console.error("Lỗi khi parse date string:", error)
      return new Date()
    }
  }

  if (dateInput && typeof dateInput.toDate === "function") {
    try {
      const date = dateInput.toDate()
      return isValid(date) ? date : new Date()
    } catch (error) {
      console.error("Lỗi khi chuyển đổi Firestore timestamp:", error)
      return new Date()
    }
  }

  if (typeof dateInput === "number") {
    try {
      const date = new Date(dateInput)
      return isValid(date) ? date : new Date()
    } catch (error) {
      console.error("Lỗi khi chuyển đổi timestamp:", error)
      return new Date()
    }
  }

  console.warn("Không thể parse date, sử dụng thời gian hiện tại:", dateInput)
  return new Date()
}

export default function WorkoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchWorkout = async () => {
      if (params.id) {
        const data = await getWorkout(params.id as string)
        if (data) {
          setWorkout(data)
        } else {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy buổi tập.",
            variant: "destructive",
          })
          router.push("/workouts")
        }
        setLoading(false)
      }
    }

    fetchWorkout()
  }, [params.id, router, toast])

  const handleDelete = async () => {
    if (!workout) return

    if (confirm("Bạn có chắc chắn muốn xóa buổi tập này?")) {
      setDeleting(true)
      try {
        const success = await deleteWorkout(workout.id)
        if (success) {
          toast({
            title: "Thành công",
            description: "Đã xóa buổi tập.",
          })
          router.push("/workouts")
        } else {
          throw new Error("Không thể xóa buổi tập")
        }
      } catch (error) {
        console.error("Lỗi khi xóa buổi tập:", error)
        toast({
          title: "Lỗi",
          description: "Đã xảy ra lỗi khi xóa buổi tập. Vui lòng thử lại.",
          variant: "destructive",
        })
      } finally {
        setDeleting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Không tìm thấy buổi tập</div>
      </div>
    )
  }

  const workoutDate = safeParseDate(workout.date)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/workouts">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{workout.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Calendar className="h-4 w-4" />
            <span>{format(workoutDate, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{format(workoutDate, "HH:mm", { locale: vi })}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/workouts/${workout.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            {deleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge>{workout.category}</Badge>
        <Badge variant="outline">{workout.exercises?.length || 0} bài tập</Badge>
        <Badge variant="outline">{workout.totalSets || 0} sets</Badge>
        <Badge variant="outline">{workout.duration || 0} phút</Badge>
      </div>

      {workout.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-semibold mb-4">Bài tập</h2>
      <div className="space-y-4">
        {workout.exercises?.map((exercise, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle>{exercise.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 font-medium text-sm mb-2">
                <div className="col-span-1">Set</div>
                <div className="col-span-5">Reps</div>
                <div className="col-span-6">Trọng lượng</div>
              </div>
              {exercise.sets?.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-12 py-2 border-t text-sm">
                  <div className="col-span-1">{setIndex + 1}</div>
                  <div className="col-span-5">{set.reps}</div>
                  <div className="col-span-6">{set.weight} kg</div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
