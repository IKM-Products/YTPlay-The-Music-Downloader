import { useState, useEffect } from "react"
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
  Moon,
  Sun,
  Link2,
  Settings2,
  Download,
  Radio,
} from "lucide-react"

const quickSearchSchema = z.object({
  searchQuery: z.string().optional(),
})

type QuickSearchValues = z.infer<typeof quickSearchSchema>

export default function App() {
  const downloads = useDownloadStore((state) => state.downloads)
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all")
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Sync dark class on root document element
  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDarkMode])

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
    <main className="min-h-screen bg-rose-50/40 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 relative overflow-hidden flex flex-col justify-between selection:bg-rose-500 selection:text-white font-sans antialiased transition-colors duration-300">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-112.5 bg-linear-to-b from-rose-500/20 dark:from-rose-600/15 via-red-500/10 dark:via-red-500/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-rose-400/20 dark:bg-rose-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-amber-500/15 dark:bg-purple-600/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Grid Pattern Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f43f5e0a_1px,transparent_1px),linear-gradient(to_bottom,#f43f5e0a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-8 md:p-12 max-w-4xl mx-auto w-full space-y-12">
        {/* Header Controls (Home, How to Download & Theme Switcher) */}
        <div className="flex items-center justify-between pt-2">
          {/* Card Style Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-rose-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs">
            <a
              href="#"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50/80 dark:hover:bg-slate-800/60 transition-all"
            >
              Home
            </a>
            <a
              href="#how-to-download"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50/80 dark:hover:bg-slate-800/60 transition-all"
            >
              How to Download
            </a>
          </div>

          {/* Larger Theme Switcher Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-rose-50 dark:bg-[#111422] border border-rose-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 dark:hover:text-white hover:border-rose-300 dark:hover:border-slate-700 transition-all shadow-md active:scale-95 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-slate-200" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </button>
        </div>

        {/* Header Branding */}
        <header className="text-center space-y-4 pt-2">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight bg-linear-to-br from-rose-600 via-red-600 to-rose-950 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent drop-shadow-xs">
            YTPlay
          </h1>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold tracking-wide uppercase shadow-inner backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
            <span>The Music Downloader</span>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Convert YouTube videos to high-quality <span className="text-slate-900 dark:text-slate-200 font-semibold">MP3, MP4, </span>and <span className="text-slate-900 dark:text-slate-200 font-semibold">M4A</span> audio seamlessly.
          </p>
        </header>

        {/* Hero Form Component */}
        <div className="relative">
          <DownloadForm />
        </div>

        {/* Download Queue Section */}
        <section className="space-y-6 pt-4">
          <div className="space-y-4 border-b border-rose-200/60 dark:border-slate-800/80 pb-4 text-center">
            {/* Download Queue Header */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Download Queue
            </h2>

            {/* De-congested Filter Tabs & Search Controls */}
            {downloads.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-4 py-2">
                {/* Segmented Control Pill */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/80 border border-rose-200/80 dark:border-slate-800 shadow-sm">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "all"
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "active"
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "completed"
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    Done
                  </button>
                </div>

                {/* Filter Input */}
                <form onSubmit={(e) => e.preventDefault()} className="relative">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Controller
                    name="searchQuery"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="Filter queue..."
                        className="pl-10 pr-4 h-9 text-xs w-48 sm:w-56 bg-white/90 dark:bg-slate-900/80 border-rose-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-full focus-visible:ring-1 focus-visible:ring-rose-500 shadow-sm"
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
            <div className="text-center py-20 px-4 border border-dashed border-rose-200 dark:border-slate-800/80 rounded-3xl bg-white/70 dark:bg-slate-900/20 backdrop-blur-xl shadow-xs transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-slate-800/50 border border-rose-200/80 dark:border-slate-700/50 flex items-center justify-center text-rose-500 dark:text-slate-400 mb-4 shadow-inner">
                <Disc3 className="w-8 h-8 animate-[spin_8s_linear_infinite] text-rose-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">No downloads in queue</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Paste a valid YouTube URL in the form above to start extracting high-quality audio.
              </p>
            </div>
          ) : filteredDownloads.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-white/80 dark:bg-slate-900/20 rounded-2xl border border-rose-200/60 dark:border-slate-800/50">
              No matching conversions found.
            </div>
          ) : (
            /* Queue Items List */
            <div className="space-y-3">
              {filteredDownloads.map((item) => (
                <Card
                  key={item.id}
                  className="border-rose-100 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/40 backdrop-blur-xl shadow-md hover:shadow-lg dark:shadow-none hover:border-rose-200 dark:hover:border-slate-700/80 transition-all duration-200 group overflow-hidden"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* Media Icon Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-rose-500/20 to-red-600/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
                      {item.format === "mp4" ? <Video className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                    </div>

                    {/* Main Content Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {item.title || item.url}
                        </p>
                        <span className="uppercase text-xs font-bold px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-mono shrink-0 shadow-xs">
                          {item.format}
                        </span>
                      </div>

                      {/* Progress Bar & Status Meta */}
                      <div className="space-y-1.5">
                        <Progress
                          value={item.progress}
                          className="h-1.5 bg-rose-100 dark:bg-slate-800"
                        />
                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 capitalize font-medium">
                            {item.status === "downloading" && (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600 dark:text-rose-400" />
                                <span className="text-rose-600 dark:text-rose-400">Downloading...</span>
                              </>
                            )}
                            {item.status === "completed" && (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400">Completed</span>
                              </>
                            )}
                            {item.status === "error" && (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-rose-500">Failed</span>
                              </>
                            )}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
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

        {/* How to Download Section */}
        <section id="how-to-download" className="space-y-8 pt-8 border-t border-rose-200/60 dark:border-slate-800/60">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How to Download?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
              Follow these simple steps to convert and save high-quality audio in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <Card className="border-rose-100/90 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/30 backdrop-blur-xl relative overflow-hidden group hover:border-rose-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-lg group-hover:scale-105 transition-transform">
                  <Link2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Step 01</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Copy Video URL</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Open YouTube, navigate to your desired video, and copy the full URL from the address bar or share menu.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-rose-100/90 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/30 backdrop-blur-xl relative overflow-hidden group hover:border-rose-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-lg group-hover:scale-105 transition-transform">
                  <Settings2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Step 02</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Format</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Paste the link into the input box above and pick your target format like MP3, MP4, or M4A.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-rose-100/90 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/30 backdrop-blur-xl relative overflow-hidden group hover:border-rose-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-lg group-hover:scale-105 transition-transform">
                  <Download className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Step 03</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Convert & Save</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Click the Convert button, and your high-quality audio will be processed and saved automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-slate-500 dark:text-slate-600 border-t border-rose-200/60 dark:border-slate-800/40 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md">
        YTPlay &copy; {new Date().getFullYear()} — All rights reserved.
      </footer>
    </main>
  )
}