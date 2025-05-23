"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Dumbbell, Edit, Trash2 } from "lucide-react"
import { doc, getDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import type { Exercise } from "@/lib/types"

export default function ExerciseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchExercise = async () => {
      if (!params.id) return

      try {
        const exerciseRef = doc(db, "exercises", params.id as string)
        const exerciseSnap = await getDoc(exerciseRef)

        if (exerciseSnap.exists()) {
          setExercise({
            id: exerciseSnap.id,
            ...exerciseSnap.data(),
          } as Exercise)
        } else {
          router.push("/exercises")
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin bài tập:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [params.id, router])

  const handleDelete = async () => {
    if (!exercise) return

    if (confirm("Bạn có chắc chắn muốn xóa bài tập này?")) {
      setDeleting(true)
      try {
        await deleteDoc(doc(db, "exercises", exercise.id))
        toast({
          title: "Thành công",
          description: "Đã xóa bài tập.",
        })
        router.push("/exercises")
      } catch (error) {
        console.error("Lỗi khi xóa bài tập:", error)
        toast({
          title: "Lỗi",
          description: "Đã xảy ra lỗi khi xóa bài tập. Vui lòng thử lại.",
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

  if (!exercise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Không tìm thấy bài tập</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/exercises">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6" />
              <h1 className="text-3xl font-bold">{exercise.name}</h1>
            </div>
            <div className="flex gap-2">
              <Link href={`/exercises/${exercise.id}/edit`}>
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
            <Badge>{exercise.muscleGroup}</Badge>
            <Badge variant="outline">{exercise.equipment}</Badge>
            <Badge variant="secondary">{exercise.difficulty}</Badge>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{exercise.description || "Không có mô tả chi tiết."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chưa có hướng dẫn chi tiết cho bài tập này.</p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-80">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bài tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Nhóm cơ</h3>
                <p>{exercise.muscleGroup}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Thiết bị</h3>
                <p>{exercise.equipment}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Độ khó</h3>
                <p>{exercise.difficulty}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Khuyến nghị</h3>
                <p>3-4 set, 8-12 reps</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
