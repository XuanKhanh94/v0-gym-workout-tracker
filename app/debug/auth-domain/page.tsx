"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export default function AuthDomainDebugPage() {
  const [currentDomain, setCurrentDomain] = useState<string>("")
  const [fullUrl, setFullUrl] = useState<string>("")
  const [error, setError] = useState<string>("")
  const { signInWithGoogle } = useAuth()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDomain(window.location.hostname)
      setFullUrl(window.location.href)
    }
  }, [])

  const handleTestGoogleSignIn = async () => {
    try {
      setError("")
      await signInWithGoogle()
      alert("Đăng nhập thành công!")
    } catch (err: any) {
      console.error("Test sign in error:", err)
      setError(err.message || "Đã xảy ra lỗi khi đăng nhập với Google")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Thông Tin Domain</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin Domain</CardTitle>
            <CardDescription>Thông tin về domain hiện tại của ứng dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Domain hiện tại:</p>
              <code className="block p-2 bg-muted rounded-md mt-1">{currentDomain}</code>
            </div>
            <div>
              <p className="font-medium">URL đầy đủ:</p>
              <code className="block p-2 bg-muted rounded-md mt-1 break-all">{fullUrl}</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kiểm tra Đăng nhập Google</CardTitle>
            <CardDescription>Kiểm tra xem đăng nhập Google có hoạt động không</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleTestGoogleSignIn}>Thử đăng nhập với Google</Button>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Lỗi đăng nhập</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-muted rounded-md">
              <p className="font-medium">Lưu ý:</p>
              <p className="text-sm">
                Nếu bạn nhận được lỗi "auth/unauthorized-domain", bạn cần thêm domain hiện tại vào danh sách Authorized
                domains trong Firebase Console.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Hướng dẫn khắc phục lỗi "auth/unauthorized-domain"</CardTitle>
          <CardDescription>Các bước để thêm domain vào danh sách được phép</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Đăng nhập vào{" "}
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Firebase Console
              </a>
            </li>
            <li>Chọn dự án của bạn</li>
            <li>
              Trong menu bên trái, chọn <strong>Authentication</strong>
            </li>
            <li>
              Chuyển đến tab <strong>Settings</strong>
            </li>
            <li>
              Cuộn xuống phần <strong>Authorized domains</strong>
            </li>
            <li>
              Nhấp vào <strong>Add domain</strong>
            </li>
            <li>
              Thêm domain hiện tại của bạn: <code className="bg-muted px-1 py-0.5 rounded">{currentDomain}</code>
            </li>
            <li>
              Nhấp vào <strong>Add</strong>
            </li>
          </ol>

          <Alert>
            <AlertDescription>
              Sau khi thêm domain vào danh sách, bạn có thể cần đợi vài phút để thay đổi có hiệu lực. Sau đó, hãy thử
              đăng nhập lại.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
