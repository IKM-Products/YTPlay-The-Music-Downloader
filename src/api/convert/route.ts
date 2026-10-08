import type { Request, Response } from "express"
import ytDlp from "yt-dlp-exec"
import path from "path"
import fs from "fs"
import os from "os"

export interface ConvertRequestBody {
  url: string
  format: "mp3" | "m4a"
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

    const validFormats = ["mp3", "m4a"]
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

    const validFormats = ["mp3", "m4a"]
    if (!validFormats.includes(format)) {
      return res.status(400).send("Invalid format requested.")
    }

    const tmpDir = os.tmpdir()
    const fileBase = `ytplay_${Date.now()}_${videoId}`
    const outputFilePath = path.join(tmpDir, `${fileBase}.${format}`)

    // Download to temp directory first using audio-only options
    await ytDlp(`https://www.youtube.com/watch?v=${videoId}`, {
      format: "bestaudio/best",
      output: outputFilePath,
      noPlaylist: true,
      noWarnings: true,
    })

    if (!fs.existsSync(outputFilePath)) {
      return res.status(500).send("File generation failed.")
    }

    // Serve file and delete temporary file afterwards
    res.download(outputFilePath, (err) => {
      if (fs.existsSync(outputFilePath)) {
        fs.unlinkSync(outputFilePath)
      }
      if (err && !res.headersSent) {
        console.error("Download delivery error:", err)
      }
    })
  } catch (error: any) {
    console.error("Download Error:", error)
    if (!res.headersSent) {
      res.status(500).send("Download failed.")
    }
  }
}