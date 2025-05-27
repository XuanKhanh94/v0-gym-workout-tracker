"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, PlusCircle, Dumbbell, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getExerciseLibrary } from "@/lib/firebase-service"
import type { Exercise } from "@/lib/types"

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Đang tải danh sách bài tập...")

        const data = await getExerciseLibrary()
        console.log("Đã tải được", data.length, "bài tập:", data)

        setExercises(data)
      } catch (error) {
        console.error("Lỗi khi tải bài tập:", error)
        setError("Không thể tải danh sách bài tập. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [])

  // Lọc bài tập theo từ khóa tìm kiếm
  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Nhóm bài tập theo nhóm cơ
  const exercisesByMuscleGroup: Record<string, Exercise[]> = {}

  filteredExercises.forEach((exercise) => {
    if (!exercisesByMuscleGroup[exercise.muscleGroup]) {
      exercisesByMuscleGroup[exercise.muscleGroup] = []
    }
    exercisesByMuscleGroup[exercise.muscleGroup].push(exercise)
  })

  console.log("Filtered exercises:", filteredExercises)
  console.log("Grouped exercises:", exercisesByMuscleGroup)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Thư viện bài tập</h1>
          <p className="text-muted-foreground">
            Tất cả các bài tập cho chương trình của bạn ({exercises.length} bài tập)
          </p>
        </div>
        <Link href="/exercises/new">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Thêm bài tập
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bài tập..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải danh sách bài tập...</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-8">
          <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có bài tập nào</h3>
          <p className="text-muted-foreground mb-4">Thư viện bài tập đang trống. Hãy thêm bài tập đầu tiên!</p>
          <Link href="/exercises/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm bài tập đầu tiên
            </Button>
          </Link>
        </div>
      ) : Object.keys(exercisesByMuscleGroup).length === 0 ? (
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Không tìm thấy bài tập</h3>
          <p className="text-muted-foreground">Không có bài tập nào phù hợp với từ khóa "{searchTerm}"</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(exercisesByMuscleGroup).map(([muscleGroup, exercises]) => (
            <div key={muscleGroup}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Dumbbell className="mr-2 h-5 w-5" />
                {muscleGroup} ({exercises.length} bài tập)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map((exercise) => (
                  <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                    <Card className="h-full hover:bg-accent/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {exercise.description || "Không có mô tả"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{exercise.equipment}</Badge>
                          <Badge variant="secondary">{exercise.difficulty}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug info - chỉ hiển thị trong development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Total exercises: {exercises.length}</p>
          <p>Filtered exercises: {filteredExercises.length}</p>
          <p>Muscle groups: {Object.keys(exercisesByMuscleGroup).join(", ")}</p>
          <p>Loading: {loading.toString()}</p>
          <p>Error: {error || "None"}</p>
        </div>
      )}
    </div>
  )
}
