"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"

export default function FirestoreRulesDebugPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<Array<{ operation: string; success: boolean; message: string }>>([])
  const [loading, setLoading] = useState(false)

  const addResult = (operation: string, success: boolean, message: string) => {
    setResults((prev) => [...prev, { operation, success, message }])
  }

  const clearResults = () => {
    setResults([])
  }

  const testReadExercises = async () => {
    try {
      const exercisesRef = collection(db, "exercises")
      const snapshot = await getDocs(exercisesRef)
      addResult("Đọc bài tập", true, `Đọc thành công ${snapshot.docs.length} bài tập`)
    } catch (error: any) {
      addResult("Đọc bài tập", false, `Lỗi: ${error.message}`)
    }
  }

  const testCreateWorkout = async () => {
    if (!user) {
      addResult("Tạo buổi tập", false, "Bạn cần đăng nhập để thực hiện thao tác này")
      return
    }

    try {
      const workoutData = {
        name: "Buổi tập test",
        date: new Date(),
        category: "Test",
        exercises: [{ name: "Bài tập test", sets: [{ reps: "10", weight: "20" }] }],
        totalSets: 1,
        duration: 30,
        notes: "Buổi tập test cho debug",
        userId: user.uid,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "workouts"), workoutData)
      addResult("Tạo buổi tập", true, `Tạo thành công buổi tập với id: ${docRef.id}`)
      return docRef.id
    } catch (error: any) {
      addResult("Tạo buổi tập", false, `Lỗi: ${error.message}`)
      return null
    }
  }

  const testReadWorkout = async (workoutId?: string) => {
    if (!workoutId) {
      addResult("Đọc buổi tập", false, "Không có ID buổi tập để đọc")
      return
    }

    try {
      const workoutRef = doc(db, "workouts", workoutId)
      const workoutSnap = await getDoc(workoutRef)

      if (workoutSnap.exists()) {
        addResult("Đọc buổi tập", true, "Đọc thành công buổi tập")
      } else {
        addResult("Đọc buổi tập", false, "Không tìm thấy buổi tập")
      }
    } catch (error: any) {
      addResult("Đọc buổi tập", false, `Lỗi: ${error.message}`)
    }
  }

  const testReadAllWorkouts = async () => {
    if (!user) {
      addResult("Đọc tất cả buổi tập", false, "Bạn cần đăng nhập để thực hiện thao tác này")
      return
    }

    try {
      const workoutsRef = collection(db, "workouts")
      const q = query(workoutsRef, where("userId", "==", user.uid))
      const snapshot = await getDocs(q)

      addResult("Đọc tất cả buổi tập", true, `Đọc thành công ${snapshot.docs.length} buổi tập`)

      // Log chi tiết từng buổi tập
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        addResult(
          `Buổi tập ${index + 1}`,
          true,
          `ID: ${doc.id}, Tên: ${data.name}, Ngày: ${data.date?.toDate?.().toISOString() || "N/A"}`,
        )
      })
    } catch (error: any) {
      addResult("Đọc tất cả buổi tập", false, `Lỗi: ${error.message}`)
    }
  }

  const testUpdateWorkout = async (workoutId?: string) => {
    if (!workoutId) {
      addResult("Cập nhật buổi tập", false, "Không có ID buổi tập để cập nhật")
      return
    }

    try {
      const workoutRef = doc(db, "workouts", workoutId)
      await updateDoc(workoutRef, {
        name: "Buổi tập test đã cập nhật",
        updatedAt: serverTimestamp(),
      })
      addResult("Cập nhật buổi tập", true, "Cập nhật thành công buổi tập")
    } catch (error: any) {
      addResult("Cập nhật buổi tập", false, `Lỗi: ${error.message}`)
    }
  }

  const testDeleteWorkout = async (workoutId?: string) => {
    if (!workoutId) {
      addResult("Xóa buổi tập", false, "Không có ID buổi tập để xóa")
      return
    }

    try {
      const workoutRef = doc(db, "workouts", workoutId)
      await deleteDoc(workoutRef)
      addResult("Xóa buổi tập", true, "Xóa thành công buổi tập")
    } catch (error: any) {
      addResult("Xóa buổi tập", false, `Lỗi: ${error.message}`)
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    clearResults()

    try {
      // Test đọc bài tập
      await testReadExercises()

      // Test đọc tất cả buổi tập
      await testReadAllWorkouts()

      // Test tạo buổi tập
      const workoutId = await testCreateWorkout()

      if (workoutId) {
        // Test đọc buổi tập
        await testReadWorkout(workoutId)

        // Test cập nhật buổi tập
        await testUpdateWorkout(workoutId)

        // Test xóa buổi tập
        await testDeleteWorkout(workoutId)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kiểm tra quyền truy cập Firestore</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin người dùng</CardTitle>
          <CardDescription>Thông tin người dùng hiện tại</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div>
              <p>
                <strong>UID:</strong> {user.uid}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Tên:</strong> {user.displayName || "Không có"}
              </p>
            </div>
          ) : (
            <p>Bạn chưa đăng nhập. Một số thao tác sẽ không thực hiện được.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Kết quả kiểm tra</h2>
        <div className="space-x-2">
          <Button onClick={clearResults} variant="outline" disabled={loading || results.length === 0}>
            Xóa kết quả
          </Button>
          <Button onClick={runAllTests} disabled={loading}>
            {loading ? "Đang kiểm tra..." : "Kiểm tra tất cả"}
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-lg">
          <p className="text-muted-foreground">Chưa có kết quả kiểm tra. Nhấn "Kiểm tra tất cả" để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => (
            <Alert key={index} variant={result.success ? "default" : "destructive"}>
              <AlertTitle>
                {result.operation}: {result.success ? "Thành công" : "Thất bại"}
              </AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quy tắc bảo mật Firestore</CardTitle>
          <CardDescription>Quy tắc bảo mật hiện tại của Firestore</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
            {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc tất cả bài tập
    match /exercises/{exerciseId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Cho phép người dùng đọc và ghi buổi tập của họ
    match /workouts/{workoutId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Cho phép đọc chương trình tập
    match /programs/{programId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
