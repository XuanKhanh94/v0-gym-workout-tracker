"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, PlusCircle, Dumbbell } from "lucide-react"
import { getExerciseLibrary } from "@/lib/firebase-service"
import type { Exercise } from "@/lib/types"

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchExercises = async () => {
      const data = await getExerciseLibrary()
      setExercises(data)
      setLoading(false)
    }

    fetchExercises()
  }, [])

  // Lọc bài tập theo từ khóa tìm kiếm
  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Nhóm bài tập theo nhóm cơ
  const exercisesByMuscleGroup: Record<string, Exercise[]> = {}

  filteredExercises.forEach((exercise) => {
    if (!exercisesByMuscleGroup[exercise.muscleGroup]) {
      exercisesByMuscleGroup[exercise.muscleGroup] = []
    }
    exercisesByMuscleGroup[exercise.muscleGroup].push(exercise)
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Thư viện bài tập</h1>
          <p className="text-muted-foreground">Tất cả các bài tập cho chương trình của bạn</p>
        </div>
        <Link href="/exercises/new">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Thêm bài tập
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bài tập..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : Object.keys(exercisesByMuscleGroup).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Không tìm thấy bài tập nào.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(exercisesByMuscleGroup).map(([muscleGroup, exercises]) => (
            <div key={muscleGroup}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Dumbbell className="mr-2 h-5 w-5" />
                {muscleGroup}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map((exercise) => (
                  <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                    <Card className="h-full hover:bg-accent/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{exercise.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{exercise.equipment}</Badge>
                          <Badge variant="secondary">{exercise.difficulty}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
