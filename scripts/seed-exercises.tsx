"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore"
import { exerciseData } from "@/lib/exercise-data"

export default function SeedExercises() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [existingCount, setExistingCount] = useState(0)

  const checkExistingExercises = async () => {
    try {
      const exercisesRef = collection(db, "exercises")
      const querySnapshot = await getDocs(exercisesRef)
      setExistingCount(querySnapshot.size)
    } catch (error) {
      console.error("Lỗi khi kiểm tra bài tập hiện có:", error)
    }
  }

  const seedExercises = async () => {
    if (!auth.currentUser) {
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
      const exercisesRef = collection(db, "exercises")
      let addedCount = 0
      let skippedCount = 0

      for (let i = 0; i < exerciseData.length; i++) {
        const exercise = exerciseData[i]

        // Kiểm tra xem bài tập đã tồn tại chưa
        const q = query(exercisesRef, where("name", "==", exercise.name))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          // Thêm bài tập mới
          await addDoc(exercisesRef, {
            ...exercise,
            createdBy: auth.currentUser.uid,
            createdAt: serverTimestamp(),
          })
          addedCount++
        } else {
          skippedCount++
        }

        // Cập nhật tiến độ
        setProgress(Math.round(((i + 1) / exerciseData.length) * 100))
      }

      setResult({
        success: true,
        message: `Đã thêm ${addedCount} bài tập mới vào cơ sở dữ liệu. Bỏ qua ${skippedCount} bài tập đã tồn tại.`,
      })

      // Cập nhật số lượng bài tập hiện có
      await checkExistingExercises()
    } catch (error) {
      console.error("Lỗi khi thêm dữ liệu bài tập:", error)
      setResult({
        success: false,
        message: "Đã xảy ra lỗi khi thêm dữ liệu bài tập. Vui lòng thử lại.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Kiểm tra số lượng bài tập hiện có khi component được tải
  useState(() => {
    checkExistingExercises()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Thêm dữ liệu bài tập</h2>
          <p className="text-muted-foreground">
            Thêm {exerciseData.length} bài tập từ giáo án tập gym 12 tuần vào cơ sở dữ liệu.
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium">{existingCount}</div>
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

      <Button onClick={seedExercises} disabled={loading} className="w-full">
        {loading ? "Đang thêm dữ liệu..." : "Thêm dữ liệu bài tập"}
      </Button>
    </div>
  )
}
