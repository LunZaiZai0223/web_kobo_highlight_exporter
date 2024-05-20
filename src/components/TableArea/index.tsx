import { useState } from 'react'
import { Row } from '@tanstack/react-table'
import { clsx } from 'clsx'

import { useBookListContext } from '@/contexts/BookListContext.tsx'
import { useDbContext } from '@/contexts/DbContext.tsx'

import { useToast } from '@/components/ui/use-toast.ts'
import { columns, DataTable } from '@/components/Table'
import BookHighlightDialog from '@/components/BookHighlightDialog'

import { Book, BookHighlight } from '@/types'
import { NO_HIGHLIGHT_ERROR } from '@/constants'
import { formatBookHighlightAndAnnotationSql, getTargetBookHighlightAndAnnotationSql } from '@/helpers'

const TableArea = () => {
  const { bookList } = useBookListContext()
  const { db } = useDbContext()

  const [bookHighlightInfo, setBookHighlightInfo] = useState<BookHighlight[]>([])
  const [dialogType, setDialogType] = useState<'BOOK_HIGHLIGHT' | ''>('')

  const { toast } = useToast()

  const handleClickBook = (bookRow: Row<Book>) => {
    if (!db) return

    const { original } = bookRow

    try {
      const targetBookHighlightAndAnnotationSql = getTargetBookHighlightAndAnnotationSql(db, original.contentId)
      const formattedBookHighlightAndAnnotationSql = formatBookHighlightAndAnnotationSql(
        targetBookHighlightAndAnnotationSql,
      )

      if (formattedBookHighlightAndAnnotationSql.length === 0) {
        throw new Error(NO_HIGHLIGHT_ERROR)
      }

      setDialogType('BOOK_HIGHLIGHT')
      setBookHighlightInfo(formattedBookHighlightAndAnnotationSql)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: NO_HIGHLIGHT_ERROR,
        duration: 2000,
      })
    }
  }

  return (
    <section className={clsx({ hidden: bookList.length === 0 })}>
      <DataTable columns={columns} data={bookList} onClickTableRow={handleClickBook} />
      <BookHighlightDialog
        bookHighlightInfo={bookHighlightInfo}
        onOpenDialog={() => setDialogType('BOOK_HIGHLIGHT')}
        onCloseDialog={() => setDialogType('')}
        isDialogOpen={dialogType === 'BOOK_HIGHLIGHT'}
      />
    </section>
  )
}

export default TableArea
