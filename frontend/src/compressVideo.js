/**
 * Compress a video File in the browser using &lt;video&gt; + Canvas + MediaRecorder.
 * Re-encodes to WebM at a lower bitrate to reduce file size before upload.
 *
 * @param {File} file  - Original video file
 * @param {object} opts
 * @param {number} opts.maxWidth      - Max pixel width  (default 720)
 * @param {number} opts.videoBitsPerSecond - Target bitrate (default 800 000)
 * @param {function} opts.onProgress  - Called with 0-100 progress
 * @returns {Promise<File>}           - Compressed video as a File object
 */
export default function compressVideo(file, opts = {}) {
  const {
    maxWidth = 720,
    videoBitsPerSecond = 800_000,
    onProgress,
  } = opts

  return new Promise((resolve, reject) => {
    // If the file is already small (< 50 MB), skip compression
    if (file.size < 50 * 1024 * 1024) {
      resolve(file)
      return
    }

    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'

    const url = URL.createObjectURL(file)
    video.src = url

    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file) // fallback to original
    }

    video.onloadedmetadata = () => {
      const scale = Math.min(1, maxWidth / video.videoWidth)
      const w = Math.round(video.videoWidth * scale)
      const h = Math.round(video.videoHeight * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')

      const stream = canvas.captureStream(24)
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm'

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond,
      })

      const chunks = []
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }

      recorder.onstop = () => {
        URL.revokeObjectURL(url)
        const blob = new Blob(chunks, { type: 'video/webm' })
        const compressedName = file.name.replace(/\.[^.]+$/, '') + '_compressed.webm'
        const compressed = new File([blob], compressedName, { type: 'video/webm' })
        resolve(compressed)
      }

      recorder.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(file) // fallback to original
      }

      recorder.start(100)

      const duration = video.duration
      function drawFrame() {
        if (video.ended || video.paused) return
        ctx.drawImage(video, 0, 0, w, h)
        if (onProgress && duration) {
          onProgress(Math.min(99, Math.round((video.currentTime / duration) * 100)))
        }
        requestAnimationFrame(drawFrame)
      }

      video.onplay = drawFrame
      video.onended = () => {
        if (onProgress) onProgress(100)
        recorder.stop()
      }

      video.play().catch(() => {
        URL.revokeObjectURL(url)
        resolve(file) // fallback
      })
    }
  })
}
