import { ColumnDef } from '@tanstack/react-table'

import { Book } from '@/types'

export const columns: ColumnDef<Book>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'author',
    header: 'Author',
  },
  {
    accessorKey: 'publisher',
    header: 'Publisher',
  },
  {
    accessorKey: 'isbn',
    header: 'Isbn',
  },
  {
    accessorKey: 'releaseDate',
    header: 'ReleaseDate',
    cell: ({ row }) => {
      const releaseDateVal = row.getValue('releaseDate')
      const formattedReleaseDateVal = typeof releaseDateVal === 'string' ? releaseDateVal.replaceAll('-', '/') : ''

      return <>{formattedReleaseDateVal}</>
    },
  },
  {
    accessorKey: 'readPercent',
    header: 'ReadPercent',
    cell: ({ row }) => {
      const readPercentVal = row.getValue('readPercent')
      const formattedReadPercentVal = `${readPercentVal} %`

      return <>{formattedReadPercentVal}</>
    },
  },
  {
    accessorKey: 'lastRead',
    header: 'LastRead',
    cell: ({ row }) => {
      const lastReadVal = row.getValue('lastRead')
      const formattedLastReadVal = typeof lastReadVal === 'string' ? lastReadVal.split(' ')[0].replaceAll('-', '/') : ''

      return <>{formattedLastReadVal || '-'}</>
    },
  },
]
