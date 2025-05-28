"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getExerciseLibrary } from "@/lib/firebase-service"
import type { Exercise } from "@/lib/types"

interface ExerciseSuggestionsProps {
    categories: string[]
    onSelectExercise: (exercise: Exercise) => void
}

export function ExerciseSuggestions({ categories, onSelectExercise }: ExerciseSuggestionsProps) {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (categories.length === 0) {
                setExercises([])
                return
            }

            setLoading(true)
            try {
                const allExercises = await getExerciseLibrary()

                // Filter exercises based on selected categories
                const filteredExercises = allExercises.filter((exercise) =>
                    categories.some(
                        (category) =>
                            exercise.category?.toLowerCase().includes(category.toLowerCase()) ||
                            exercise.name?.toLowerCase().includes(category.toLowerCase()),
                    ),
                )

                // Hiển thị tất cả bài tập liên quan, không giới hạn
                setExercises(filteredExercises)
            } catch (error) {
                console.error("Error fetching exercise suggestions:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSuggestions()
    }, [categories])

    if (categories.length === 0) {
        return null
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg">Bài tập gợi ý</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Dựa trên phân loại: {categories.join(", ")} ({exercises.length} bài tập)
                </p>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-muted-foreground">Đang tải gợi ý...</p>
                ) : exercises.length === 0 ? (
                    <p className="text-muted-foreground">Không có bài tập gợi ý cho phân loại này.</p>
                ) : (
                    <ScrollArea className="h-64 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-4">
                            {exercises.map((exercise) => (
                                <div
                                    key={exercise.id}
                                    className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                    onClick={() => onSelectExercise(exercise)}
                                >
                                    <h4 className="font-medium text-sm mb-1">{exercise.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                        {exercise.category}
                                    </Badge>
                                    {exercise.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exercise.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
