import { useState, useEffect, useRef } from 'react'
import { Trash2, Upload, ImageIcon } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminGalleryView({ token }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const fetchImages = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/gallery`)
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setImages(json.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImages() }, [])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select an image.'); return }
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('title', title)
      const res = await fetch(`${API_BASE}/api/admin/gallery`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: fd,
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setTitle('')
      setFile(null)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      fetchImages()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image from the gallery?')) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setImages(prev => prev.filter(img => img.id !== id))
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  return (
    <div className="max-w-6xl pt-6 pb-10 w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gallery Management</h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white border-2 border-slate-100 rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-700 mb-4">Upload New Image</h3>
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Image picker */}
          <label
            className="flex-shrink-0 h-28 w-28 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:border-[#0197B2] hover:bg-slate-100 transition overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImageIcon className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">Click to select</span>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleFileChange} />
          </label>

          <div className="flex-1 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Image title (optional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-[#0197B2] focus:outline-none focus:ring-2 focus:ring-[#0197B2]/20"
            />
            <button
              type="submit"
              disabled={uploading || !file}
              style={{ backgroundColor: '#0197B2' }}
              className="self-start inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload Image'}
            </button>
          </div>
        </div>
      </form>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-4 animate-spin mr-3" style={{ borderColor: '#e0f6fa', borderTopColor: '#0197B2' }} />
          <span className="text-slate-500 font-medium">Loading gallery…</span>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 bg-white border-2 border-slate-100 rounded-2xl">
          <ImageIcon className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No images uploaded yet.</p>
          <p className="text-sm text-slate-400 mt-1">Upload your first gallery image above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition">
              <img
                src={`${API_BASE}${img.image_url}`}
                alt={img.title || 'Gallery image'}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
              <div className="p-2.5">
                <p className="text-xs font-semibold text-slate-700 truncate">{img.title || <span className="italic text-slate-400">No title</span>}</p>
              </div>
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition shadow-md"
                title="Delete image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
