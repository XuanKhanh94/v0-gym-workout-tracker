"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChevronLeft, Plus, Trash2, CalendarIcon, Timer } from "lucide-react"
import { addWorkout, getExerciseLibrary } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"
import type { Exercise } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function NewWorkoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [workoutName, setWorkoutName] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date())
  const [workoutDuration, setWorkoutDuration] = useState<number>(60) // Thời lượng tập tính bằng phút
  const [notes, setNotes] = useState("")
  const [exercises, setExercises] = useState<
    Array<{
      id: string
      name: string
      sets: Array<{ reps: string; weight: string }>
    }>
  >([])
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [showSuggestionsMap, setShowSuggestionsMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Lấy ngày từ URL params nếu có
    const dateParam = searchParams.get("date")
    if (dateParam) {
      setWorkoutDate(new Date(dateParam))
    }

    const fetchExerciseLibrary = async () => {
      try {
        setLibraryLoading(true)
        const data = await getExerciseLibrary()
        console.log(`Đã tải ${data.length} bài tập từ thư viện`)
        setExerciseLibrary(data)
      } catch (error: any) {
        console.error("Lỗi khi lấy thư viện bài tập:", error)
        setError(`Không thể tải thư viện bài tập: ${error.message}`)
      } finally {
        setLibraryLoading(false)
      }
    }

    fetchExerciseLibrary()
  }, [searchParams])

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
    setShowSuggestionsMap((prev) => ({ ...prev, [id]: true })) // gõ chữ thì show gợi ý
  }

  const handleSelectExerciseName = (exerciseId: string, name: string) => {
    updateExerciseName(exerciseId, name)
    setShowSuggestionsMap((prev) => ({ ...prev, [exerciseId]: false })) // chọn xong ẩn gợi ý
  }

  const handleInputFocus = (exerciseId: string) => {
    setShowSuggestionsMap((prev) => ({ ...prev, [exerciseId]: true })) // focus input show gợi ý
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

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setCategories((prev) => [...prev, category])
    } else {
      setCategories((prev) => prev.filter((c) => c !== category))
    }
  }

  // Xử lý thay đổi thời lượng tập
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Nếu input trống, set về 0
    if (value === "" || value === null || value === undefined) {
      setWorkoutDuration("")
      return
    }

    const numValue = Number(value)

    // Kiểm tra giá trị hợp lệ
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 300) {
      setWorkoutDuration(numValue)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    if (!user) {
      setError("Bạn cần đăng nhập để thêm buổi tập mới")
      toast({
        title: "Lỗi xác thực",
        description: "Bạn cần đăng nhập để thêm buổi tập mới.",
        variant: "destructive",
      })
      return
    }

    if (!workoutName || categories.length === 0 || exercises.length === 0) {
      setError("Vui lòng điền đầy đủ thông tin buổi tập và thêm ít nhất một bài tập")
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin buổi tập và thêm ít nhất một bài tập.",
        variant: "destructive",
      })
      return
    }

    // Kiểm tra thời lượng tập
    if (workoutDuration <= 0) {
      setError("Thời lượng tập phải lớn hơn 0 phút")
      toast({
        title: "Thời lượng không hợp lệ",
        description: "Thời lượng tập phải lớn hơn 0 phút.",
        variant: "destructive",
      })
      return
    }

    const hasEmptyExerciseName = exercises.some((exercise) => !exercise.name)
    if (hasEmptyExerciseName) {
      setError("Vui lòng chọn tên cho tất cả các bài tập")
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn tên cho tất cả các bài tập.",
        variant: "destructive",
      })
      return
    }

    const hasEmptySet = exercises.some((exercise) => exercise.sets.some((set) => !set.reps || !set.weight))
    if (hasEmptySet) {
      setError("Vui lòng điền đầy đủ thông tin reps và trọng lượng cho tất cả các set")
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin reps và trọng lượng cho tất cả các set.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)

      const workoutData = {
        name: workoutName,
        date: workoutDate.toISOString(),
        category: categories.join(", "),
        categories: categories,
        exercises: exercises.map(({ name, sets }) => ({ name, sets })),
        totalSets,
        duration: workoutDuration, // Sử dụng workoutDuration
        notes,
      }

      setDebugInfo(`Đang thêm buổi tập với userId: ${user.uid}`)
      console.log("Đang thêm buổi tập:", JSON.stringify(workoutData, null, 2))

      const workoutId = await addWorkout(workoutData)

      if (workoutId) {
        console.log("Đã thêm buổi tập thành công với id:", workoutId)
        toast({
          title: "Thành công",
          description: "Đã thêm buổi tập mới.",
        })
        router.push(`/workouts/${workoutId}`)
      } else {
        throw new Error("Không thể thêm buổi tập, không nhận được ID")
      }
    } catch (error: any) {
      console.error("Lỗi khi thêm buổi tập:", error)
      setError(`Lỗi khi thêm buổi tập: ${error.message}`)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi thêm buổi tập. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter exercise library based on search term
  const filteredExercises = exerciseLibrary.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/workouts">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Thêm buổi tập mới</h1>
        <p className="text-muted-foreground">Tạo buổi tập mới và thêm các bài tập</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <Alert className="mb-6">
          <AlertTitle>Thông tin debug</AlertTitle>
          <AlertDescription>{debugInfo}</AlertDescription>
        </Alert>
      )}

      {user ? (
        <Alert className="mb-6">
          <AlertTitle>Thông tin người dùng</AlertTitle>
          <AlertDescription>
            Đã đăng nhập với email: {user.email} (ID: {user.uid})
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Chưa đăng nhập</AlertTitle>
          <AlertDescription>Bạn cần đăng nhập để thêm buổi tập mới</AlertDescription>
        </Alert>
      )}

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
            <Label>Ngày tập</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !workoutDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {workoutDate ? format(workoutDate, "dd/MM/yyyy") : <span>Chọn ngày tập</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={workoutDate}
                  onSelect={(date) => date && setWorkoutDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="workout-duration">Thời lượng tập (phút)</Label>
            <div className="relative">
              <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="workout-duration"
                type="number"
                min="1"
                max="300"
                value={workoutDuration}
                onChange={handleDurationChange}
                className="pl-10"
                placeholder="Nhập thời lượng tập"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Hiện tại: {workoutDuration} phút
            </p>
          </div>

          <div className="grid gap-3">
            <Label>Phân loại (có thể chọn nhiều)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["Ngực", "Lưng", "Vai", "Chân", "Tay trước", "Tay sau", "Bụng", "Toàn thân"].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {categories.map((category) => (
                  <span key={category} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {category}
                  </span>
                ))}
              </div>
            )}
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

          {libraryLoading ? (
            <div className="text-center py-8 bg-muted rounded-lg">
              <p className="text-muted-foreground">Đang tải thư viện bài tập...</p>
            </div>
          ) : exercises.length === 0 ? (
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
                        <div className="relative">
                          <Input
                            id={`exercise-${exercise.id}`}
                            placeholder="Tìm kiếm bài tập..."
                            value={exercise.name}
                            onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                            onFocus={() => handleInputFocus(exercise.id)}
                            className="mb-2"
                          />

                          {showSuggestionsMap[exercise.id] && exercise.name.trim() && (
                            <div className="absolute z-10 bottom-full mb-1 w-full bg-white border border-gray-200 rounded shadow-md max-h-48 overflow-auto">
                              {exerciseLibrary.filter((ex) =>
                                ex.name.toLowerCase().includes(exercise.name.toLowerCase()),
                              ).length === 0 ? (
                                <div className="px-4 py-2 text-muted-foreground">Bài tập không tìm thấy</div>
                              ) : (
                                exerciseLibrary
                                  .filter((ex) => ex.name.toLowerCase().includes(exercise.name.toLowerCase()))
                                  .map((ex) => (
                                    <div
                                      key={ex.id}
                                      onClick={() => handleSelectExerciseName(exercise.id, ex.name)}
                                      className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                                    >
                                      {ex.name}
                                    </div>
                                  ))
                              )}
                            </div>
                          )}
                        </div>
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
          <Link href="/workouts">
            <Button variant="outline" type="button">
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={loading || !user}>
            {loading ? "Đang lưu..." : "Lưu buổi tập"}
          </Button>
        </div>
      </form>
    </div>
  )
}
