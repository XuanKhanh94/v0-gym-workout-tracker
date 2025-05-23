"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { getWorkout, updateWorkout, getExerciseLibrary } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"
import type { Workout, Exercise } from "@/lib/types"

export default function EditWorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [workoutName, setWorkoutName] = useState("")
  const [category, setCategory] = useState("")
  const [notes, setNotes] = useState("")
  const [exercises, setExercises] = useState<
    Array<{
      id: string
      name: string
      sets: Array<{ reps: string; weight: string }>
    }>
  >([])
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (params.id) {
        // Lấy thông tin buổi tập
        const workoutData = await getWorkout(params.id as string)
        if (workoutData) {
          setWorkout(workoutData)
          setWorkoutName(workoutData.name)
          setCategory(workoutData.category)
          setNotes(workoutData.notes || "")

          // Chuyển đổi định dạng exercises từ workout để phù hợp với state
          const formattedExercises = workoutData.exercises.map((exercise, index) => ({
            id: `existing-${index}`,
            name: exercise.name,
            sets: exercise.sets.map((set) => ({ reps: set.reps, weight: set.weight })),
          }))

          setExercises(formattedExercises)
        } else {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy buổi tập.",
            variant: "destructive",
          })
          router.push("/workouts")
        }

        // Lấy thư viện bài tập
        const libraryData = await getExerciseLibrary()
        setExerciseLibrary(libraryData)

        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router, toast])

  const addExercise = () => {
    const newExercise = {
      id: Date.now().toString(),
      name: "",
      sets: [{ reps: "", weight: "" }],
    }
    setExercises([...exercises, newExercise])
  }

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id))
  }

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map((exercise) => (exercise.id === id ? { ...exercise, name } : exercise)))
  }

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, sets: [...exercise.sets, { reps: "", weight: "" }] } : exercise,
      ),
    )
  }

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, index) => index !== setIndex),
            }
          : exercise,
      ),
    )
  }

  const updateSet = (exerciseId: string, setIndex: number, field: "reps" | "weight", value: string) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set, index) => (index === setIndex ? { ...set, [field]: value } : set)),
            }
          : exercise,
      ),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!workout) return

    if (!workoutName || !category || exercises.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin buổi tập và thêm ít nhất một bài tập.",
        variant: "destructive",
      })
      return
    }

    // Kiểm tra xem tất cả bài tập đã có tên chưa
    const hasEmptyExerciseName = exercises.some((exercise) => !exercise.name)
    if (hasEmptyExerciseName) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn tên cho tất cả các bài tập.",
        variant: "destructive",
      })
      return
    }

    // Kiểm tra xem tất cả set đã có thông tin chưa
    const hasEmptySet = exercises.some((exercise) => exercise.sets.some((set) => !set.reps || !set.weight))
    if (hasEmptySet) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin reps và trọng lượng cho tất cả các set.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Tính tổng số set
      const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)

      // Chuẩn bị dữ liệu buổi tập
      const workoutData = {
        name: workoutName,
        category,
        exercises: exercises.map(({ name, sets }) => ({ name, sets })),
        totalSets,
        notes,
      }

      // Cập nhật buổi tập trong Firestore
      const success = await updateWorkout(workout.id, workoutData)

      if (success) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật buổi tập.",
        })
        router.push(`/workouts/${workout.id}`)
      } else {
        throw new Error("Không thể cập nhật buổi tập")
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật buổi tập:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật buổi tập. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/workouts/${params.id}`}>
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Chỉnh sửa buổi tập</h1>
        <p className="text-muted-foreground">Cập nhật thông tin buổi tập</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 mb-6">
          <div className="grid gap-3">
            <Label htmlFor="workout-name">Tên buổi tập</Label>
            <Input
              id="workout-name"
              placeholder="Ví dụ: Ngày tập ngực"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="category">Phân loại</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Chọn phân loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ngực">Ngực</SelectItem>
                <SelectItem value="Lưng">Lưng</SelectItem>
                <SelectItem value="Vai">Vai</SelectItem>
                <SelectItem value="Chân">Chân</SelectItem>
                <SelectItem value="Tay">Tay</SelectItem>
                <SelectItem value="Bụng">Bụng</SelectItem>
                <SelectItem value="Toàn thân">Toàn thân</SelectItem>
                <SelectItem value="Khác">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Ghi chú về buổi tập"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bài tập</h2>
            <Button type="button" onClick={addExercise} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Thêm bài tập
            </Button>
          </div>

          {exercises.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-lg">
              <p className="text-muted-foreground">Chưa có bài tập nào. Thêm bài tập để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exercises.map((exercise, exerciseIndex) => (
                <Card key={exercise.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Bài tập {exerciseIndex + 1}</CardTitle>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeExercise(exercise.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor={`exercise-${exercise.id}`}>Tên bài tập</Label>
                        <Select value={exercise.name} onValueChange={(value) => updateExerciseName(exercise.id, value)}>
                          <SelectTrigger id={`exercise-${exercise.id}`}>
                            <SelectValue placeholder="Chọn bài tập" />
                          </SelectTrigger>
                          <SelectContent>
                            {exerciseLibrary.map((ex) => (
                              <SelectItem key={ex.id} value={ex.name}>
                                {ex.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Sets</Label>
                          <Button type="button" variant="ghost" size="sm" onClick={() => addSet(exercise.id)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="flex items-center gap-2 mb-2">
                            <div className="w-10 text-center text-sm font-medium">{setIndex + 1}</div>
                            <Input
                              type="number"
                              placeholder="Reps"
                              value={set.reps}
                              onChange={(e) => updateSet(exercise.id, setIndex, "reps", e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Kg"
                              value={set.weight}
                              onChange={(e) => updateSet(exercise.id, setIndex, "weight", e.target.value)}
                              className="flex-1"
                            />
                            {exercise.sets.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSet(exercise.id, setIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Link href={`/workouts/${params.id}`}>
            <Button variant="outline" type="button">
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  )
}
