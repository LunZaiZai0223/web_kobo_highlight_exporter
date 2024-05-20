import MainContainer from '@/components/MainContainer'
import Header from '@/components/Header'
import UploadFileArea from '@/components/UploadFileArea'
import TableArea from '@/components/TableArea'

import DbContextProvider from '@/contexts/DbContext.tsx'
import BookListContextProvider from '@/contexts/BookListContext.tsx'

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
