"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, RefreshCw, UserCog } from "lucide-react"
import { getAllUserRoles, setUserRole } from "@/lib/firestore-auth"
import { useToast } from "@/hooks/use-toast"
import AdminGuard from "@/components/admin-guard"
import type { UserRole } from "@/lib/firestore-auth"

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllUserRoles()
      setUsers(data)
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách người dùng:", error)
      setError(`Đã xảy ra lỗi khi lấy danh sách người dùng: ${error.message}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchUsers()
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    try {
      setUpdatingUser(userId)

      // Tìm người dùng trong danh sách
      const user = users.find((u) => u.uid === userId)
      if (!user) {
        throw new Error("Không tìm thấy người dùng")
      }

      // Cập nhật vai trò
      const success = await setUserRole({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: newRole,
      })

      if (success) {
        toast({
          title: "Thành công",
          description: `Đã cập nhật quyền người dùng thành ${newRole === "admin" ? "Quản trị viên" : "Người dùng"}`,
        })

        // Cập nhật danh sách người dùng
        setUsers(users.map((u) => (u.uid === userId ? { ...u, role: newRole } : u)))
      } else {
        throw new Error("Không thể cập nhật quyền người dùng")
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật quyền người dùng:", error)
      toast({
        title: "Lỗi",
        description: `Đã xảy ra lỗi khi cập nhật quyền người dùng: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setUpdatingUser(null)
    }
  }

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="pl-0">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý và phân quyền người dùng trong hệ thống</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Danh sách người dùng</h2>
            <p className="text-muted-foreground">Tổng số: {users.length} người dùng</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing || loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Đang làm mới..." : "Làm mới"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Người dùng</CardTitle>
            <CardDescription>Quản lý quyền và trạng thái người dùng</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Chưa có người dùng nào</h3>
                <p className="text-muted-foreground">Chưa có người dùng nào trong hệ thống.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Tên hiển thị</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.displayName || "Chưa đặt tên"}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value: "admin" | "user") => handleRoleChange(user.uid, value)}
                          disabled={updatingUser === user.uid}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Quản trị viên</SelectItem>
                            <SelectItem value="user">Người dùng</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
