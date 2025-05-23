"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getExerciseLibrary, getWorkouts } from "@/lib/firebase-service"
import FirebaseStatus from "@/components/firebase-status"
import { Loader2 } from "lucide-react"

export default function FirebaseDebugPage() {
  const [loading, setLoading] = useState(false)
  const [exercises, setExercises] = useState<any[]>([])
  const [workouts, setWorkouts] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    // Lấy các biến môi trường Firebase
    setEnvVars({
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "Không có",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "Không có",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Không có",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "Không có",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "Không có",
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "Không có",
    })
  }, [])

  const fetchExercises = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getExerciseLibrary()
      setExercises(data)
    } catch (err: any) {
      setError(`Lỗi khi lấy bài tập: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkouts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getWorkouts()
      setWorkouts(data)
    } catch (err: any) {
      setError(`Lỗi khi lấy buổi tập: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kiểm tra kết nối Firebase</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái kết nối</CardTitle>
            <CardDescription>Kiểm tra kết nối đến Firebase</CardDescription>
          </CardHeader>
          <CardContent>
            <FirebaseStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biến môi trường Firebase</CardTitle>
            <CardDescription>Kiểm tra các biến môi trường Firebase đã được cấu hình</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>
                    {value === "Không có" ? (
                      <span className="text-destructive">Không có</span>
                    ) : (
                      <span className="text-green-500">Đã cấu hình</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kiểm tra truy vấn dữ liệu</CardTitle>
            <CardDescription>Thử truy vấn dữ liệu từ Firestore</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="exercises">
              <TabsList className="mb-4">
                <TabsTrigger value="exercises">Bài tập</TabsTrigger>
                <TabsTrigger value="workouts">Buổi tập</TabsTrigger>
              </TabsList>

              <TabsContent value="exercises">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Danh sách bài tập</h3>
                    <Button onClick={fetchExercises} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
                        </>
                      ) : (
                        "Tải dữ liệu"
                      )}
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Lỗi</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {exercises.length > 0 ? (
                    <div className="border rounded-md">
                      <div className="p-4 border-b bg-muted font-medium">Đã tìm thấy {exercises.length} bài tập</div>
                      <div className="p-4 max-h-60 overflow-auto">
                        <pre className="text-xs">{JSON.stringify(exercises.slice(0, 3), null, 2)}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted rounded-md">
                      {loading ? "Đang tải..." : "Chưa có dữ liệu. Nhấn 'Tải dữ liệu' để thử truy vấn."}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="workouts">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Danh sách buổi tập</h3>
                    <Button onClick={fetchWorkouts} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
                        </>
                      ) : (
                        "Tải dữ liệu"
                      )}
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Lỗi</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {workouts.length > 0 ? (
                    <div className="border rounded-md">
                      <div className="p-4 border-b bg-muted font-medium">Đã tìm thấy {workouts.length} buổi tập</div>
                      <div className="p-4 max-h-60 overflow-auto">
                        <pre className="text-xs">{JSON.stringify(workouts.slice(0, 3), null, 2)}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted rounded-md">
                      {loading ? "Đang tải..." : "Chưa có dữ liệu. Nhấn 'Tải dữ liệu' để thử truy vấn."}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn khắc phục</CardTitle>
            <CardDescription>Các bước để khắc phục vấn đề kết nối Firebase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Kiểm tra biến môi trường</h3>
                <p className="text-sm text-muted-foreground">
                  Đảm bảo tất cả các biến môi trường Firebase đã được cấu hình đúng trong file .env.local hoặc trong cài
                  đặt môi trường của Vercel.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Kiểm tra quy tắc bảo mật Firestore</h3>
                <p className="text-sm text-muted-foreground">
                  Đảm bảo quy tắc bảo mật Firestore cho phép đọc và ghi dữ liệu. Ví dụ quy tắc cơ bản:
                </p>
                <pre className="text-xs bg-muted p-2 rounded-md mt-2">
                  {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Kiểm tra xác thực người dùng</h3>
                <p className="text-sm text-muted-foreground">
                  Đảm bảo người dùng đã đăng nhập trước khi truy vấn dữ liệu nếu quy tắc bảo mật yêu cầu xác thực.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">4. Kiểm tra console</h3>
                <p className="text-sm text-muted-foreground">
                  Mở DevTools (F12) và kiểm tra console để xem các lỗi chi tiết.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
