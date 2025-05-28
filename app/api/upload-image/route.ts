import { v2 as cloudinary } from "cloudinary"
import { NextResponse } from "next/server"

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File
        const workoutId = formData.get("workoutId") as string

        if (!file || !workoutId) {
            return NextResponse.json({ error: "Thiếu file hoặc workoutId" }, { status: 400 })
        }

        // Chuyển file thành Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Tải lên Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `workouts/${workoutId}`,
                    upload_preset: "workout_images", // Thay bằng upload preset của bạn
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            uploadStream.end(buffer)
        })

        const { secure_url } = uploadResult as { secure_url: string }
        return NextResponse.json({ imageUrl: secure_url })
    } catch (error) {
        console.error("Lỗi khi tải lên hình ảnh:", error)
        return NextResponse.json({ error: "Lỗi khi tải lên hình ảnh" }, { status: 500 })
    }
}