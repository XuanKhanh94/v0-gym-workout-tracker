"use client"

import { CalendarIcon, PlusCircle } from "lucide-react"
import { format, isSameDay } from "date-fns"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getWorkouts } from "@/lib/firebase-service"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/lib/auth-context"
import type { Workout } from "@/lib/types"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([])

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
                  <Link href={`/workouts/new?date=${selectedDate.toISOString()}`}>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Thêm buổi tập
                    </Button>
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-sm">Không thể thêm buổi tập cho ngày đã qua</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Buổi tập trong ngày</h4>
                {canAddWorkout ? (
                  <Link href={`/workouts/new?date=${selectedDate.toISOString()}`}>
                    <Button size="sm" variant="outline">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </Link>
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
