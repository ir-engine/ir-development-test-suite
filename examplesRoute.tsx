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
const routes = import.meta.glob('./examples/*.tsx', { eager: true }) as Record<string, { default: () => JSX.Element }>

const RoutesList = () => {
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const path = e.currentTarget.innerText
    window.location.href = `/examples/${path}`
  }

  return (
    <div style={{ pointerEvents: 'all'}}>
      <center><h1>Examples</h1></center>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px'}}>
        {Object.entries(routes).map(([route, { default: Element }]) => {
          const path = route.replace('./examples/', '').replace('.tsx', '')
          return (
            <button style={buttonStyle} key={path} onClick={onClick}>
              {path}
            </button>
          )
        })}
      </div>
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
