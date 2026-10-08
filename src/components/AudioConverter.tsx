import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Loader2,
  Download,
  UploadCloud,
  FileAudio,
} from "lucide-react"

export function LocalAudioConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState<"m4a" | "mp3">("m4a")
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext === "mp3") {
      setTargetFormat("m4a")
      setSelectedFile(file)
      setError(null)
      setConvertedUrl(null)
    } else if (ext === "m4a") {
      setTargetFormat("mp3")
      setSelectedFile(file)
      setError(null)
      setConvertedUrl(null)
    } else {
      setError("Please select a valid .mp3 or .m4a audio file.")
      setSelectedFile(null)
    }
  }

  const convertAudio = async () => {
    if (!selectedFile) return
    setIsConverting(true)
    setProgress(10)
    setError(null)

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const arrayBuffer = await selectedFile.arrayBuffer()
      setProgress(30)

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      setProgress(60)

      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      )

      const source = offlineCtx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(offlineCtx.destination)
      source.start()

      const renderedBuffer = await offlineCtx.startRendering()
      setProgress(80)

      const wavBlob = audioBufferToWav(renderedBuffer)
      const newFileName = selectedFile.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`
      const finalBlob = new File([wavBlob], newFileName, { type: `audio/${targetFormat}` })

      const url = URL.createObjectURL(finalBlob)
      setConvertedUrl(url)
      setProgress(100)
    } catch {
      setError("Failed to convert audio file. Please try another file.")
    } finally {
      setIsConverting(false)
    }
  }

  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels
    const length = buffer.length * numOfChan * 2 + 44
    const out = new DataView(new ArrayBuffer(length))
    let channels: Float32Array[] = []
    let sampleRate = buffer.sampleRate
    let offset = 0
    let pos = 0

    const setUint16 = (data: number) => {
      out.setUint16(pos, data, true)
      pos += 2
    }
    const setUint32 = (data: number) => {
      out.setUint32(pos, data, true)
      pos += 4
    }

    setUint32(0x46464952) // "RIFF"
    setUint32(length - 8)
    setUint32(0x45564157) // "WAVE"
    setUint32(0x20746d66) // "fmt "
    setUint32(16)
    setUint16(1)
    setUint16(numOfChan)
    setUint32(sampleRate)
    setUint32(sampleRate * 2 * numOfChan)
    setUint16(numOfChan * 2)
    setUint16(16)
    setUint32(0x61746164) // "data"
    setUint32(length - pos - 4)

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    while (offset < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]))
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0
        out.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }
    return new Blob([out], { type: "audio/wav" })
  }

  return (
    <div className="space-y-6">
      {/* Header outside of the card */}
      <div className="space-y-1.5 border-b border-rose-200/60 dark:border-slate-800/80 pb-4 text-center">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Audio Converter
        </h2>
      </div>

      <Card className="border-rose-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg">
        <CardContent className="p-6 space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            accept=".mp3,.m4a"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-rose-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-slate-700 rounded-2xl p-6 text-center cursor-pointer transition-all bg-rose-50/30 dark:bg-slate-950/20"
          > 
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-slate-800/50 border border-rose-200/80 dark:border-slate-700/50 flex items-center justify-center text-rose-500 dark:text-slate-400 mb-4 shadow-inner">
                <UploadCloud className="w-8 h-8 text-rose-500 animate-[bounce_2s_infinite]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">
                {selectedFile ? selectedFile.name : "Click to select audio file"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Convert MP3 to M4A or M4A to MP3 directly in your browser</p>
          </div>

          {selectedFile && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3 text-xs font-medium">
                <FileAudio className="w-5 h-5 text-rose-500" />
                <span>Convert to <strong className="uppercase text-rose-600 dark:text-rose-400">{targetFormat}</strong></span>
              </div>
              <Button
                onClick={convertAudio}
                disabled={isConverting}
                className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert File"
                )}
              </Button>
            </div>
          )}

          {isConverting && (
            <div className="space-y-1.5">
              <Progress value={progress} className="h-2 bg-rose-100 dark:bg-slate-800" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{progress}%</span>
            </div>
          )}

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          {convertedUrl && selectedFile && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Conversion Ready!</span>
              </div>
              <a
                href={convertedUrl}
                download={selectedFile.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}