"use client"

import { CalendarIcon, PlusCircle } from "lucide-react"
import { format, isSameDay } from "date-fns"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getWorkouts, addWorkout } from "@/lib/firebase-service"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import type { Workout } from "@/lib/types"

interface NewWorkoutForm {
  name: string
  categories: string[]
  duration: string
  notes: string
  exercises: any[]
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([])
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false)
  const [newWorkout, setNewWorkout] = useState<NewWorkoutForm>({
    name: "",
    categories: [],
    duration: "",
    notes: "",
    exercises: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user } = useAuth()

  const workoutDates = useMemo(() => {
    return workouts.map((workout) => new Date(workout.date))
  }, [workouts])

  const canAddWorkout = selectedDate && selectedDate >= new Date(new Date().setHours(0, 0, 0, 0))

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (user) {
        try {
          const workoutsData = await getWorkouts()
          setWorkouts(workoutsData)
        } catch (error) {
          console.error("Error fetching workouts:", error)
        }
      }
    }

    fetchWorkouts()
  }, [user])

  useEffect(() => {
    if (date) {
      setSelectedDate(date)
    }
  }, [date])

  useEffect(() => {
    if (selectedDate) {
      const workoutsOnDate = workouts.filter((workout: Workout) => {
        const workoutDate = new Date(workout.date)
        return isSameDay(workoutDate, selectedDate)
      })
      setSelectedWorkouts(workoutsOnDate)
    }
  }, [selectedDate, workouts])

  const resetForm = () => {
    setNewWorkout({
      name: "",
      categories: [],
      duration: "",
      notes: "",
      exercises: [],
    })
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setNewWorkout((prev) => ({
        ...prev,
        categories: [...prev.categories, category],
      }))
    } else {
      setNewWorkout((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c !== category),
      }))
    }
  }

  const handleAddWorkout = async () => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để thêm buổi tập",
        variant: "destructive",
      })
      return
    }

    if (!selectedDate || !newWorkout.name || newWorkout.categories.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const workoutData = {
        name: newWorkout.name,
        category: newWorkout.categories.join(", "),
        categories: newWorkout.categories,
        date: selectedDate.toISOString(),
        duration: Number.parseInt(newWorkout.duration) || 0,
        notes: newWorkout.notes,
        exercises: [],
        totalSets: 0,
      }

      await addWorkout(workoutData)

      // Refresh workouts list
      const updatedWorkouts = await getWorkouts()
      setWorkouts(updatedWorkouts)

      // Reset form and close dialog
      resetForm()
      setIsAddWorkoutOpen(false)

      // Update selected workouts for the current date
      const workoutsOnDate = updatedWorkouts.filter((workout: Workout) => {
        const workoutDate = new Date(workout.date)
        return isSameDay(workoutDate, selectedDate)
      })
      setSelectedWorkouts(workoutsOnDate)

      toast({
        title: "Thành công",
        description: "Đã thêm buổi tập mới",
      })
    } catch (error) {
      console.error("Error adding workout:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm buổi tập. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = ["Ngực", "Lưng", "Vai", "Tay trước", "Tay sau", "Chân", "Bụng", "Cardio", "Full Body"]

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Lịch tập luyện</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd MMMM yyyy") : <span>Chọn ngày</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                workoutDates={workoutDates}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {selectedWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Không có buổi tập nào vào ngày này</p>
              <div className="space-y-2">
                {canAddWorkout ? (
                  <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Thêm buổi tập
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Thêm buổi tập mới</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="workout-name">Tên buổi tập *</Label>
                          <Input
                            id="workout-name"
                            value={newWorkout.name}
                            onChange={(e) => setNewWorkout((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Ví dụ: Tập ngực và vai"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Loại tập * (có thể chọn nhiều)</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {categories.map((category) => (
                              <div key={category} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`category-${category}`}
                                  checked={newWorkout.categories.includes(category)}
                                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer">
                                  {category}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="workout-duration">Thời gian (phút)</Label>
                          <Input
                            id="workout-duration"
                            type="number"
                            value={newWorkout.duration}
                            onChange={(e) => setNewWorkout((prev) => ({ ...prev, duration: e.target.value }))}
                            placeholder="60"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="workout-notes">Ghi chú</Label>
                          <Textarea
                            id="workout-notes"
                            value={newWorkout.notes}
                            onChange={(e) => setNewWorkout((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Ghi chú về buổi tập..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            resetForm()
                            setIsAddWorkoutOpen(false)
                          }}
                          disabled={isSubmitting}
                        >
                          Hủy
                        </Button>
                        <Button onClick={handleAddWorkout} disabled={isSubmitting}>
                          {isSubmitting ? "Đang thêm..." : "Thêm buổi tập"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <p className="text-muted-foreground text-sm">Không thể thêm buổi tập cho ngày đã qua</p>
                )}
                <Link href="/workouts/new">
                  <Button variant="outline" className="w-full">
                    Tạo buổi tập chi tiết
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Buổi tập trong ngày</h4>
                {canAddWorkout ? (
                  <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Thêm buổi tập mới</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="workout-name-2">Tên buổi tập *</Label>
                          <Input
                            id="workout-name-2"
                            value={newWorkout.name}
                            onChange={(e) => setNewWorkout((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Ví dụ: Tập ngực và vai"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Loại tập * (có thể chọn nhiều)</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {categories.map((category) => (
                              <div key={category} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`category-2-${category}`}
                                  checked={newWorkout.categories.includes(category)}
                                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                <Label
                                  htmlFor={`category-2-${category}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {category}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="workout-duration-2">Thời gian (phút)</Label>
                          <Input
                            id="workout-duration-2"
                            type="number"
                            value={newWorkout.duration}
                            onChange={(e) => setNewWorkout((prev) => ({ ...prev, duration: e.target.value }))}
                            placeholder="60"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="workout-notes-2">Ghi chú</Label>
                          <Textarea
                            id="workout-notes-2"
                            value={newWorkout.notes}
                            onChange={(e) => setNewWorkout((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Ghi chú về buổi tập..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            resetForm()
                            setIsAddWorkoutOpen(false)
                          }}
                          disabled={isSubmitting}
                        >
                          Hủy
                        </Button>
                        <Button onClick={handleAddWorkout} disabled={isSubmitting}>
                          {isSubmitting ? "Đang thêm..." : "Thêm buổi tập"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : null}
              </div>
              {selectedWorkouts.map((workout: Workout) => (
                <Link key={workout.id} href={`/workouts/${workout.id}`}>
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{workout.name}</h3>
                      <Badge>{workout.category}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{workout.exercises?.length || 0} bài tập</Badge>
                      <Badge variant="outline">{workout.totalSets || 0} sets</Badge>
                      <Badge variant="outline">{workout.duration || 0} phút</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
