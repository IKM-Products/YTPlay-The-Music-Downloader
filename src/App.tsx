import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDownloadStore } from "@/store/useDownloadStore"
import { DownloadForm } from "@/components/DownloadForm"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Music,
  Search,
  Disc3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Video,
  Sparkles,
} from "lucide-react"

const quickSearchSchema = z.object({
  searchQuery: z.string().optional(),
})

type QuickSearchValues = z.infer<typeof quickSearchSchema>

export default function App() {
  const downloads = useDownloadStore((state) => state.downloads)
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all")

  const { control, watch } = useForm<QuickSearchValues>({
    resolver: zodResolver(quickSearchSchema),
    defaultValues: { searchQuery: "" },
  })

  const searchQuery = watch("searchQuery") || ""

  const filteredDownloads = downloads.filter((item) => {
    const matchesQuery = (item.title || item.url).toLowerCase().includes(searchQuery.toLowerCase())
    if (activeTab === "active") return matchesQuery && item.status === "downloading"
    if (activeTab === "completed") return matchesQuery && item.status === "completed"
    return matchesQuery
  })

  return (
    <main className="min-h-screen bg-[#090a0f] text-slate-100 relative overflow-hidden flex flex-col justify-between selection:bg-rose-500 selection:text-white font-sans antialiased">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-112.5 bg-linear-to-b from-rose-600/15 via-red-500/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-rose-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-purple-600/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Grid Pattern Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-8 md:p-12 max-w-4xl mx-auto w-full space-y-12">
        {/* Header Branding */}
        <header className="text-center space-y-4 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold tracking-wide uppercase shadow-inner backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>High Quality Audio & Video Downloader</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight bg-linear-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
            YTPlay<span className="text-rose-500 inline-block animate-bounce">.</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Convert YouTube videos to ultra-high-fidelity <span className="text-slate-200 font-medium">MP3, MP4, FLAC</span>, and <span className="text-slate-200 font-medium">WAV</span> streams seamlessly.
          </p>
        </header>

        {/* Hero Form Component */}
        <div className="relative">
          <DownloadForm />
        </div>

        {/* Download Queue Section */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Download Queue
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-mono">
                {downloads.length}
              </span>
            </div>

            {/* Filter Tabs & Search Controls */}
            {downloads.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      activeTab === "all" ? "bg-rose-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      activeTab === "active" ? "bg-rose-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      activeTab === "completed" ? "bg-rose-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Done
                  </button>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <Controller
                    name="searchQuery"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="Filter queue..."
                        className="pl-8 h-8 text-xs w-36 sm:w-44 bg-slate-900/60 border-slate-800 text-slate-200 placeholder:text-slate-500 rounded-xl focus-visible:ring-1 focus-visible:ring-rose-500"
                        {...field}
                      />
                    )}
                  />
                </form>
              </div>
            )}
          </div>

          {/* Empty State */}
          {downloads.length === 0 ? (
            <div className="text-center py-20 px-4 border border-dashed border-slate-800/80 rounded-3xl bg-slate-900/20 backdrop-blur-xl transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <Disc3 className="w-8 h-8 animate-[spin_8s_linear_infinite] text-rose-500/80" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No downloads in queue</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Paste a valid YouTube URL in the form above to start extracting media files.
              </p>
            </div>
          ) : filteredDownloads.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/20 rounded-2xl border border-slate-800/50">
              No matching conversions found for "{searchQuery}".
            </div>
          ) : (
            /* Queue Items List */
            <div className="space-y-3">
              {filteredDownloads.map((item) => (
                <Card
                  key={item.id}
                  className="border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-lg hover:border-slate-700/80 transition-all duration-200 group overflow-hidden"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* Media Icon Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-rose-500/20 to-red-600/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
                      {item.format === "mp4" ? <Video className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                    </div>

                    {/* Main Content Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold truncate text-slate-100 group-hover:text-rose-400 transition-colors">
                          {item.title || item.url}
                        </p>
                        <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md font-mono shrink-0">
                          {item.format}
                        </span>
                      </div>

                      {/* Progress Bar & Status Meta */}
                      <div className="space-y-1.5">
                        <Progress
                          value={item.progress}
                          className="h-1.5 bg-slate-800"
                        />
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 capitalize font-medium">
                            {item.status === "downloading" && (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                                <span className="text-rose-400">Downloading...</span>
                              </>
                            )}
                            {item.status === "completed" && (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Completed</span>
                              </>
                            )}
                            {item.status === "error" && (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-rose-500">Failed</span>
                              </>
                            )}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-slate-300">
                            {item.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-slate-600 border-t border-slate-800/40 bg-slate-950/40 backdrop-blur-md">
        YTPlay Downloader &copy; {new Date().getFullYear()} — Built with React & Tailwind CSS
      </footer>
    </main>
  )
}