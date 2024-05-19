import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react'

import { Book } from '@/types'

type BookListContextType = {
  bookList: Book[]
  setBookList: Dispatch<SetStateAction<Book[]>>
}

const BookListContext = createContext<BookListContextType | null>(null)

const BookListContextProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [bookList, setBookList] = useState<Book[]>([])

  const ctxVal: BookListContextType = {
    bookList,
    setBookList,
  }

  return <BookListContext.Provider value={ctxVal}>{children}</BookListContext.Provider>
}

const useBookListContext = () => {
  const ctx = useContext(BookListContext)

  if (!ctx) {
    throw new Error(`useDbContext has to be used within <BookListContext.Provider>`)
  }

  return ctx
}

export { useBookListContext }

export default BookListContextProvider
