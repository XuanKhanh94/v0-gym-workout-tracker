
"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UploadProps {
    multiple?: boolean
    accept?: string
    maxFiles?: number
    onUpload: (imageUrls: string[]) => void // callback trả về các URL ảnh đã upload
}

export function Upload({ multiple = false, accept, maxFiles, onUpload }: UploadProps) {
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)

    const uploadToCloudinary = async (file: File): Promise<string | null> => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", "workout_images") // Tên preset unsigned của bạn

        const res = await fetch("https://api.cloudinary.com/v1_1/dklivukql/image/upload", {
            method: "POST",
            body: formData,
        })

        if (!res.ok) {
            console.error("Lỗi khi upload:", await res.text())
            return null
        }

        const data = await res.json()
        return data.secure_url
    }

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                const selectedFiles = Array.from(e.target.files)
                if (maxFiles && selectedFiles.length > maxFiles) {
                    alert(`Chỉ được chọn tối đa ${maxFiles} ảnh`)
                    return
                }

                setFiles(selectedFiles)
                setUploading(true)

                const urls: string[] = []
                for (const file of selectedFiles) {
                    const url = await uploadToCloudinary(file)
                    if (url) urls.push(url)
                }

                setUploading(false)
                onUpload(urls) // Trả về danh sách URL ảnh sau khi upload thành công
            }
        },
        [maxFiles, onUpload]
    )

    return (
        <div className="flex items-center gap-2">
            <Input
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                id="upload-input"
            />
            <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("upload-input")?.click()}
                disabled={uploading}
            >
                {uploading ? "Đang tải lên..." : "Chọn ảnh"}
            </Button>
            {files.length > 0 && (
                <span className="text-sm text-muted-foreground">
                    {uploading ? "Đang tải lên..." : `Đã chọn ${files.length} ảnh`}
                </span>
            )}
        </div>
    )
}
