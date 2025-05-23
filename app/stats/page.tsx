"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, TrendingUp } from "lucide-react"
import { getWorkouts } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import type { Workout } from "@/lib/types"

export default function StatsPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (user) {
        const data = await getWorkouts()
        setWorkouts(data)
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [user])

  // Tính toán thống kê
  const currentMonth = new Date().getMonth()
  const workoutsThisMonth = workouts.filter((w) => new Date(w.date).getMonth() === currentMonth)
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const workoutsLastMonth = workouts.filter((w) => new Date(w.date).getMonth() === lastMonth)

  const totalHours = workouts.reduce((sum, workout) => sum + workout.duration, 0) / 60
  const totalSets = workouts.reduce((sum, workout) => sum + workout.totalSets, 0)

  // Tính toán nhóm cơ phổ biến nhất
  const muscleGroupCounts: Record<string, number> = {}
  workouts.forEach((workout) => {
    if (!muscleGroupCounts[workout.category]) {
      muscleGroupCounts[workout.category] = 0
    }
    muscleGroupCounts[workout.category]++
  })

  let popularMuscleGroup = "Chưa có dữ liệu"
  let popularMuscleGroupCount = 0

  Object.entries(muscleGroupCounts).forEach(([group, count]) => {
    if (count > popularMuscleGroupCount) {
      popularMuscleGroup = group
      popularMuscleGroupCount = count
    }
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tiến trình</h1>
        <p className="text-muted-foreground">Theo dõi sự tiến bộ của bạn theo thời gian</p>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="exercises">Bài tập</TabsTrigger>
          <TabsTrigger value="calendar">Lịch tập</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng số buổi tập</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workouts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {workoutsThisMonth.length > workoutsLastMonth.length ? "+" : ""}
                  {workoutsThisMonth.length - workoutsLastMonth.length} so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng thời gian tập</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)} giờ</div>
                <p className="text-xs text-muted-foreground">
                  {workoutsThisMonth.reduce((sum, w) => sum + w.duration, 0) / 60} giờ trong tháng này
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng số set</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSets}</div>
                <p className="text-xs text-muted-foreground">
                  {workoutsThisMonth.reduce((sum, w) => sum + w.totalSets, 0)} set trong tháng này
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Nhóm cơ phổ biến</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{popularMuscleGroup}</div>
                <p className="text-xs text-muted-foreground">{popularMuscleGroupCount} buổi tập</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tần suất tập luyện</CardTitle>
              <CardDescription>Số buổi tập theo tuần</CardDescription>
            </CardHeader>
            <CardContent>
              {workouts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Chưa có dữ liệu tập luyện.</p>
                </div>
              ) : (
                <div className="h-[200px] flex items-end justify-between gap-2">
                  <div className="relative flex flex-col items-center">
                    <div className="h-[120px] w-12 bg-primary/20 rounded-md"></div>
                    <div className="absolute bottom-0 h-[80px] w-12 bg-primary rounded-md"></div>
                    <span className="mt-2 text-xs">T2</span>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="h-[120px] w-12 bg-primary/20 rounded-md"></div>
                    <div className="absolute bottom-0 h-[40px] w-12 bg-primary rounded-md"></div>
                    <span className="mt-2 text-xs">T3</span>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="h-[120px] w-12 bg-primary/20 rounded-md"></div>
                    <div className="absolute bottom-0 h-[100px] w-12 bg-primary rounded-md"></div>
                    <span className="mt-2 text-xs">T4</span>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="h-[120px] w-12 bg-primary/20 rounded-md"></div>
                    <div className="absolute bottom-0 h-[20px] w-12 bg-primary rounded-md"></div>
                    <span className="mt-2 text-xs">T5</span>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="h-[120px] w-12 bg-primary/20 rounded-md"></div>
                    <div className="absolute bottom-0 h-[90px] w-12 bg-primary rounded-md"></div>
                    <span className="mt-2 text-xs">T6</span>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="h-[120px] w-12 bg-primary/20 rounded-md"></div>
                    <div className="absolute bottom-0 h-[60px] w-12 bg-primary rounded-md"></div>
                    <span className="mt-2 text-xs">T7</span>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="h-[120px] w-12 bg-primary/20 rounded-md"></div>
                    <div className="absolute bottom-0 h-[30px] w-12 bg-primary rounded-md"></div>
                    <span className="mt-2 text-xs">CN</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiến trình theo bài tập</CardTitle>
              <CardDescription>Theo dõi sự tiến bộ của từng bài tập</CardDescription>
            </CardHeader>
            <CardContent>
              {workouts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Chưa có dữ liệu tập luyện.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Bench Press</div>
                      <div className="text-sm text-muted-foreground">+10kg trong 2 tháng</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[75%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <div>60kg</div>
                      <div>70kg</div>
                      <div>80kg</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Squat</div>
                      <div className="text-sm text-muted-foreground">+15kg trong 2 tháng</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[60%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <div>80kg</div>
                      <div>95kg</div>
                      <div>110kg</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Deadlift</div>
                      <div className="text-sm text-muted-foreground">+20kg trong 2 tháng</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[80%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <div>100kg</div>
                      <div>120kg</div>
                      <div>140kg</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch tập luyện</CardTitle>
              <CardDescription>Xem lịch sử tập luyện của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {workouts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Chưa có dữ liệu tập luyện.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <div
                        key={day}
                        className={`
                          aspect-square flex items-center justify-center rounded-md text-sm
                          ${[3, 7, 10, 14, 17, 21, 24, 28].includes(day) ? "bg-primary text-primary-foreground" : "bg-muted"}
                        `}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-sm">Ngày tập</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted"></div>
                      <span className="text-sm">Ngày nghỉ</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Phân tích buổi tập</CardTitle>
              <CardDescription>Phân bổ thời gian tập theo nhóm cơ</CardDescription>
            </div>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chưa có dữ liệu tập luyện.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>Ngực</span>
                  </div>
                  <div className="w-full max-w-[70%] h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[30%]"></div>
                  </div>
                  <span className="text-sm">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Lưng</span>
                  </div>
                  <div className="w-full max-w-[70%] h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[25%]"></div>
                  </div>
                  <span className="text-sm">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Chân</span>
                  </div>
                  <div className="w-full max-w-[70%] h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[20%]"></div>
                  </div>
                  <span className="text-sm">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Vai</span>
                  </div>
                  <div className="w-full max-w-[70%] h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[15%]"></div>
                  </div>
                  <span className="text-sm">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Tay</span>
                  </div>
                  <div className="w-full max-w-[70%] h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[10%]"></div>
                  </div>
                  <span className="text-sm">10%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Mục tiêu</CardTitle>
              <CardDescription>Tiến độ mục tiêu hiện tại</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chưa có dữ liệu tập luyện.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Bench Press: 100kg</span>
                    <span className="text-sm">80%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[80%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Squat: 150kg</span>
                    <span className="text-sm">65%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[65%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Deadlift: 180kg</span>
                    <span className="text-sm">70%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[70%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Pull-up: 15 reps</span>
                    <span className="text-sm">60%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[60%]"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
