import Image from "next/image"
import { Play } from "lucide-react"
import { useState } from "react"

interface VideoThumbnailProps {
  thumbnailUrl?: string | null
  title: string
  className?: string
}

// Generate a base64 encoded blur placeholder
const shimmerBlurDataUrl = `data:image/svg+xml;base64,${Buffer.from(
  `<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#f1f5f9" offset="20%" />
        <stop stop-color="#e2e8f0" offset="50%" />
        <stop stop-color="#f1f5f9" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="#f1f5f9" />
    <rect id="r" width="320" height="180" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-320" to="320" dur="1s" repeatCount="indefinite" />
  </svg>`
).toString("base64")}`

export function VideoThumbnail({ thumbnailUrl, title, className = "" }: VideoThumbnailProps) {
  const [imageError, setImageError] = useState(false)

  if (!thumbnailUrl || imageError) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl ${className}`}>
        <Play className="h-8 w-8 text-slate-400" />
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover rounded-xl"
        placeholder="blur"
        blurDataURL={shimmerBlurDataUrl}
        loading="lazy"
        onError={() => setImageError(true)}
      />
    </div>
  )
}