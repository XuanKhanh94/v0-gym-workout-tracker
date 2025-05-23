"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getUserRole, isUserAdmin, getAllUserRoles } from "@/lib/firestore-auth"
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function AdminCheckDebugPage() {
  const { user, isAdmin, adminLoading, adminCheckCompleted, checkAdminStatus } = useAuth()
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<any>(null)
  const [adminCheck, setAdminCheck] = useState<boolean | null>(null)
  const [allUserRoles, setAllUserRoles] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const checkUserRole = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Bắt đầu kiểm tra vai trò cho user:", user.uid)

      // Lấy vai trò người dùng từ Firestore
      const role = await getUserRole(user.uid)
      console.log("📋 Vai trò từ Firestore:", role)
      setUserRole(role)

      // Kiểm tra quyền admin
      const isAdminResult = await isUserAdmin(user.uid)
      console.log("✅ Kết quả isUserAdmin:", isAdminResult)
      setAdminCheck(isAdminResult)

      // Lấy tất cả vai trò để debug
      const allRoles = await getAllUserRoles()
      console.log("📊 Tất cả vai trò trong hệ thống:", allRoles)
      setAllUserRoles(allRoles)
    } catch (error: any) {
      console.error("❌ Lỗi khi kiểm tra vai trò:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshAdminStatus = async () => {
    setLoading(true)
    try {
      console.log("🔄 Làm mới trạng thái admin...")
      await checkAdminStatus()
      await checkUserRole() // Cập nhật lại thông tin debug
    } catch (error: any) {
      console.error("❌ Lỗi khi làm mới trạng thái admin:", error)
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

  const getStatusIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === false) return <XCircle className="h-4 w-4 text-red-500" />
    return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }

  const getStatusBadge = (status: boolean | null) => {
    if (status === true)
      return (
        <Badge variant="default" className="bg-green-500">
          Admin
        </Badge>
      )
    if (status === false) return <Badge variant="destructive">User</Badge>
    return <Badge variant="secondary">Chưa xác định</Badge>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kiểm tra trạng thái Admin</h1>
        <div className="flex gap-2">
          <Button onClick={checkUserRole} disabled={loading} variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang kiểm tra...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Kiểm tra lại
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
                Làm mới trạng thái
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Thông tin người dùng hiện tại
              {getStatusIcon(isAdmin)}
            </CardTitle>
            <CardDescription>Thông tin và trạng thái của người dùng đang đăng nhập</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">UID</p>
                    <p className="font-mono text-sm">{user.uid}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tên hiển thị</p>
                    <p>{user.displayName || "Không có"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trạng thái Admin</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(isAdmin)}
                      {adminLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Chưa đăng nhập</AlertTitle>
                <AlertDescription>Bạn cần đăng nhập để kiểm tra trạng thái admin.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái kiểm tra Admin</CardTitle>
            <CardDescription>Chi tiết về quá trình kiểm tra quyền admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">useAuth isAdmin:</span>
                  {getStatusBadge(isAdmin)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Admin Loading:</span>
                  <Badge variant={adminLoading ? "secondary" : "outline"}>
                    {adminLoading ? "Đang tải" : "Hoàn thành"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Kiểm tra hoàn tất:</span>
                  <Badge variant={adminCheckCompleted ? "default" : "secondary"}>
                    {adminCheckCompleted ? "Có" : "Chưa"}
                  </Badge>
                </div>
              </div>

              {userRole && (
                <div>
                  <h3 className="font-medium mb-2">Vai trò từ Firestore:</h3>
                  <div className="p-4 bg-muted rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(userRole, null, 2)}</pre>
                  </div>
                </div>
              )}

              {adminCheck !== null && (
                <div>
                  <h3 className="font-medium mb-2">Kết quả isUserAdmin():</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(adminCheck)}
                    <span>{adminCheck ? "Có quyền admin" : "Không có quyền admin"}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {allUserRoles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tất cả vai trò trong hệ thống</CardTitle>
              <CardDescription>Danh sách tất cả người dùng và vai trò của họ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allUserRoles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{role.email}</p>
                      <p className="text-sm text-muted-foreground">{role.displayName || "Không có tên"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(role.role === "admin")}
                      {role.uid === user?.uid && <Badge variant="outline">Bạn</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  Sử dụng nút "Làm mới trạng thái" để cập nhật trạng thái admin trong ứng dụng.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Thiết lập lại admin</h3>
                <p className="text-sm text-muted-foreground">
                  Nếu các bước trên không hiệu quả, bạn có thể thử thiết lập lại admin.
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
