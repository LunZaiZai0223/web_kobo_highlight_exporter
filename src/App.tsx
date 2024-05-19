import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast.ts'
import { Row } from '@tanstack/react-table'
import { clsx } from 'clsx'

import MainContainer from '@/components/MainContainer'
import Header from '@/components/Header'
import UploadFileArea from '@/components/UploadFileArea'
import BookHighlightDialog from '@/components/BookHighlightDialog'
import { DataTable, columns } from '@/components/Table'

import { Book, BookHighlight } from '@/types'

import { NO_HIGHLIGHT_ERROR } from '@/constants'

import DbContextProvider, { useDbContext } from '@/contexts/DbContext.tsx'
import BookListContextProvider, { useBookListContext } from '@/contexts/BookListContext.tsx'

import { getTargetBookHighlightAndAnnotationSql, formatBookHighlightAndAnnotationSql } from '@/helpers/sqlHelpers.ts'

const TableArea = () => {
  const { bookList, setBookList } = useBookListContext()
  const { db } = useDbContext()
  const [bookDetail, setBookDetail] = useState<Book | undefined>()
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
      setBookDetail(original)
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
      <DataTable columns={columns} data={bookList} onClickTableRow={handleClickBook} />)
      <BookHighlightDialog
        bookHighlightInfo={bookHighlightInfo}
        onOpenDialog={() => setDialogType('BOOK_HIGHLIGHT')}
        onCloseDialog={() => setDialogType('')}
        isDialogOpen={dialogType === 'BOOK_HIGHLIGHT'}
      />
    </section>
  )
}

function App() {
  return (
    <DbContextProvider>
      <BookListContextProvider>
        <Header />
        <MainContainer>
          <UploadFileArea />
          <TableArea />
        </MainContainer>
      </BookListContextProvider>
    </DbContextProvider>
  )
}

export default App
