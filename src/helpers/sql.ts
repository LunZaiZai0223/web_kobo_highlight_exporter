import initSqlJs, { Database, QueryExecResult } from 'sql.js'

import { SQL_WASM_PATH, INITIALIZE_SQL_ERROR, UPLOAD_SQL_FILE_ERROR } from '@/constants'

import { Book, BookHighlight } from '@/types'

const BookListSQL = `SELECT
                    IFNULL(ContentID,'') as 'ContentID',
                    IFNULL(Title,'') as 'BookTitle',
                    IFNULL(Subtitle,'') as 'SubTitle',
                    IFNULL(Attribution,'') as 'Author',
                    IFNULL(Publisher,'') as 'Publisher',
                    IFNULL(ISBN,0) as 'ISBN',
                    IFNULL(date(DateCreated),'') as 'ReleaseDate',
                    IFNULL(Series,'') as 'Series',
                    IFNULL(SeriesNumber,0) as 'SeriesNumber',
                    IFNULL(AverageRating,0) as 'Rating',
                    IFNULL(___PercentRead,0) as 'ReadPercent',
                    IFNULL(CASE WHEN ReadStatus>0 THEN datetime(DateLastRead) END,'') as 'LastRead',
                    IFNULL(___FileSize,0) as 'FileSize',
                    IFNULL(CASE WHEN Accessibility=1 THEN 'Store' ELSE CASE WHEN Accessibility=-1 THEN 'Import' ELSE CASE WHEN Accessibility=6 THEN 'Preview' ELSE 'Other' END END END,'') as 'Source'
                  FROM content
                  WHERE ContentType=6 AND ___UserId IS NOT NULL AND ___UserId != '' AND ___UserId != 'removed'
                  ORDER BY Source desc, Title`

const TextAndAnnotationSQL = (contentID: string) => {
  return `SELECT
            TRIM(REPLACE(REPLACE(T.Text, CHAR(10), ''), CHAR(9), '')) AS 'Text',
            T.Annotation AS 'Annotation',
            T.ContextString AS 'ContextString'
          FROM content AS B
          INNER JOIN bookmark AS T ON B.ContentID = T.VolumeID
          WHERE B.ContentID = '${contentID}' AND T.Hidden = 'false'
          ORDER BY T.ContentID, T.ChapterProgress;`
}

const isUint8Array = (value: any): value is Uint8Array => {
  return value instanceof Uint8Array
}

const isArrayBuffer = (value: any): value is ArrayBuffer => {
  return value instanceof ArrayBuffer
}

const initSqlIns = async () => {
  return await initSqlJs({
    // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
    // You can omit locateFile completely when running in node
    // locateFile: (file) => `https://sql.js.org/dist/${file}`,
    locateFile: () => SQL_WASM_PATH,
  }).catch(() => Promise.reject(INITIALIZE_SQL_ERROR))
}

const genDatabaseByFile = (file: File): Promise<Database> => {
  return initSqlIns()
    .then((sql) => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsArrayBuffer(file)
        fileReader.onload = (fileEvent) => {
          const { result } = fileEvent.target ?? {}
          const bufferArray = isArrayBuffer(result)

          if (!bufferArray) {
            return reject(UPLOAD_SQL_FILE_ERROR)
          }

          const uint8Array = new Uint8Array(result)
          const db = new sql.Database(uint8Array)
          resolve(db)
        }
      })
    })
    .catch(() => Promise.reject('錯誤'))
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

const getBookListSqlResult = (database: Database) => {
  const [res] = database.exec(BookListSQL)

  return res
}

const getTargetBookHighlightAndAnnotationSql = (database: Database, targetBookContentId: string) => {
  const [res] = database.exec(TextAndAnnotationSQL(targetBookContentId))

  return res
}

export {
  initSqlIns,
  genDatabaseByFile,
  formatBookListSql,
  formatBookHighlightAndAnnotationSql,
  getBookListSqlResult,
  getTargetBookHighlightAndAnnotationSql,
  BookListSQL,
  TextAndAnnotationSQL,
  isUint8Array,
  isArrayBuffer,
}
