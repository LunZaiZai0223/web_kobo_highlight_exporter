import { useRef, ChangeEvent } from 'react'

import { Input } from '@/components/ui/input.tsx'

import { useDbContext } from '@/contexts/DbContext.tsx'

import { genDatabaseByFile, getBookListSqlResult, formatBookListSql } from '@/helpers/sqlHelpers.ts'
import { useBookListContext } from '@/contexts/BookListContext.tsx'

const HintText = () => {
  return (
    <div className={'p-5 border rounded-md'}>
      <strong className={'text-xl font-semibold mb-2'}>How to use it?</strong>
      <p className={'text-sm'}>
        Please connect your kobo device to your computer. You will find .KoboReader.sqlite that you should upload.
      </p>
    </div>
  )
}

const Uploader = () => {
  const fileUploadRef = useRef<null | HTMLInputElement>(null)
  const { setBookList } = useBookListContext()
  const { setDb } = useDbContext()

  const handleClickFileUpload = () => {
    const fileUploadElement = fileUploadRef.current
    if (!fileUploadElement) return

    fileUploadElement.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) {
      throw new Error('檔案不存在')
    }

    try {
      const db = await genDatabaseByFile(file)
      const bookListSqlResult = getBookListSqlResult(db)
      const formattedBookList = formatBookListSql(bookListSqlResult)
      setDb(db)
      setBookList(formattedBookList)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div
      className={'mb-4 flex justify-center align-middle border rounded-md p-5 cursor-pointer'}
      onClick={handleClickFileUpload}
    >
      <Input type={'file'} onChange={handleFileChange} ref={fileUploadRef} className={'hidden'} accept={'.sqlite'} />
      <span className={'text-sm'}>Please upload your .KoboReader.sqlite file here.</span>
    </div>
  )
}

const UploadFileArea = () => {
  return (
    <section className={'mt-6'}>
      <Uploader />
      <HintText />
    </section>
  )
}

export default UploadFileArea
