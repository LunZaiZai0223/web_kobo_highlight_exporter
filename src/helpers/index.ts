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

export { BookListSQL, TextAndAnnotationSQL, isUint8Array, isArrayBuffer }
