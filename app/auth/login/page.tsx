"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dumbbell } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { GoogleSignInButton } from "@/components/google-sign-in-button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signIn(email, password)
      router.push("/")
    } catch (error: any) {
      setError(
        error.code === "auth/invalid-credential"
          ? "Email hoặc mật khẩu không chính xác"
          : "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Dumbbell className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin đăng nhập của bạn để tiếp tục</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Hoặc tiếp tục với</span>
            </div>
          </div>

          <GoogleSignInButton
            onError={(error) => {
              console.error("Lỗi đăng nhập Google:", error)

              // Hiển thị thông báo lỗi cụ thể hơn
              if (error.code === "auth/popup-closed-by-user") {
                setError("Đăng nhập bị hủy. Vui lòng thử lại.")
              } else if (error.code === "auth/popup-blocked") {
                setError("Popup đăng nhập bị chặn. Vui lòng cho phép popup hoặc thử lại sau.")
              } else if (error.code === "auth/cancelled-popup-request") {
                setError("Yêu cầu đăng nhập bị hủy. Vui lòng thử lại.")
              } else if (error.code === "auth/operation-not-allowed") {
                setError("Đăng nhập với Google chưa được bật. Vui lòng liên hệ quản trị viên.")
              } else if (error.code === "auth/network-request-failed") {
                setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.")
              } else {
                setError(`Đã xảy ra lỗi khi đăng nhập với Google: ${error.message || "Vui lòng thử lại."}`)
              }
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Đăng ký
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
