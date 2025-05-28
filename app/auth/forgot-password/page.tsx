"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        setError("")

        try {
            await sendPasswordResetEmail(auth, email)
            setMessage("Đã gửi email reset mật khẩu. Vui lòng kiểm tra hộp thư của bạn.")
        } catch (error: any) {
            console.error("Error sending password reset email:", error)

            switch (error.code) {
                case "auth/user-not-found":
                    setError("Không tìm thấy tài khoản với email này.")
                    break
                case "auth/invalid-email":
                    setError("Email không hợp lệ.")
                    break
                case "auth/too-many-requests":
                    setError("Quá nhiều yêu cầu. Vui lòng thử lại sau.")
                    break
                default:
                    setError("Đã xảy ra lỗi. Vui lòng thử lại.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <Link href="/auth/login">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại đăng nhập
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Mail className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center">Quên mật khẩu?</CardTitle>
                        <CardDescription className="text-center">
                            Nhập email của bạn và chúng tôi sẽ gửi link reset mật khẩu
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {message && (
                                <Alert>
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Đang gửi..." : "Gửi email reset mật khẩu"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Nhớ mật khẩu?{" "}
                                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
