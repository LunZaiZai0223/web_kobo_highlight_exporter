import { Dispatch, SetStateAction, createContext, PropsWithChildren, useState, useContext } from 'react'

import { Database } from 'sql.js'

type DbContextType = {
  db: Database | null
  setDb: Dispatch<SetStateAction<Database | null>>
}

export const DbContext = createContext<DbContextType | null>(null)

const DbContextProvider = (props: PropsWithChildren) => {
  const [db, setDb] = useState<Database | null>(null)
  const { children } = props

  return (
    <DbContext.Provider
      value={{
        db,
        setDb,
      }}
    >
      {children}
    </DbContext.Provider>
  )
}

const useDbContext = () => {
  const dbContext = useContext(DbContext)

  if (!dbContext) {
    throw new Error(`useDbContext has to be used within <DbContext.Provider>`)
  }

  return dbContext
}

export { useDbContext }

export default DbContextProvider
