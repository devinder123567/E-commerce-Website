'use client'

import { useState } from 'react'

export function ProductImageGallery({ images }: { images: string[] }) {
  const defaultImage = images.length > 0 ? images[0] : '/placeholder.png'
  const [activeImage, setActiveImage] = useState(defaultImage)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-muted bg-muted/40">
        <img
          src={activeImage}
          alt="Active Product View"
          className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out cursor-zoom-in"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden bg-muted border-2 flex-shrink-0 transition-colors duration-150 ${
                activeImage === img ? 'border-primary' : 'border-transparent hover:border-muted-foreground/35'
              }`}
            >
              <img
                src={img}
                alt={`Product View ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
