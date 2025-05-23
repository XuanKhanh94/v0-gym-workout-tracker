"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

// Kiểm tra xem chúng ta đang ở môi trường browser hay không
const isBrowser = typeof window !== "undefined"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Chỉ thực hiện chuyển hướng khi ở browser và đã tải xong
    if (isBrowser && !loading) {
      // Nếu không phải trang auth và người dùng chưa đăng nhập
      if (!user && !pathname.startsWith("/auth")) {
        router.push("/auth/login")
      }

      // Nếu đã đăng nhập và đang ở trang auth
      if (user && pathname.startsWith("/auth")) {
        router.push("/")
      }
    }
  }, [user, loading, router, pathname])

  // Hiển thị loading khi đang kiểm tra trạng thái đăng nhập
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Nếu đang ở trang auth và chưa đăng nhập, hoặc không phải trang auth và đã đăng nhập
  if ((pathname.startsWith("/auth") && !user) || (!pathname.startsWith("/auth") && user)) {
    return <>{children}</>
  }

  // Trường hợp đang chuyển hướng
  return null
}
