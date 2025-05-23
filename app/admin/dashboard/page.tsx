"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Dumbbell, Shield, Users, Settings, BarChart, BookOpen, MessageSquare, Bell } from "lucide-react"
import AdminGuard from "@/components/admin-guard"

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Bảng điều khiển quản trị</h1>
          <p className="text-muted-foreground">Quản lý và giám sát hệ thống Gym Tracker</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quản lý người dùng */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Quản lý người dùng
              </CardTitle>
              <CardDescription>Quản lý và phân quyền người dùng trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                Xem danh sách người dùng, phân quyền và quản lý trạng thái tài khoản.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/users" className="w-full">
                <Button className="w-full">Quản lý người dùng</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Quản lý bài tập */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Dumbbell className="mr-2 h-5 w-5 text-primary" />
                Quản lý bài tập
              </CardTitle>
              <CardDescription>Quản lý thư viện bài tập</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                Thêm, sửa, xóa bài tập trong thư viện và quản lý danh mục bài tập.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/exercises" className="w-full">
                <Button variant="outline" className="w-full">
                  Quản lý bài tập
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Quản lý chương trình tập */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Chương trình tập
              </CardTitle>
              <CardDescription>Quản lý chương trình tập luyện</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">Tạo và quản lý các chương trình tập luyện cho người dùng.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/import-program" className="w-full">
                <Button variant="outline" className="w-full">
                  Quản lý chương trình
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Thống kê */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-primary" />
                Thống kê
              </CardTitle>
              <CardDescription>Xem thống kê hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                Xem thống kê về người dùng, buổi tập, bài tập phổ biến và hoạt động.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/stats" className="w-full">
                <Button variant="outline" className="w-full">
                  Xem thống kê
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Thông báo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Thông báo
              </CardTitle>
              <CardDescription>Quản lý thông báo hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">Tạo và gửi thông báo đến người dùng trong hệ thống.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/notifications" className="w-full">
                <Button variant="outline" className="w-full">
                  Quản lý thông báo
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Phản hồi */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Phản hồi
              </CardTitle>
              <CardDescription>Quản lý phản hồi từ người dùng</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">Xem và phản hồi các góp ý, báo lỗi từ người dùng.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/feedback" className="w-full">
                <Button variant="outline" className="w-full">
                  Xem phản hồi
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Cài đặt hệ thống */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Cài đặt hệ thống
              </CardTitle>
              <CardDescription>Quản lý cài đặt hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">Cấu hình các thiết lập hệ thống và tùy chọn nâng cao.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/settings" className="w-full">
                <Button variant="outline" className="w-full">
                  Cài đặt hệ thống
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Thiết lập admin */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Thiết lập admin
              </CardTitle>
              <CardDescription>Quản lý quyền admin</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">Thiết lập admin đầu tiên và quản lý danh sách admin.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/setup" className="w-full">
                <Button variant="outline" className="w-full">
                  Thiết lập admin
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Kiểm tra kết nối */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-primary" />
                Kiểm tra kết nối
              </CardTitle>
              <CardDescription>Kiểm tra kết nối Firebase</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                Kiểm tra kết nối đến Firebase, xem các biến môi trường và thử truy vấn dữ liệu.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/debug/firebase" className="w-full">
                <Button variant="outline" className="w-full">
                  Kiểm tra kết nối
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}
