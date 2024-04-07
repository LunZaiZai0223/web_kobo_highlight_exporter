import { useState, ChangeEvent, useEffect, useRef, ReactNode } from 'react'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/components/ui/use-toast.ts'
import { clsx } from 'clsx'

import initSqlJs, { SqlJsStatic, Database, QueryExecResult } from 'sql.js'
import { BookListSQL, TextAndAnnotationSQL, isArrayBuffer } from '@/helpers'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const TABLE_HEADERS = [
  {
    header: 'Title',
    className: 'text-center',
  },
  {
    header: 'Author',
    className: 'text-center',
  },
  {
    header: 'Publisher',
    className: 'text-center',
  },
  {
    header: 'ISBN',
    className: 'text-center',
  },
  {
    header: 'ReleaseDate',
    className: 'text-center',
  },
  {
    header: 'ReadPercent',
    className: 'text-center',
  },
  {
    header: 'LastRead',
    className: 'text-center',
  },
]

type Book = {
  title: string
  contentId: string
  author: string
  publisher: string
  isbn: string
  releaseDate: string
  readPercent: string
  lastRead: string
}

type BookHighlight = {
  highlightText: string
  annotation: string
}

type MainContainerProps = {
  children: ReactNode
}

const formatBookListSql = (result: QueryExecResult): Book[] => {
  const { values } = result

  return values.reduce((acc: Book[], val): Book[] => {
    const [
      contentId,
      title,
      subTitle,
      author,
      publisher,
      isbn,
      releaseDate,
      series,
      seriesNumber,
      rating,
      readPercent,
      lastRead,
    ] = val as string[]
    acc.push({
      contentId,
      title,
      author,
      publisher,
      isbn,
      releaseDate,
      readPercent,
      lastRead,
    })

    return acc
  }, [])
}

const formatBookHighlightAndAnnotationSql = (result: QueryExecResult): BookHighlight[] => {
  const { values } = result

  return values.reduce((acc: BookHighlight[], val) => {
    const [highlight, annotation = ''] = val as [string | null, string]

    if (highlight) {
      acc.push({
        highlightText: highlight,
        annotation,
      })
    }

    return acc
  }, [])
}

const genDatabaseByFile = (file: Uint8Array, sqlRef: SqlJsStatic) => {
  return new sqlRef.Database(file)
}

const getBookListSqlResult = (database: Database) => {
  const [res] = database.exec(BookListSQL)

  return res
}

const getTargetBookHighlightAndAnnotationSql = (database: Database, targetBookContentId: string) => {
  const [res] = database.exec(TextAndAnnotationSQL(targetBookContentId))

  return res
}

const Header = () => {
  return (
    <header className={clsx('px-5 py-5 border-b')}>
      <div>
        <h1>Web Kobo Highlight Exporter</h1>
      </div>
    </header>
  )
}

const MainContainer = (props: MainContainerProps) => {
  const { children } = props

  return <main className={'max-w-[1400px] px-8'}>{children}</main>
}

function App() {
  const [bookList, setBookList] = useState<Book[]>([])
  const [bookHighlightInfo, setBookHighlightInfo] = useState<BookHighlight[]>([])
  const [modalType, setModalType] = useState<'BOOK_HIGHLIGHT' | ''>('')

  console.log('[bookList]', bookList)

  const sqlRef = useRef<null | SqlJsStatic>(null)
  const databaseRef = useRef<null | Database>(null)
  const fileUploadRef = useRef<null | HTMLInputElement>(null)

  const { toast } = useToast()

  const handleClickBook = (targetBookContentId: string) => () => {
    if (!databaseRef.current) return

    try {
      const targetBookHighlightAndAnnotationSql = getTargetBookHighlightAndAnnotationSql(
        databaseRef.current,
        targetBookContentId,
      )

      const formattedBookHighlightAndAnnotationSql = formatBookHighlightAndAnnotationSql(
        targetBookHighlightAndAnnotationSql,
      )

      if (formattedBookHighlightAndAnnotationSql.length === 0) {
        throw new Error('No highlights at all.')
      }

      setModalType('BOOK_HIGHLIGHT')
      setBookHighlightInfo(formattedBookHighlightAndAnnotationSql)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No highlights at all.',
        duration: 2000,
      })
    }
  }

  const handleClickFileUpload = () => {
    const fileUploadElement = fileUploadRef.current
    if (!fileUploadElement) return

    fileUploadElement.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!sqlRef.current) return

    const target = event.target as HTMLInputElement

    const file = target.files![0]
    const reader = new FileReader()

    reader.onload = () => {
      if (!sqlRef.current) return
      try {
        const { result } = reader
        const bufferArray = isArrayBuffer(result)
        if (!bufferArray) return
        const uint8Array = new Uint8Array(result)
        databaseRef.current = genDatabaseByFile(uint8Array, sqlRef.current)
        const bookListSqlResult = getBookListSqlResult(databaseRef.current)
        const formattedBookListSql = formatBookListSql(bookListSqlResult)
        setBookList(formattedBookListSql)
      } catch (error) {
        console.error('解析書單錯誤')
      } finally {
        if (fileUploadRef.current) {
          fileUploadRef.current.value = ''
        }
      }
    }

    reader.readAsArrayBuffer(file)
  }

  useEffect(() => {
    const initSql = async () => {
      const SQL = await initSqlJs({
        // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
        // You can omit locateFile completely when running in node
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      })

      sqlRef.current = SQL
    }

    initSql()
  }, [])

  return (
    <>
      <Header />
      <MainContainer>
        <section className={'mt-6'}>
          <div
            className={'mb-4 flex justify-center align-middle border rounded-md p-5 cursor-pointer'}
            onClick={handleClickFileUpload}
          >
            <Input
              type={'file'}
              onChange={handleFileChange}
              ref={fileUploadRef}
              className={'hidden'}
              accept={'.sqlite'}
            />
            <span className={'text-sm'}>Please upload your .KoboReader.sqlite file here.</span>
          </div>
          <div className={'p-5 border rounded-md'}>
            <strong className={'text-xl font-semibold mb-2'}>How to use it?</strong>
            <p className={'text-sm'}>
              Please connect your kobo device to your computer. You will find .KoboReader.sqlite that you should upload.
            </p>
          </div>
        </section>
        <section className={clsx({ hidden: bookList.length === 0 })}>
          <Table>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
              <TableRow>
                {TABLE_HEADERS.map((header) => {
                  return (
                    <TableHead key={header.header} className={header.className}>
                      {header.header}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookList.map((book) => {
                return (
                  <TableRow
                    key={book.contentId}
                    onClick={handleClickBook(book.contentId)}
                    className={clsx('cursor-pointer')}
                  >
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.publisher}</TableCell>
                    <TableCell>{book.isbn}</TableCell>
                    <TableCell>{book.releaseDate}</TableCell>
                    <TableCell>{book.readPercent}</TableCell>
                    <TableCell>{book.lastRead}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            {/* <TableFooter> */}
            {/*   <TableRow> */}
            {/*     <TableCell colSpan={3}>Total</TableCell> */}
            {/*     <TableCell className="text-right">$2,500.00</TableCell> */}
            {/*   </TableRow> */}
            {/* </TableFooter> */}
          </Table>
        </section>
        <Dialog open={modalType === 'BOOK_HIGHLIGHT'} onOpenChange={(e) => setModalType(e ? 'BOOK_HIGHLIGHT' : '')}>
          {/* className="sm:max-w-[425px]" */}
          <DialogContent className={clsx('w-auto max-w-full overflow-hidden max-h-[90%]')}>
            <DialogHeader>
              <DialogTitle>Highlights</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6 grid gap-4">
              {bookHighlightInfo.map((info, index) => {
                return (
                  <div className="grid gap-4" key={info.highlightText}>
                    <strong>{`#${index + 1}`}</strong>
                    <p>{info.highlightText}</p>
                    {info.annotation && <span className={clsx('text-muted-foreground')}>{info.annotation}</span>}
                  </div>
                )
              })}
            </div>
            <DialogFooter className={'px-6'}>
              <Button variant={'default'}>Copy As Markdown</Button>
              <Button variant={'secondary'}>Copy As JSON</Button>
              <Button variant={'outline'}>Export As Markdown</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainContainer>
    </>
  )
}

export default App
