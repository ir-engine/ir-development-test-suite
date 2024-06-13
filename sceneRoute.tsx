import React, { useEffect, useRef, useState } from 'react'

import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import '@etherealengine/client-core/src/world/LocationModule'
import { Engine, Entity, getComponent, setComponent } from '@etherealengine/ecs'
import { GLTFAssetState } from '@etherealengine/engine/src/gltf/GLTFState'
import { useHookstate, useImmediateEffect, useMutableState } from '@etherealengine/hyperflux'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'

export type RouteData = {
  metadata?: {
    title?: string
    description?: string
  }
  page: (...args: any[]) => any
}

export const buttonStyle = {
  width: 'auto',
  height: '100%',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  padding: '8px',
  margin: '10px',
  borderStyle: 'solid',
  background: '#969696',
  cursor: 'pointer',
  boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)', // Adds a slight 3D effect with a box-shadow
  wordWrap: 'break-word',
  borderColor: 'rgba(31, 27, 72, 0.85)' // Sets the outline color to rgb(31, 27, 72, 0.85)
} as React.CSSProperties

const Navbar = (props: { header: string }) => {
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60px',
    backgroundColor: '#1d2125',
    color: '#e7e7e7'
  }

  const headingStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  }

  return (
    <div style={navbarStyle}>
      <h1 style={headingStyle}>{props.header}</h1>
    </div>
  )
}

export const useRouteScene = (projectName = 'ee-development-test-suite', sceneName = 'Examples.gltf') => {
  useLoadScene({ projectName: projectName, sceneName: sceneName })
  useNetwork({ online: false })
  useLoadEngineWithScene()

  const gltfState = useMutableState(GLTFAssetState)
  const sceneEntity = useHookstate<undefined | Entity>(undefined)

  useEffect(() => {
    const sceneURL = `projects/${projectName}/${sceneName}`
    if (!gltfState[sceneURL].value) return
    const entity = gltfState[sceneURL].value
    if (entity) sceneEntity.set(entity)
  }, [gltfState])

  useImmediateEffect(() => {
    const entity = Engine.instance.viewerEntity
    setComponent(entity, CameraOrbitComponent)
    setComponent(entity, InputComponent)
    getComponent(entity, CameraComponent).position.set(0, 0, 4)
  }, [])

  return sceneEntity
}

const Routes = (props: { routes: Record<string, RouteData>; prefix: string; header: string }) => {
  const { routes, prefix, header } = props
  const [currentRoute, setCurrentRoute] = useState('default')
  const [Page, setPage] = useState(null as null | ((...args: any[]) => any))

  const ref = useRef(null as null | HTMLDivElement)

  const onClick = (route: string) => {
    setCurrentRoute(route)
    setPage(routes[route].page)
  }

  useEffect(() => {
    if (!ref?.current) return

    const canvas = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer.domElement
    canvas.parentElement?.removeChild(canvas)
    ref.current.appendChild(canvas)

    getComponent(Engine.instance.viewerEntity, RendererComponent).needsResize = true

    const observer = new ResizeObserver(() => {
      getComponent(Engine.instance.viewerEntity, RendererComponent).needsResize = true
    })

    observer.observe(ref.current)
    return () => {
      observer.disconnect()
    }
  }, [ref])

  return (
    <>
      <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'row' }}>
        <div style={{ pointerEvents: 'all', overflow: 'auto', height: '100vh', width: '300px', background: '#2c2f33' }}>
          <Navbar header={header} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {Object.entries(routes).map(([route, data]) => {
              const pathTitle = route.replace(prefix, '').replace('.tsx', '')
              const title = data.metadata?.title ? data.metadata.title : pathTitle
              return (
                <button style={buttonStyle} key={pathTitle} onClick={() => onClick(route)}>
                  {title}
                </button>
              )
            })}
          </div>
        </div>
        <div id="examples-panel" ref={ref} style={{ flexGrow: 1, pointerEvents: 'none' }} />
      </div>
      {Page && <Page key={currentRoute} />}
    </>
  )
}

export default Routes
