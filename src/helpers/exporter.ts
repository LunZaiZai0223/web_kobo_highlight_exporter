import { BookHighlight } from '@/types'

const BASIC_MARKDOWN_SETTINGS = {
  highlightText: '###',
  annotation: '>',
}

const exporter = (bookHighlightInfo: BookHighlight[]) => {
  const toMarkdown = () => {
    const markdownedContent = bookHighlightInfo.reduce((accumualtor, currentValue) => {
      const markdownedHighlightText = `${BASIC_MARKDOWN_SETTINGS.highlightText} ${currentValue.highlightText}\n`
      const markdownedAnnotation = currentValue.annotation
        ? `${BASIC_MARKDOWN_SETTINGS.annotation} ${currentValue.annotation}\n\n`
        : `\n`
      return (accumualtor += `${markdownedHighlightText}${markdownedAnnotation}`)
    }, '')

    return markdownedContent
  }

  const toJSON = () => {
    return JSON.stringify(bookHighlightInfo.map((info) => ({ ...info, annotation: info.annotation || '' })))
  }

  return {
    toMarkdown,
    toJSON,
  }
}

export default exporter
