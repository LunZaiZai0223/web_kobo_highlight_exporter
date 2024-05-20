import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/components/ui/use-toast.ts'

import { BookHighlight } from '@/types'

import exporter from '@/helpers/exporter.ts'

type BookHighlightDialogProps = {
  bookHighlightInfo: BookHighlight[]
  isDialogOpen: boolean
  onOpenDialog: () => void
  onCloseDialog: () => void
}

enum ModalClickActionEnum {
  COPY_JSON = 'COPY_JSON',
  COPY_MARKDOWN = 'COPY_MARKDOWN',
}

// type ModalClickActionType = 'COPY_JSON' | 'COPY_MARKDOWN'

const copyToClipboard = (copiedStr: string) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(copiedStr)
  }

  return Promise.reject('The Clipboard API is not available.')
}

const BookHighlightDialog = (props: BookHighlightDialogProps) => {
  const { bookHighlightInfo, onOpenDialog, onCloseDialog, isDialogOpen } = props

  const { toast } = useToast()

  const generatedExporter = exporter(bookHighlightInfo)

  const handleOpenDialogChange = (event: boolean) => {
    if (event) {
      onOpenDialog()
    } else {
      onCloseDialog()
    }
  }

  const handleClickModalAction = (type: ModalClickActionEnum) => () => {
    let formattedContent = ''

    switch (type) {
      case ModalClickActionEnum.COPY_JSON:
        formattedContent = generatedExporter.toJSON()
        break

      case ModalClickActionEnum.COPY_MARKDOWN:
        formattedContent = generatedExporter.toMarkdown()
        break

      default:
        formattedContent = ''
    }

    if ([ModalClickActionEnum.COPY_JSON, ModalClickActionEnum.COPY_MARKDOWN].includes(type)) {
      copyToClipboard(formattedContent)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Copy success!',
        duration: 2000,
      })
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenDialogChange}>
      <DialogContent className={'overflow-hidden max-h-[90%] lg:max-w-full lg:w-auto rounded-lg max-w-[80%] w-full'}>
        <DialogHeader>
          <DialogTitle>Highlights</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6 grid gap-4">
          {bookHighlightInfo.map((info, index) => {
            return (
              <div className="grid gap-4" key={info.highlightText}>
                <strong>{`#${index + 1}`}</strong>
                <p>{info.highlightText}</p>
                {info.annotation && <span className={'text-muted-foreground'}>{info.annotation}</span>}
              </div>
            )
          })}
        </div>
        <DialogFooter className={'px-6'}>
          <Button variant={'default'} onClick={handleClickModalAction(ModalClickActionEnum.COPY_MARKDOWN)}>
            Copy As Markdown
          </Button>
          <Button variant={'secondary'} onClick={handleClickModalAction(ModalClickActionEnum.COPY_JSON)}>
            Copy As JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BookHighlightDialog
