"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setupFirstAdmin, resetAdminList, hasAnyAdmin, getAllUserRoles } from "@/lib/firestore-auth"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function AdminSetupPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [resetMode, setResetMode] = useState(false)
  const [checkingAdmins, setCheckingAdmins] = useState(false)
  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const [adminList, setAdminList] = useState<{ uid: string; email: string; displayName?: string }[]>([])

  const checkExistingAdmins = async () => {
    setCheckingAdmins(true)
    try {
      const exists = await hasAnyAdmin()
      setAdminExists(exists)

      // Lấy danh sách admin
      if (exists) {
        const allUsers = await getAllUserRoles()
        const admins = allUsers.filter((user) => user.role === "admin")
        setAdminList(
          admins.map((admin) => ({
            uid: admin.uid,
            email: admin.email,
            displayName: admin.displayName,
          })),
        )
      } else {
        setAdminList([])
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra admin:", error)
    } finally {
      setCheckingAdmins(false)
    }
  }

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setResult({
        success: false,
        message: "Vui lòng nhập email của admin",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const success = await setupFirstAdmin(email, resetMode)

      if (success) {
        setResult({
          success: true,
          message: `Đã thiết lập ${email} làm admin đầu tiên. Người dùng này sẽ được cấp quyền admin khi đăng nhập.`,
        })
        setAdminExists(false) // Reset trạng thái
        setAdminList([]) // Xóa danh sách admin cũ
      } else {
        setResult({
          success: false,
          message: "Đã có admin trong hệ thống. Không thể thiết lập admin đầu tiên.",
        })
      }
    } catch (error: any) {
      console.error("Lỗi khi thiết lập admin:", error)
      setResult({
        success: false,
        message: `Đã xảy ra lỗi: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetAdminList = async () => {
    if (!confirm("Bạn có chắc chắn muốn reset danh sách admin? Hành động này không thể hoàn tác.")) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const success = await resetAdminList()

      if (success) {
        setResult({
          success: true,
          message: "Đã reset danh sách admin. Bạn có thể thiết lập admin đầu tiên bây giờ.",
        })
        setAdminExists(false)
        setAdminList([]) // Xóa danh sách admin
      } else {
        setResult({
          success: false,
          message: "Không thể reset danh sách admin.",
        })
      }
    } catch (error: any) {
      console.error("Lỗi khi reset danh sách admin:", error)
      setResult({
        success: false,
        message: `Đã xảy ra lỗi: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Thiết lập Admin đầu tiên</h1>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Thiết lập Admin</CardTitle>
          <CardDescription>
            Thiết lập admin đầu tiên cho hệ thống. Chức năng này chỉ hoạt động khi chưa có admin nào trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
              <AlertTitle>{result.success ? "Thành công" : "Lỗi"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="mb-4">
            <Button variant="outline" onClick={checkExistingAdmins} disabled={checkingAdmins} className="w-full">
              {checkingAdmins ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang kiểm tra
                </>
              ) : (
                "Kiểm tra admin hiện có"
              )}
            </Button>

            {adminExists !== null && (
              <Alert className="mt-2">
                <AlertDescription>
                  {adminExists
                    ? "Đã có admin trong hệ thống. Bạn có thể reset để thiết lập lại."
                    : "Chưa có admin nào trong hệ thống. Bạn có thể thiết lập admin đầu tiên."}
                </AlertDescription>
              </Alert>
            )}

            {/* Hiển thị danh sách admin */}
            {adminList.length > 0 && (
              <div className="mt-4 p-3 border rounded-md">
                <h3 className="font-medium mb-2">Danh sách admin hiện tại:</h3>
                <ul className="space-y-1">
                  {adminList.map((admin) => (
                    <li key={admin.uid} className="text-sm">
                      {admin.email} {admin.displayName ? `(${admin.displayName})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <form onSubmit={handleSetupAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email của Admin</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Nhập email của người dùng bạn muốn cấp quyền admin. Người dùng này sẽ có quyền quản trị toàn bộ hệ
                thống.
              </p>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="reset-mode"
                checked={resetMode}
                onChange={(e) => setResetMode(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="reset-mode" className="text-sm text-muted-foreground">
                Ghi đè admin hiện tại (nếu có)
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang thiết lập...
                </>
              ) : (
                "Thiết lập Admin"
              )}
            </Button>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Nếu bạn gặp vấn đề với hệ thống phân quyền, bạn có thể reset danh sách admin.
              </p>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={handleResetAdminList}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Reset danh sách admin"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
