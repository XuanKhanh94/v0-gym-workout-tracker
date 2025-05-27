"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw } from "lucide-react"
import WorkoutList from "@/components/workout-list"
import { getWorkouts } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Workout } from "@/lib/types"

export default function WorkoutsPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWorkouts = async () => {
    if (!user) {
      setError("Bạn cần đăng nhập để xem buổi tập")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Đang lấy danh sách buổi tập...")
      const data = await getWorkouts()
      console.log(`Đã lấy ${data.length} buổi tập:`, data)

      setWorkouts(data)
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách buổi tập:", error)
      setError(`Đã xảy ra lỗi khi lấy danh sách buổi tập: ${error.message}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchWorkouts()
    }
  }, [user])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchWorkouts()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Buổi tập</h1>
          <p className="text-muted-foreground">Các buổi tập của bạn: {workouts.length} buổi tập</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Đang làm mới..." : "Làm mới"}
          </Button>
          <Link href="/workouts/new">
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" />
              Thêm buổi tập
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <WorkoutList workouts={workouts} loading={loading} />
    </div>
  )
}
