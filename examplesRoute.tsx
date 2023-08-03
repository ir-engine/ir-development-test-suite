import React from 'react'
import { Route, Routes } from 'react-router-dom'

const buttonStyle = {
  width: 'auto',
  height: '100%',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  padding: '8px',
  margin: '10px',
  borderStyle: 'solid',
  background: 'none',
  cursor: 'pointer',
  outline: 'none'
}

//@ts-ignore
const routes = Object.fromEntries(Object.entries(import.meta.glob<any>('./examples/*.tsx')).map(([route, lazy]) => [route, React.lazy(lazy)]))

const RoutesList = () => {
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const path = e.currentTarget.innerText
    window.location.href = `/examples/${path}`
  }

  return (
    <div style={{ pointerEvents: 'all' }}>
      <h1>Examples</h1>
      {Object.entries(routes).map(([route]) => {
        const path = route.replace('./examples/', '').replace('.tsx', '')
        return (
          <div key={path} >
            <button style={buttonStyle} onClick={onClick}>
              {path}
            </button>
            <br />
          </div>
        )
      })}
    </div>
  )
}

const ExampleRoutes = () => {
  return (
    <Routes>
      {Object.entries(routes).map(([route, Page]) => {
        const path = route.replace('./examples', '').replace('.tsx', '')
        return <Route key={path} path={path} element={<Page />} />
      })}
      <Route path={'/'} element={<RoutesList />} />
    </Routes>
  )
}

export default ExampleRoutes
