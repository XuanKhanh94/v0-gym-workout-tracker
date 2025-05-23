"use client"

import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, getDocs, limit, query } from "firebase/firestore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function FirebaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [checking, setChecking] = useState(true)

  const checkConnection = async () => {
    setChecking(true)
    setStatus("loading")
    setErrorMessage("")

    try {
      // Kiểm tra kết nối đến Firestore
      if (!db) {
        throw new Error("Firebase chưa được khởi tạo")
      }

      // Thử truy vấn một collection
      const exercisesRef = collection(db, "exercises")
      const q = query(exercisesRef, limit(1))
      await getDocs(q)

      // Nếu không có lỗi, đánh dấu là đã kết nối
      setStatus("connected")
    } catch (error: any) {
      console.error("Lỗi kết nối Firebase:", error)
      setStatus("error")
      setErrorMessage(error.message || "Không thể kết nối đến Firebase")
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Trạng thái kết nối Firebase</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={checkConnection}
          disabled={checking}
          className="flex items-center gap-2"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Kiểm tra lại
        </Button>
      </div>

      {status === "loading" && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Đang kiểm tra kết nối...</AlertTitle>
          <AlertDescription>Vui lòng đợi trong khi chúng tôi kiểm tra kết nối đến Firebase.</AlertDescription>
        </Alert>
      )}

      {status === "connected" && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Đã kết nối</AlertTitle>
          <AlertDescription>Kết nối đến Firebase thành công.</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Lỗi kết nối</AlertTitle>
          <AlertDescription>
            Không thể kết nối đến Firebase. Lỗi: {errorMessage}
            <div className="mt-2">
              <strong>Kiểm tra:</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Các biến môi trường Firebase đã được cấu hình đúng</li>
                <li>Quy tắc bảo mật Firestore cho phép đọc dữ liệu</li>
                <li>Kết nối internet của bạn</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <strong>Thông tin người dùng:</strong>{" "}
        {auth?.currentUser ? `Đã đăng nhập (${auth.currentUser.email})` : "Chưa đăng nhập"}
      </div>
    </div>
  )
}
