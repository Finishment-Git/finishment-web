import { useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { ProjectImage } from './types'

interface ImageUploadSectionProps {
  userId: string | undefined
  projectImages: ProjectImage[]
  setProjectImages: React.Dispatch<React.SetStateAction<ProjectImage[]>>
}

export function ImageUploadSection({ userId, projectImages, setProjectImages }: ImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    uploadingRef.current = true
    const supabase = createClient()
    const uploadedUrls: ProjectImage[] = []

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file. Please upload only images.`)
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Please upload images smaller than 5MB.`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${userId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('order-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
            alert(`Storage bucket not found. Please contact support to set up the 'order-images' bucket in Supabase Storage.`)
          } else {
            alert(`Failed to upload ${file.name}: ${uploadError.message}`)
          }
          continue
        }

        const { data: signedData, error: signedError } = await supabase.storage
          .from('order-images')
          .createSignedUrl(filePath, 86400)

        if (signedError || !signedData?.signedUrl) {
          console.error('Signed URL error:', signedError)
          alert(`Failed to get preview URL for ${file.name}. Image uploaded but preview may not display.`)
          continue
        }

        uploadedUrls.push({ url: signedData.signedUrl, fileName: file.name, fileSize: file.size, fileType: file.type })
      }

      setProjectImages(prev => [...prev, ...uploadedUrls])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Image upload error:', err)
      alert(`Error uploading images: ${message}`)
    } finally {
      uploadingRef.current = false
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e5e7eb' }} className="order-form-section">
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000000' }}>
        Project Images (Optional but always helpful for order accuracy)
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
        Upload photos of your project if you think it will help us understand your requirements better.
      </p>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload}
        style={{ display: 'none' }} />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '10px 20px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '16px',
        }}
      >
        Upload
      </button>

      {projectImages.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {projectImages.map((img, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img src={img.url} alt={img.fileName || `Project image ${index + 1}`}
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              <button type="button" onClick={() => removeImage(index)}
                style={{
                  position: 'absolute', top: '4px', right: '4px', background: '#dc2626', color: '#fff',
                  border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
                }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
