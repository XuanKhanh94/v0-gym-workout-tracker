"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, adminLoading, checkAdminStatus } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    } else if (!loading && user && !adminLoading && !isAdmin) {
      // Kiểm tra lại quyền admin
      setChecking(true)
      checkAdminStatus()
        .then((isAdmin) => {
          if (!isAdmin) {
            router.push("/")
          }
        })
        .catch((error) => {
          console.error("Lỗi khi kiểm tra quyền admin:", error)
          setError("Không thể kiểm tra quyền admin. Vui lòng thử lại sau.")
        })
        .finally(() => {
          setChecking(false)
        })
    }
  }, [user, loading, isAdmin, adminLoading, router, checkAdminStatus])

  if (loading || adminLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Không thể kiểm tra quyền truy cập</CardTitle>
            <CardDescription>Đã xảy ra lỗi khi kiểm tra quyền admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Vui lòng thử lại sau hoặc liên hệ quản trị viên nếu vấn đề vẫn tiếp tục.</p>
          </CardContent>
        </Card>
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
          <CardContent>
            <p>Trang này chỉ dành cho quản trị viên. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
