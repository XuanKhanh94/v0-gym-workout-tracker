"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SeedExercises from "@/scripts/seed-exercises"

export default function SeedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Kiểm tra quyền admin (đơn giản là kiểm tra email)
    // Trong thực tế, bạn nên có một hệ thống phân quyền phức tạp hơn
    if (user && !loading) {
      // Thay thế bằng email của bạn hoặc cơ chế kiểm tra admin khác
      setIsAdmin(true)
    }
  }, [user, loading])

  // Chuyển hướng nếu không phải admin
  useEffect(() => {
    if (!loading && !isAdmin && !user) {
      router.push("/auth/login")
    }
  }, [isAdmin, loading, router, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Không có quyền truy cập</CardTitle>
            <CardDescription>Bạn không có quyền truy cập trang này.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quản trị dữ liệu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dữ liệu bài tập</CardTitle>
            <CardDescription>Thêm dữ liệu bài tập từ giáo án tập gym 12 tuần.</CardDescription>
          </CardHeader>
          <CardContent>
            <SeedExercises />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
