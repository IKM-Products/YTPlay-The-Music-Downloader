import express from "express"
import cors from "cors"
import { convertHandler, downloadHandler } from "./src/api/convert/route"

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

app.post("/api/convert", convertHandler)
app.get("/api/download", downloadHandler)

app.listen(PORT, () => {
  console.log(`Conversion API server running on http://localhost:${PORT}`)
})