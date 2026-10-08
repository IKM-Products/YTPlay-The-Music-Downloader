import type { Request, Response } from "express"
import ytdl from "@distube/ytdl-core"

export interface ConvertRequestBody {
  url: string
  format: "mp3" | "mp4" | "m4a"
}

// Request agent options to bypass basic YouTube bot blocks
const YTDL_OPTIONS: ytdl.getInfoOptions = {
  requestOptions: {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  },
}

export const convertHandler = async (req: Request, res: Response) => {
  try {
    const { url, format } = req.body as ConvertRequestBody

    if (!url || typeof url !== "string") {
      return res.status(400).json({ success: false, error: "A valid YouTube URL is required." })
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ success: false, error: "Invalid YouTube URL format." })
    }

    const validFormats = ["mp3", "mp4", "m4a"]
    if (!format || !validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: "Invalid format. Only 'mp3', 'mp4', and 'm4a' are allowed.",
      })
    }

    const info = await ytdl.getInfo(url, YTDL_OPTIONS)
    const title = info.videoDetails.title || "Downloaded Media"

    // Use relative path so Vite proxy routes it properly
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
      error: error.message || "Failed to extract YouTube video metadata.",
    })
  }
}

/**
 * Handles direct binary media streaming to browser
 */
export const downloadHandler = async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string
    const format = req.query.format as "mp3" | "mp4" | "m4a"

    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).send("Invalid or missing YouTube URL.")
    }

    const info = await ytdl.getInfo(url, YTDL_OPTIONS)
    const rawTitle = info.videoDetails.title || "download"
    const sanitizedTitle = rawTitle.replace(/[^a-zA-Z0-0_ -]/g, "")

    let filterOption: ytdl.Filter = "audioonly"
    let mimeType = "audio/mpeg"
    let fileExtension = format

    if (format === "mp4") {
      filterOption = "videoandaudio"
      mimeType = "video/mp4"
    } else if (format === "m4a") {
      filterOption = "audioonly"
      mimeType = "audio/mp4"
    } else {
      // Default to MP3 audio stream
      filterOption = "audioonly"
      mimeType = "audio/mpeg"
    }

    res.setHeader("Content-Disposition", `attachment; filename="${sanitizedTitle}.${fileExtension}"`)
    res.setHeader("Content-Type", mimeType)

    ytdl(url, {
      ...YTDL_OPTIONS,
      filter: filterOption,
      quality: format === "mp4" ? "highest" : "highestaudio",
    }).pipe(res)
  } catch (error: any) {
    console.error("Download Stream Error:", error)
    if (!res.headersSent) {
      res.status(500).send("Failed to stream downloaded content.")
    }
  }
}