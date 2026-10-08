import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDownloadStore } from "@/store/useDownloadStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link2, Download } from "lucide-react"

const formSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine((val) => val.includes("youtube.com") || val.includes("youtu.be"), {
      message: "Must be a valid YouTube URL",
    }),
  format: z.enum(["mp3", "m4a"]),
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
      format: values.format,
    })
    reset()
  }

  return (
    <div className="w-full mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-2xl shadow-rose-500/5 transition-all duration-300 focus-within:border-rose-500/50 focus-within:ring-4 focus-within:ring-rose-500/10"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Input field with leading icon */}
          <div className="relative flex-1 w-full flex items-center">
            <Link2 className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Paste YouTube link here..."
                  className="pl-10 border-0 bg-transparent h-12 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                  {...field}
                />
              )}
            />
          </div>

          {/* Controls Group */}
          <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
            {/* Format Selector */}
            <Controller
              name="format"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-10 px-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-100 font-bold uppercase tracking-wider text-xs rounded-xl transition-all duration-200 w-24 focus:ring-1 focus:ring-rose-500/50 flex flex-row-reverse items-center justify-between [&>svg]:shrink-0">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="mp3" className="font-bold uppercase text-xs">MP3</SelectItem>
                    <SelectItem value="m4a" className="font-bold uppercase text-xs">M4A</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            {/* Primary Download Button */}
            <Button
              type="submit"
              className="h-10 px-5 bg-linear-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-semibold text-xs tracking-wide shadow-md shadow-rose-600/20 rounded-xl transition-all duration-200 active:scale-[0.98] w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {errors.url && (
        <p className="mt-2 text-xs font-medium text-rose-500 pl-4 flex items-center gap-1">
          {errors.url.message}
        </p>
      )}
    </div>
  )
}