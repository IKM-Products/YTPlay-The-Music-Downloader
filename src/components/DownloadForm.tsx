import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDownloadStore } from "@/store/useDownloadStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine((val) => val.includes("youtube.com") || val.includes("youtu.be"), {
      message: "Must be a valid YouTube URL",
    }),
  format: z.enum(["mp3", "flac", "wav"]),
})

type FormValues = z.infer<typeof formSchema>

export function DownloadForm() {
  const addDownload = useDownloadStore((state) => state.addDownload)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "", format: "mp3" },
  })

  function onSubmit(values: FormValues) {
    addDownload({
      url: values.url,
      title: "Fetching video info...",
      format: values.format,
    })
    reset()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-xl mx-auto p-4 border rounded-xl shadow-sm"
    >
      <div className="space-y-1">
        <Controller
          name="url"
          control={control}
          render={({ field }) => (
            <Input placeholder="Paste YouTube link here..." {...field} />
          )}
        />
        {errors.url && (
          <p className="text-sm font-medium text-destructive">
            {errors.url.message}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <div className="w-32 space-y-1">
          <Controller
            name="format"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="flac">FLAC</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.format && (
            <p className="text-sm font-medium text-destructive">
              {errors.format.message}
            </p>
          )}
        </div>

        <Button type="submit" className="flex-1">
          Start Download
        </Button>
      </div>
    </form>
  )
}