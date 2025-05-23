"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AdminGuard from "@/components/admin-guard"
import { useEffect, useState } from "react"

export default function GoogleAuthSetupPage() {
  const [currentDomain, setCurrentDomain] = useState<string>("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDomain(window.location.hostname)
    }
  }, [])

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Cấu hình đăng nhập Google</h1>

        <Alert className="mb-6">
          <AlertTitle>Quan trọng</AlertTitle>
          <AlertDescription>
            Để đăng nhập bằng Google hoạt động, bạn cần cấu hình đúng trong Firebase Console. Hãy làm theo các bước dưới
            đây.
          </AlertDescription>
        </Alert>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bước 1: Bật tính năng đăng nhập bằng Google</CardTitle>
            <CardDescription>Cấu hình trong Firebase Console</CardDescription>
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
                Chuyển đến tab <strong>Sign-in method</strong>
              </li>
              <li>
                Tìm <strong>Google</strong> trong danh sách và nhấp vào <strong>Edit</strong> (biểu tượng bút)
              </li>
              <li>
                Bật công tắc <strong>Enable</strong>
              </li>
              <li>Nhập tên dự án của bạn (sẽ hiển thị cho người dùng khi đăng nhập)</li>
              <li>Chọn một email hỗ trợ</li>
              <li>
                Nhấp vào <strong>Save</strong>
              </li>
            </ol>

            <div className="p-4 bg-muted rounded-md">
              <p className="font-medium">Lưu ý:</p>
              <p className="text-sm">
                Firebase sẽ tự động tạo OAuth Client ID cho bạn. Bạn không cần phải cấu hình thêm trong Google Cloud
                Console.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bước 2: Thêm domain vào danh sách được phép</CardTitle>
            <CardDescription>Cấu hình domain cho đăng nhập</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Lỗi "auth/unauthorized-domain"</AlertTitle>
              <AlertDescription>
                Nếu bạn nhận được lỗi này, đó là vì domain hiện tại chưa được thêm vào danh sách domain được phép trong
                Firebase.
              </AlertDescription>
            </Alert>

            <ol className="list-decimal list-inside space-y-2">
              <li>
                Trong Firebase Console, chọn <strong>Authentication</strong>
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
                Nếu đang phát triển cục bộ, hãy đảm bảo <code>localhost</code> cũng có trong danh sách
              </li>
            </ol>

            <div className="p-4 bg-muted rounded-md mt-4">
              <p className="font-medium">Domain cần thêm:</p>
              <ul className="list-disc list-inside mt-2">
                <li>
                  <code>{currentDomain}</code> (domain hiện tại)
                </li>
                <li>
                  <code>localhost</code> (cho phát triển cục bộ)
                </li>
                <li>
                  <code>127.0.0.1</code> (cho phát triển cục bộ)
                </li>
                <li>
                  Các domain khác mà ứng dụng của bạn sẽ chạy (ví dụ: <code>your-app.vercel.app</code>)
                </li>
              </ul>
            </div>

            <Alert>
              <AlertDescription>
                Sau khi thêm domain vào danh sách, bạn có thể cần đợi vài phút để thay đổi có hiệu lực. Sau đó, hãy thử
                đăng nhập lại.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Khắc phục sự cố</CardTitle>
            <CardDescription>Các vấn đề thường gặp và cách giải quyết</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Lỗi "auth/unauthorized-domain"</h3>
              <p className="text-sm text-muted-foreground">
                Lỗi này xảy ra khi domain hiện tại chưa được thêm vào danh sách Authorized domains trong Firebase
                Authentication. Hãy làm theo Bước 2 ở trên để thêm domain của bạn.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Client ID của bạn:{" "}
                <code>1031164850774-ne58pikt3se42312sjekvcpglh1i9aht.apps.googleusercontent.com</code>
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Popup bị chặn</h3>
              <p className="text-sm text-muted-foreground">
                Nếu popup đăng nhập bị chặn, hãy đảm bảo trình duyệt của bạn cho phép popup từ domain của ứng dụng.
                Thông thường, trình duyệt sẽ hiển thị một thông báo khi popup bị chặn.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Lỗi "operation-not-allowed"</h3>
              <p className="text-sm text-muted-foreground">
                Đảm bảo đăng nhập bằng Google đã được bật trong tab Sign-in method của Firebase Authentication.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Lỗi mạng</h3>
              <p className="text-sm text-muted-foreground">
                Kiểm tra kết nối internet của bạn. Đôi khi, tường lửa hoặc proxy có thể chặn yêu cầu đến các dịch vụ của
                Google.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
