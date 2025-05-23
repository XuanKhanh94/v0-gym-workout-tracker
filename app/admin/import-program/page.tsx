"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore"
import { exercisesFromProgram, gymProgram12Weeks } from "@/lib/workout-programs"
import { useAuth } from "@/lib/auth-context"
import type { Exercise } from "@/lib/types"

export default function ImportProgramPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [existingExercises, setExistingExercises] = useState<Exercise[]>([])
  const [activeTab, setActiveTab] = useState("exercises")

  // Kiểm tra bài tập đã tồn tại
  const checkExistingExercises = async () => {
    try {
      const exercisesRef = collection(db, "exercises")
      const querySnapshot = await getDocs(exercisesRef)
      const exercises = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[]

      setExistingExercises(exercises)
      return exercises
    } catch (error) {
      console.error("Lỗi khi kiểm tra bài tập hiện có:", error)
      return []
    }
  }

  // Nhập dữ liệu bài tập
  const importExercises = async () => {
    if (!user) {
      setResult({
        success: false,
        message: "Bạn cần đăng nhập để thêm dữ liệu bài tập.",
      })
      return
    }

    setLoading(true)
    setProgress(0)
    setResult(null)

    try {
      const existingExercises = await checkExistingExercises()
      const exercisesRef = collection(db, "exercises")
      let addedCount = 0
      let skippedCount = 0

      // Lọc ra các bài tập chưa tồn tại
      const existingNames = existingExercises.map((ex) => ex.name.toLowerCase())
      const exercisesToAdd = exercisesFromProgram.filter((ex) => !existingNames.includes(ex.name.toLowerCase()))

      for (let i = 0; i < exercisesToAdd.length; i++) {
        const exercise = exercisesToAdd[i]

        // Thêm bài tập mới
        await addDoc(exercisesRef, {
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          difficulty: exercise.difficulty,
          description: exercise.description,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        })
        addedCount++

        // Cập nhật tiến độ
        setProgress(Math.round(((i + 1) / exercisesToAdd.length) * 100))
      }

      skippedCount = exercisesFromProgram.length - exercisesToAdd.length

      setResult({
        success: true,
        message: `Đã thêm ${addedCount} bài tập mới vào cơ sở dữ liệu. Bỏ qua ${skippedCount} bài tập đã tồn tại.`,
      })

      // Cập nhật danh sách bài tập hiện có
      await checkExistingExercises()
    } catch (error: any) {
      console.error("Lỗi khi thêm dữ liệu bài tập:", error)
      setResult({
        success: false,
        message: `Đã xảy ra lỗi khi thêm dữ liệu bài tập: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  // Nhập dữ liệu chương trình tập
  const importProgram = async () => {
    if (!user) {
      setResult({
        success: false,
        message: "Bạn cần đăng nhập để thêm dữ liệu chương trình tập.",
      })
      return
    }

    setLoading(true)
    setProgress(0)
    setResult(null)

    try {
      const programsRef = collection(db, "programs")

      // Kiểm tra xem chương trình đã tồn tại chưa
      const q = query(programsRef, where("name", "==", gymProgram12Weeks.name))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setResult({
          success: false,
          message: "Chương trình tập này đã tồn tại trong cơ sở dữ liệu.",
        })
        setLoading(false)
        return
      }

      // Thêm chương trình mới
      await addDoc(programsRef, {
        ...gymProgram12Weeks,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })

      setResult({
        success: true,
        message: "Đã thêm chương trình tập vào cơ sở dữ liệu thành công.",
      })
    } catch (error: any) {
      console.error("Lỗi khi thêm chương trình tập:", error)
      setResult({
        success: false,
        message: `Đã xảy ra lỗi khi thêm chương trình tập: ${error.message}`,
      })
    } finally {
      setLoading(false)
      setProgress(100)
    }
  }

  // Kiểm tra bài tập hiện có khi component được tải
  useState(() => {
    checkExistingExercises()
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nhập dữ liệu từ giáo án tập gym</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="exercises">Bài tập</TabsTrigger>
          <TabsTrigger value="program">Chương trình tập</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nhập dữ liệu bài tập</CardTitle>
              <CardDescription>
                Thêm {exercisesFromProgram.length} bài tập từ giáo án tập gym 12 tuần vào cơ sở dữ liệu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">Bài tập từ giáo án</h2>
                  <p className="text-muted-foreground">Tổng số bài tập: {exercisesFromProgram.length}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium">{existingExercises.length}</div>
                  <div className="text-sm text-muted-foreground">Bài tập hiện có</div>
                </div>
              </div>

              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  <AlertTitle>{result.success ? "Thành công" : "Lỗi"}</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              {loading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="text-sm text-muted-foreground text-right">{progress}%</div>
                </div>
              )}

              <Button onClick={importExercises} disabled={loading} className="w-full">
                {loading ? "Đang nhập dữ liệu..." : "Nhập dữ liệu bài tập"}
              </Button>

              <div className="border rounded-md p-4 max-h-60 overflow-auto">
                <h3 className="font-medium mb-2">Danh sách bài tập sẽ được nhập:</h3>
                <ul className="space-y-1">
                  {exercisesFromProgram.map((exercise, index) => (
                    <li key={index} className="text-sm">
                      <span
                        className={
                          existingExercises.some((e) => e.name.toLowerCase() === exercise.name.toLowerCase())
                            ? "text-muted-foreground"
                            : ""
                        }
                      >
                        {exercise.name} - {exercise.muscleGroup} ({exercise.equipment})
                        {existingExercises.some((e) => e.name.toLowerCase() === exercise.name.toLowerCase()) &&
                          " - Đã tồn tại"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="program" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nhập chương trình tập</CardTitle>
              <CardDescription>Thêm chương trình tập gym 12 tuần vào cơ sở dữ liệu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-lg font-medium">{gymProgram12Weeks.name}</h2>
                <p className="text-muted-foreground">{gymProgram12Weeks.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-sm bg-muted px-2 py-1 rounded-md">{gymProgram12Weeks.duration} tuần</span>
                  <span className="text-sm bg-muted px-2 py-1 rounded-md">{gymProgram12Weeks.level}</span>
                  <span className="text-sm bg-muted px-2 py-1 rounded-md">{gymProgram12Weeks.goal}</span>
                </div>
              </div>

              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  <AlertTitle>{result.success ? "Thành công" : "Lỗi"}</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              {loading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="text-sm text-muted-foreground text-right">{progress}%</div>
                </div>
              )}

              <Button onClick={importProgram} disabled={loading} className="w-full">
                {loading ? "Đang nhập dữ liệu..." : "Nhập chương trình tập"}
              </Button>

              <div className="border rounded-md p-4 max-h-96 overflow-auto">
                <h3 className="font-medium mb-2">Cấu trúc chương trình:</h3>
                <div className="space-y-4">
                  {gymProgram12Weeks.phases.map((phase, phaseIndex) => (
                    <div key={phaseIndex}>
                      <h4 className="font-medium">{phase.name}</h4>
                      <div className="pl-4 space-y-2 mt-2">
                        {phase.workoutDays.map((day, dayIndex) => (
                          <div key={dayIndex}>
                            <h5 className="text-sm font-medium">{day.name}</h5>
                            <ul className="pl-4 text-sm">
                              {day.exercises.map((exercise, exIndex) => (
                                <li key={exIndex} className="text-muted-foreground">
                                  {exercise.name} - {exercise.sets} hiệp x{" "}
                                  {exercise.reps === 0 ? "tối đa" : exercise.reps} lần
                                  {exercise.note && ` (${exercise.note})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
