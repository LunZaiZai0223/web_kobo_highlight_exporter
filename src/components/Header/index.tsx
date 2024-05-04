import { clsx } from 'clsx'

const Header = () => {
  return (
    <header className={clsx('px-5 py-5 border-b')}>
      <div>
        <h1>Web Kobo Highlight Exporter</h1>
      </div>
    </header>
  )
}

export default Header
