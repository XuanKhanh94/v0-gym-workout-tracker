"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Dumbbell, LayoutDashboard, ListTodo, BarChart3, Menu, X, LogOut, User, Shield, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function Navbar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAdmin, adminLoading, adminCheckCompleted, checkAdminStatus, adminDebugInfo } = useAuth()
  const [showDebug, setShowDebug] = useState(false)
  const [logoClickCount, setLogoClickCount] = useState(0) // Move here to avoid conditional hook call
  const [hasCheckedAdmin, setHasCheckedAdmin] = useState(false)

  // Kiểm tra trạng thái admin mỗi khi component được render
  useEffect(() => {
    if (user && !adminLoading && !isAdmin && !hasCheckedAdmin) {
      checkAdminStatus()
        .catch((err) => console.error(" Lỗi khi kiểm tra quyền admin:", err))
        .finally(() => setHasCheckedAdmin(true))
    }
  }, [user, pathname, adminLoading, isAdmin, checkAdminStatus, hasCheckedAdmin])

  // Không hiển thị navbar trên các trang xác thực
  if (pathname.startsWith("/auth")) {
    return null
  }

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/",
    },
    {
      href: "/workouts",
      label: "Buổi tập",
      icon: <ListTodo className="h-5 w-5" />,
      active: pathname.startsWith("/workouts"),
    },
    {
      href: "/exercises",
      label: "Bài tập",
      icon: <Dumbbell className="h-5 w-5" />,
      active: pathname.startsWith("/exercises"),
    },
    {
      href: "/stats",
      label: "Tiến trình",
      icon: <BarChart3 className="h-5 w-5" />,
      active: pathname.startsWith("/stats"),
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error)
    }
  }

  const getUserInitials = () => {
    if (!user || !user.displayName) return "U"
    return user.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleRefreshAdminStatus = async () => {
    try {

      await checkAdminStatus()
    } catch (error) {
      console.error("")
    }
  }

  // Hiển thị debug info khi nhấn 5 lần vào logo
  const handleLogoClick = () => {
    setLogoClickCount((prev) => {
      const newCount = prev + 1
      if (newCount >= 5) {
        setShowDebug(!showDebug)
        return 0
      }
      return newCount
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2" onClick={handleLogoClick}>
            <Dumbbell className="h-6 w-6" />
            <span className="font-bold hidden sm:inline-block">GymTracker</span>
          </Link>
        </div>

        {/* Debug info */}
        {showDebug && (
          <div className="absolute top-14 left-0 right-0 bg-yellow-100 dark:bg-yellow-900 p-2 text-xs z-50">
            <div className="container">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="mr-2">
                    Admin: {isAdmin ? "✅" : "❌"}
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    Loading: {adminLoading ? "✅" : "❌"}
                  </Badge>
                  <Badge variant="outline">Completed: {adminCheckCompleted ? "✅" : "❌"}</Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={handleRefreshAdminStatus}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
              {adminDebugInfo && (
                <div className="mt-1 text-xs overflow-x-auto">
                  <pre className="text-[10px]">{JSON.stringify(adminDebugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {isMenuOpen && (
              <div className="fixed inset-0 top-14 z-50 bg-white border-t">
                <nav className="flex flex-col gap-2 p-4" style={{ background: "white" }}>
                  {routes.map((route) => (
                    <Link key={route.href} href={route.href} onClick={() => setIsMenuOpen(false)}>
                      <Button variant={route.active ? "default" : "ghost"} className="w-full justify-start">
                        {route.icon}
                        <span className="ml-2">{route.label}</span>
                      </Button>
                    </Link>
                  ))}
                  {adminLoading ? (
                    <Button variant="ghost" className="w-full justify-start" disabled>
                      <Shield className="h-5 w-5 mr-2 animate-pulse" />
                      Đang kiểm tra...
                    </Button>
                  ) : isAdmin ? (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant={pathname.startsWith("/admin") ? "default" : "ghost"}
                        className="w-full justify-start"
                      >
                        <Shield className="h-5 w-5 mr-2" />
                        Quản trị
                      </Button>
                    </Link>
                  ) : (
                    <span></span>
                  )}
                  <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 mr-2" />
                    Đăng xuất
                  </Button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <nav className="flex items-center space-x-2 ml-4">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button variant={route.active ? "default" : "ghost"} className="gap-2">
                  {route.icon}
                  <span>{route.label}</span>
                </Button>
              </Link>
            ))}
            {adminLoading ? (
              <Button variant="ghost" className="gap-2" disabled>
                <Shield className="h-5 w-5 animate-pulse" />
                <span>Đang kiểm tra...</span>
              </Button>
            ) : isAdmin ? (
              <Link href="/admin">
                <Button variant={pathname.startsWith("/admin") ? "default" : "ghost"} className="gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Quản trị</span>
                </Button>
              </Link>
            ) : null}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
              <DropdownMenuLabel className="text-gray-900">Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-100">
                <User className="mr-2 h-4 w-4" />
                Hồ sơ
              </DropdownMenuItem>
              {adminLoading ? (
                <DropdownMenuItem disabled className="text-gray-500">
                  <Shield className="mr-2 h-4 w-4 animate-pulse" />
                  Đang kiểm tra...
                </DropdownMenuItem>
              ) : isAdmin ? (
                <Link href="/admin">
                  <DropdownMenuItem className="text-gray-700 hover:bg-gray-100">
                    <Shield className="mr-2 h-4 w-4" />
                    Quản trị
                  </DropdownMenuItem>
                </Link>
              ) : null}
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
