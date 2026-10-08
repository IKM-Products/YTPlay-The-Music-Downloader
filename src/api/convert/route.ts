import type { Request, Response } from "express"
import { spawn } from "child_process"

export interface ConvertRequestBody {
  url: string
  format: "mp3" | "mp4" | "m4a"
}

const getYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  )
  return match ? match[1] : null
}

export const convertHandler = async (req: Request, res: Response) => {
  try {
    const { url, format } = req.body as ConvertRequestBody

    const videoId = getYouTubeId(url)
    if (!videoId) {
      return res.status(400).json({ success: false, error: "Invalid YouTube URL." })
    }

    const validFormats = ["mp3", "mp4", "m4a"]
    if (!format || !validFormats.includes(format)) {
      return res.status(400).json({ success: false, error: "Invalid format requested." })
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const oembedRes = await fetch(oembedUrl)

    if (!oembedRes.ok) {
      return res.status(400).json({ success: false, error: "Could not fetch YouTube video info." })
    }

    const oembedData = (await oembedRes.json()) as { title?: string }
    const title = oembedData.title || "Downloaded Media"

    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format=${format}`

    return res.status(200).json({
      success: true,
      title,
      downloadUrl,
    })
  } catch (error: any) {
    console.error("Conversion Handler Error:", error)
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process YouTube link.",
    })
  }
}

export const downloadHandler = async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string
    const format = ((req.query.format as string) || "mp3").toLowerCase()

    const videoId = getYouTubeId(url)
    if (!videoId) {
      return res.status(400).send("Invalid YouTube URL.")
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const oembedRes = await fetch(oembedUrl)
    const oembedData = (await oembedRes.json().catch(() => ({}))) as { title?: string }

    const rawTitle = oembedData.title || "download"
    const sanitizedTitle = rawTitle.replace(/[^a-zA-Z0-9_ -]/g, "")

    let mimeType = "audio/mpeg"
    let formatArg = "ba[ext=m4a]/ba/b"

    if (format === "mp4") {
      mimeType = "video/mp4"
      formatArg = "bv[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b"
    } else if (format === "m4a") {
      mimeType = "audio/mp4"
      formatArg = "ba[ext=m4a]/ba"
    }

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(sanitizedTitle)}.${format}"`
    )
    res.setHeader("Content-Type", mimeType)

    const ytProcess = spawn("npx", [
      "yt-dlp",
      "-f",
      formatArg,
      "-o",
      "-",
      `https://www.youtube.com/watch?v=${videoId}`,
    ], { shell: true })

    ytProcess.stdout.pipe(res)

    ytProcess.stderr.on("data", (data) => {
      console.error(`yt-dlp stderr: ${data}`)
    })

    ytProcess.on("error", (err) => {
      console.error("yt-dlp process spawn error:", err)
      if (!res.headersSent) {
        res.status(500).send("Download process failed.")
      }
    })

    req.on("close", () => {
      ytProcess.kill()
    })
  } catch (error: any) {
    console.error("Download Error:", error)
    if (!res.headersSent) {
      res.status(500).send("Download failed.")
    }
  }
}