"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { getUserRole, isUserAdmin } from "@/lib/firestore-auth"
import { Loader2, RefreshCw } from "lucide-react"

export default function AdminStatusDebugPage() {
  const { user, isAdmin, adminLoading, checkAdminStatus } = useAuth()
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<any>(null)
  const [adminCheck, setAdminCheck] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkUserRole = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Lấy vai trò người dùng từ Firestore
      const role = await getUserRole(user.uid)
      setUserRole(role)

      // Kiểm tra quyền admin
      const isAdminResult = await isUserAdmin(user.uid)
      setAdminCheck(isAdminResult)
    } catch (error: any) {
      console.error("Lỗi khi kiểm tra vai trò:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshAdminStatus = async () => {
    setLoading(true)
    try {
      await checkAdminStatus()
    } catch (error: any) {
      console.error("Lỗi khi làm mới trạng thái admin:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      checkUserRole()
    }
  }, [user])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kiểm tra trạng thái Admin</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin người dùng</CardTitle>
            <CardDescription>Thông tin người dùng hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p>
                  <strong>UID:</strong> {user.uid}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Tên hiển thị:</strong> {user.displayName || "Không có"}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={checkUserRole} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Kiểm tra vai trò
                      </>
                    )}
                  </Button>
                  <Button onClick={refreshAdminStatus} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang làm mới...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Làm mới trạng thái admin
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <p>Bạn chưa đăng nhập</p>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái Admin</CardTitle>
            <CardDescription>Kiểm tra quyền admin của người dùng hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Trạng thái từ useAuth hook:</h3>
                {adminLoading ? (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span></span>
                  </div>
                ) : (
                  <Alert variant={isAdmin ? "default" : "destructive"} className="mt-2">
                    <AlertDescription>
                      {isAdmin ? "Người dùng có quyền admin" : "Người dùng không có quyền admin"}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {userRole !== null && (
                <div>
                  <h3 className="font-medium">Vai trò từ Firestore:</h3>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(userRole, null, 2)}</pre>
                  </div>
                </div>
              )}

              {adminCheck !== null && (
                <div>
                  <h3 className="font-medium">Kết quả kiểm tra isUserAdmin:</h3>
                  <Alert variant={adminCheck ? "default" : "destructive"} className="mt-2">
                    <AlertDescription>
                      {adminCheck ? "Người dùng có quyền admin" : "Người dùng không có quyền admin"}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn khắc phục</CardTitle>
            <CardDescription>Các bước để khắc phục vấn đề với quyền admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Kiểm tra vai trò trong Firestore</h3>
                <p className="text-sm text-muted-foreground">
                  Đảm bảo người dùng có bản ghi trong collection "userRoles" với role="admin".
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Làm mới trạng thái admin</h3>
                <p className="text-sm text-muted-foreground">
                  Sử dụng nút "Làm mới trạng thái admin" để cập nhật trạng thái admin trong ứng dụng.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Đăng xuất và đăng nhập lại</h3>
                <p className="text-sm text-muted-foreground">
                  Đôi khi, đăng xuất và đăng nhập lại có thể giúp cập nhật trạng thái admin.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">4. Thiết lập lại admin</h3>
                <p className="text-sm text-muted-foreground">
                  Nếu các bước trên không hiệu quả, bạn có thể thử thiết lập lại admin từ trang thiết lập admin.
                </p>
                <Button variant="outline" className="mt-2" asChild>
                  <Link href="/admin/setup">Đi đến trang thiết lập admin</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
