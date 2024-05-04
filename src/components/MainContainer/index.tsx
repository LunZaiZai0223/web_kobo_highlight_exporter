import { PropsWithChildren } from 'react'

const MainContainer = (props: PropsWithChildren) => {
  const { children } = props

  return <main className={'max-w-[1400px] px-8 mt-0 mx-auto mb-6'}>{children}</main>
}

export default MainContainer
