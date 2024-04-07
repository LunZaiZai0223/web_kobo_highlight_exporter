import { useState, ChangeEvent, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import initSqlJs from 'sql.js'
import { BookListSQL } from 'src/helpers'

function App() {
  const [count, setCount] = useState(0)
  const sqlRef = useRef<any>()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event)
    const target = event.target as HTMLInputElement

    const file = target.files![0]
    const reader = new FileReader()
    reader.onload = function () {
      const UInt8Array = new Uint8Array(reader.result as any)
      initSqlJs().then(function (SQL) {
        const db = new SQL.Database(UInt8Array)
        // 執行一個查詢示例
        const res = db.exec(BookListSQL) // 將 "your_table_name" 替換成您的實際表格名稱
        console.log(res)
        // 在這裡處理結果
      })
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
      <div>
        <input type={'file'} onChange={handleFileChange} />
      </div>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App
