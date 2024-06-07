import React, { useEffect, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import '@etherealengine/client-core/src/world/LocationModule'
import {
  Engine,
  Entity,
  UUIDComponent,
  createEntity,
  generateEntityUUID,
  getComponent,
  getMutableComponent,
  setComponent
} from '@etherealengine/ecs'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { useHookstate, useImmediateEffect } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import {
  EntityTreeComponent,
  removeEntityNodeRecursively
} from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Group } from 'three'

const buttonStyle = {
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

const Navbar = () => {
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60px',
    backgroundColor: 'rgb(31 27 72 / 85%)',
    color: '#e7e7e7'
  }

  const headingStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  }

  return (
    <div style={navbarStyle}>
      <h1 style={headingStyle}>Examples</h1>
    </div>
  )
}

//@ts-ignore
const importedMetadata = import.meta.glob<any>('./examples/componentExamples.tsx', {
  import: 'metadata',
  eager: true
})

type ExampleRouteData = {
  metadata?: {
    title?: string
    description?: string
  }
  page: (...args: any[]) => any
}
//@ts-ignore
const imports = import.meta.glob<any>('./examples/*.tsx')
const routes = Object.entries(imports).reduce(
  (prev, [route, lazy]) => ({
    ...prev,
    [route]: { page: React.lazy(lazy), metadata: importedMetadata[route] } as ExampleRouteData
  }),
  {}
) as Record<string, ExampleRouteData>

const ExampleViewPort = (props) => {
  const ref = useRef(null as null | HTMLDivElement)

  // useLoadScene({ projectName: 'default-project', sceneName: 'public/scenes/default.gltf' })
  // useNetwork({ online: false })
  // useLoadEngineWithScene()

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

  useImmediateEffect(() => {
    const entity = Engine.instance.viewerEntity
    setComponent(entity, CameraOrbitComponent)
    setComponent(entity, InputComponent)
  }, [])

  return (
    <div id="examples-panel" ref={ref} style={{ flexGrow: 1 }}>
      {props.children}
    </div>
  )
}

const ExampleScene = (props: { route: string; example: React.FC<{ scene: Entity }> }) => {
  const sceneEntity = useHookstate<undefined | Entity>(undefined)

  useEffect(() => {
    const route = props.route
    const viewerEntity = Engine.instance.viewerEntity
    const exampleScene = createEntity()
    setComponent(exampleScene, NameComponent, route)
    setComponent(exampleScene, UUIDComponent, generateEntityUUID())
    setComponent(exampleScene, TransformComponent)
    setComponent(exampleScene, EntityTreeComponent, { parentEntity: viewerEntity })
    setComponent(exampleScene, SourceComponent, route)
    const obj3d = new Group()
    obj3d.name = route
    obj3d.entity = exampleScene
    addObjectToGroup(exampleScene, obj3d)
    setComponent(exampleScene, Object3DComponent, obj3d)

    sceneEntity.set(exampleScene)
    const sceneComponent = getMutableComponent(Engine.instance.viewerEntity, SceneComponent)
    sceneComponent.children.merge([exampleScene])

    return () => {
      sceneComponent.children.set((entities) => {
        const index = entities.indexOf(exampleScene)
        if (index > -1) {
          entities.splice(index, 1)
        }
        return entities
      })
      removeEntityNodeRecursively(exampleScene)
    }
  }, [])

  const Example = props.example
  return <>{sceneEntity.value && Example && <Example scene={sceneEntity.value} />}</>
}

const RoutesList = () => {
  const [currentRoute, setCurrentRoute] = useState('default')
  const [Page, setPage] = useState(null as null | ((...args: any[]) => any))

  const onClick = (route: string) => {
    setCurrentRoute(route)
    setPage(routes[route].page)
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'row' }}>
      <div style={{ pointerEvents: 'all', overflow: 'auto', height: '100vh', width: '300px', background: '#02022d' }}>
        <Navbar />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))',
            gap: '10px',
            padding: '10px'
          }}
        >
          {Object.entries(routes).map(([route, data]) => {
            const pathTitle = route.replace('./examples/', '').replace('.tsx', '')
            const title = data.metadata?.title ? data.metadata.title : pathTitle
            return (
              <button style={buttonStyle} key={pathTitle} onClick={() => onClick(route)}>
                {title}
              </button>
            )
          })}
        </div>
      </div>
      <ExampleViewPort>
        <ExampleScene key={currentRoute} route={currentRoute} example={Page} />
      </ExampleViewPort>
    </div>
  )
}

const ExampleRoutes = () => {
  return (
    <Routes>
      {/* {routes.map(([route, Page]) => {
        const path = route.replace('./examples', '').replace('.tsx', '')
        return <Route key={path} path={path} element={<Page />} />
      })} */}
      <Route path={'/'} element={<RoutesList />} />
    </Routes>
  )
}

export default ExampleRoutes
