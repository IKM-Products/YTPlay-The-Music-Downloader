import type { Request, Response } from "express"
import ytdl from "@distube/ytdl-core"

export interface ConvertRequestBody {
  url: string
  format: "mp3" | "mp4" | "m4a"
}

const YTDL_OPTIONS: ytdl.getInfoOptions = {
  requestOptions: {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  },
}

export const convertHandler = async (req: Request, res: Response) => {
  try {
    const { url, format } = req.body as ConvertRequestBody

    if (!url || typeof url !== "string" || !ytdl.validateURL(url)) {
      return res.status(400).json({ success: false, error: "Invalid YouTube URL." })
    }

    const validFormats = ["mp3", "mp4", "m4a"]
    if (!format || !validFormats.includes(format)) {
      return res.status(400).json({ success: false, error: "Invalid format requested." })
    }

    // Fetch video details with automatic fallback
    let info
    try {
      info = await ytdl.getBasicInfo(url, YTDL_OPTIONS)
    } catch {
      info = await ytdl.getBasicInfo(url)
    }

    const title = info.videoDetails.title || "Downloaded Media"
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

    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).send("Invalid YouTube URL.")
    }

    let info
    try {
      info = await ytdl.getInfo(url, YTDL_OPTIONS)
    } catch {
      info = await ytdl.getInfo(url)
    }

    const sanitizedTitle = (info.videoDetails.title || "download").replace(/[^a-zA-Z0-9_ -]/g, "")

    let mimeType = "audio/mpeg"
    let options: ytdl.downloadOptions = {
      highWaterMark: 1 << 25,
    }

    if (format === "mp4") {
      mimeType = "video/mp4"
      options.filter = (f) => Boolean(f.hasVideo && f.hasAudio)
      options.quality = "highest"
    } else if (format === "m4a") {
      mimeType = "audio/mp4"
      options.filter = (f) =>
        Boolean(f.hasAudio && !f.hasVideo && (f.container === "mp4" || f.mimeType?.includes("audio/mp4")))
      options.quality = "highestaudio"
    } else {
      mimeType = "audio/mpeg"
      options.filter = "audioonly"
      options.quality = "highestaudio"
    }

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(sanitizedTitle)}.${format}"`
    )
    res.setHeader("Content-Type", mimeType)

    const stream = ytdl(url, options)

    stream.on("error", (err) => {
      console.error("YTDL Stream Error:", err)
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download stream" })
      } else {
        res.destroy(err)
      }
    })

    stream.pipe(res)
  } catch (error: any) {
    console.error("Download Error:", error)
    if (!res.headersSent) {
      res.status(500).send("Download failed.")
    }
  }
}