import { create } from 'zustand'

export interface DownloadItem {
  id: string
  url: string
  title: string
  format: 'mp3' | 'flac' | 'wav'
  status: 'idle' | 'downloading' | 'completed' | 'error'
  progress: number
}

interface DownloadStore {
  downloads: DownloadItem[]
  addDownload: (item: Omit<DownloadItem, 'id' | 'status' | 'progress'>) => void
  updateProgress: (id: string, progress: number, status?: DownloadItem['status']) => void
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  downloads: [],
  addDownload: (item) => set((state) => ({
    downloads: [
      ...state.downloads,
      { ...item, id: crypto.randomUUID(), status: 'downloading', progress: 0 }
    ]
  })),
  updateProgress: (id, progress, status) => set((state) => ({
    downloads: state.downloads.map((d) => 
      d.id === id ? { ...d, progress, ...(status && { status }) } : d
    )
  }))
}))