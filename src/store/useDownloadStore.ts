import { create } from 'zustand'

export interface DownloadItem {
  id: string
  url: string
  title: string
  format: 'mp3' | 'm4a'
  status: 'idle' | 'downloading' | 'completed' | 'error'
  progress: number
  errorMessage?: string
}

interface DownloadStore {
  downloads: DownloadItem[]
  addDownload: (item: { url: string; format: 'mp3' | 'm4a' }) => Promise<void>
  updateProgress: (id: string, progress: number, status?: DownloadItem['status']) => void
  removeDownload: (id: string) => void
  clearCompleted: () => void
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  downloads: [],

  addDownload: async ({ url, format }) => {
    const id = crypto.randomUUID()

    // 1. Add initial state to download queue
    const newItem: DownloadItem = {
      id,
      url,
      title: 'Fetching video info...',
      format,
      status: 'downloading',
      progress: 10,
    }

    set((state) => ({ downloads: [newItem, ...state.downloads] }))

    try {
      // 2. Call backend conversion endpoint
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process YouTube URL')
      }

      // 3. Update item with fetched video title
      set((state) => ({
        downloads: state.downloads.map((item) =>
          item.id === id
            ? { ...item, title: data.title, progress: 50 }
            : item
        ),
      }))

      // 4. Trigger file download via invisible link
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.setAttribute('download', '')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 5. Mark as completed
      set((state) => ({
        downloads: state.downloads.map((item) =>
          item.id === id
            ? { ...item, progress: 100, status: 'completed' }
            : item
        ),
      }))
    } catch (error: any) {
      // 6. Handle errors cleanly in state
      set((state) => ({
        downloads: state.downloads.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'error',
                errorMessage: error.message || 'Conversion failed',
                progress: 0,
              }
            : item
        ),
      }))
    }
  },

  updateProgress: (id, progress, status) =>
    set((state) => ({
      downloads: state.downloads.map((item) =>
        item.id === id
          ? { ...item, progress, ...(status && { status }) }
          : item
      ),
    })),

  removeDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.filter((item) => item.id !== id),
    })),

  clearCompleted: () =>
    set((state) => ({
      downloads: state.downloads.filter((item) => item.status !== 'completed'),
    })),
}))