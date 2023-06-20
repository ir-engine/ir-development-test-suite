import { useRouter } from '@etherealengine/client-core/src/common/services/RouterService'
import React from 'react'
import { Route, Routes } from 'react-router-dom'

const buttonStyle = {
  width: 'auto',
  height: '100%',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  // border: 'none',
  padding: '8px',
  margin: '10px',
  borderStyle: 'solid',
  background: 'none',
  cursor: 'pointer',
  outline: 'none'
}

//@ts-ignore
const routes = import.meta.glob('./examples/*.tsx', { eager: true }) as Record<string, { default: () => JSX.Element }>

const RoutesList = () => {

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const path = e.currentTarget.innerText
    window.location.href = `/examples/${path}`
  }

  return (
    <div style={{ pointerEvents: 'all' }}>
      <h1>Examples</h1>
      {Object.entries(routes).map(([route, { default: Element }]) => {
        const path = route.replace('./examples/', '').replace('.tsx', '')
        return <>
          <button style={buttonStyle} key={path} onClick={onClick}>{path}</button><br />
        </>
      })}
    </div>
  )
}


const ExampleRoutes = () => {
  return (
    <Routes>
      {Object.entries(routes).map(([route, { default: Element }]) => {
        const path = route.replace('./examples', '').replace('.tsx', '')
        return <Route key={path} path={path} element={<Element />} />
      })}
      <Route path={'/'} element={<RoutesList />} />
    </Routes>
  )
}

export default ExampleRoutes
