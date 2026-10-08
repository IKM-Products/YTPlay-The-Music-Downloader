import { DownloadForm } from "@/components/DownloadForm"
import { useDownloadStore } from "@/store/useDownloadStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function App() {
  const downloads = useDownloadStore((state) => state.downloads)

  return (
    <main className="min-h-screen bg-background text-foreground p-8 space-y-8 max-w-4xl mx-auto">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">YTPlay - Music Downloader</h1>
        <p className="text-muted-foreground">Download audio directly from YouTube URLs</p>
      </header>

      <DownloadForm />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Download Queue</h2>
        {downloads.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No active downloads yet.</p>
        ) : (
          downloads.map((item) => (
            <Card key={item.id}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>{item.url}</span>
                  <span className="uppercase text-xs px-2 py-1 bg-muted rounded">{item.format}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={item.progress} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Status: {item.status}</span>
                  <span>{item.progress}%</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  )
}