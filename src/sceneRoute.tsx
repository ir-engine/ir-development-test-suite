// @ts-ignore
import styles from './sceneRoute.css?inline'

import React, { useEffect, useRef, useState } from 'react'

import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { useEngineCanvas } from '@etherealengine/client-core/src/hooks/useEngineCanvas'
import '@etherealengine/client-core/src/world/LocationModule'
import { staticResourcePath } from '@etherealengine/common/src/schema.type.module'
import { Entity, getComponent, setComponent } from '@etherealengine/ecs'
import '@etherealengine/engine/src/EngineModule'
import { GLTFAssetState } from '@etherealengine/engine/src/gltf/GLTFState'
import { useHookstate, useImmediateEffect, useMutableState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi2'
import { SearchParamState } from '@etherealengine/client-core/src/common/services/RouterService'

type Metadata = {
  name: string
  description: string
}

type SubRoute = Metadata & {
  props: {}
}

export type RouteData = Metadata & {
  entry: (...args: any[]) => any
  sub?: SubRoute[]
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

const Header = (props: { header: string }) => {
  return (
    <div className="NavBarHeaderContainer">
      <h1 className="NavBarHeaderText">{props.header}</h1>
    </div>
  )
}

export const useRouteScene = (projectName = 'ee-development-test-suite', sceneName = 'public/scenes/Examples.gltf') => {
  useLoadScene({ projectName: projectName, sceneName: sceneName })
  useNetwork({ online: false })
  useLoadEngineWithScene()
  const sceneKey = `projects/${projectName}/${sceneName}`
  const assetQuery = useFind(staticResourcePath, { query: { key: sceneKey, type: 'scene' } })

  const gltfState = useMutableState(GLTFAssetState)
  const sceneEntity = useHookstate<undefined | Entity>(undefined)
  const viewerEntity = useMutableState(EngineState).viewerEntity.value

  useEffect(() => {
    if (!assetQuery.data[0]) return
    const sceneURL = assetQuery.data[0].url
    if (!gltfState[sceneURL].value) return
    const entity = gltfState[sceneURL].value
    if (entity) sceneEntity.set(entity)
  }, [assetQuery.data, gltfState])

  useImmediateEffect(() => {
    if (!viewerEntity) return
    setComponent(viewerEntity, CameraOrbitComponent)
    setComponent(viewerEntity, InputComponent)
    getComponent(viewerEntity, CameraComponent).position.set(0, 3, 4)

    // SearchParamState.set('spectate', '')
  }, [viewerEntity])

  return sceneEntity
}

const routeKey = 'route'
const subRouteKey = 'subroute'

const Routes = (props: { routes: RouteData[]; header: string }) => {
  const { routes, header } = props
  const [currentRoute, setCurrentRoute] = useState(null as null | number)
  const [currentSubRoute, setCurrentSubRoute] = useState(0)
  const hidden = useHookstate(false)

  const ref = useRef(null as null | HTMLDivElement)

  useEngineCanvas(ref)

  const onClick = (routeIndex: number) => {
    setCurrentRoute(routeIndex)
    setCurrentSubRoute(0)
  }

  const onSubClick = (subIndex: number) => {
    setCurrentSubRoute(subIndex)
  }

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const routeIndexStr = urlParams.get(routeKey) as any
    if (routeIndexStr) {
      const routeIndex = Number(routeIndexStr)
      setCurrentRoute(routeIndex)
      const subIndexStr = urlParams.get(subRouteKey) as any
      if (subIndexStr) {
        const subIndex = Number(subIndexStr)
        setCurrentSubRoute(subIndex)
      }
    }
  }, [])

  useEffect(() => {
    if (currentRoute === null) return
    const url = new URL(window.location.href)
    url.searchParams.set(routeKey, currentRoute.toString())
    url.searchParams.set(subRouteKey, currentSubRoute.toString())
    window.history.pushState(null, '', url.toString())
  }, [currentRoute, currentSubRoute])

  const selectedRoute = currentRoute !== null ? routes[currentRoute] : null
  const selectedSub = selectedRoute && selectedRoute.sub && selectedRoute.sub[currentSubRoute]
  const Entry = selectedRoute && selectedRoute.entry
  const subProps = selectedSub ? selectedSub.props : {}

  return (
    <>
      <style type="text/css">{styles.toString()}</style>
      <div className="ScreenContainer">
        <Button
          className="z-10 mb-1 px-0"
          rounded="full"
          variant="outline"
          style={{ position: 'absolute', top: '10px', left: hidden.value ? '10px' : '310px', pointerEvents: 'all' }}
          onClick={() => hidden.set(!hidden.value)}
          startIcon={
            hidden.value ? (
              <HiChevronDoubleRight className="pointer-events-none place-self-center text-theme-primary" />
            ) : (
              <HiChevronDoubleLeft className="pointer-events-none place-self-center text-theme-primary" />
            )
          }
        />
        <div className="NavBarContainer" style={{ zIndex: '100', width: hidden.value ? '0%' : '' }}>
          <Header header={header} />
          <div className="NavBarSelectionContainer">
            {routes.map((route, index) => {
              const title = route.name
              const desc = route.description
              return (
                <React.Fragment key={title}>
                  <div
                    className={index === currentRoute ? 'SelectedItemContainer' : 'RouteItemContainer'}
                    onClick={() => onClick(index)}
                  >
                    <div className="RouteItemTitle">{title}</div>
                    <div className="RouteItemDescription">{desc}</div>
                  </div>
                  {index === currentRoute && routes[currentRoute]?.sub && (
                    <div className="SubItemsContainer">
                      {routes[currentRoute].sub?.map((sub, subIndex) => {
                        const subTitle = sub.name
                        const subDesc = sub.description
                        return (
                          <div
                            key={subTitle}
                            className={subIndex === currentSubRoute ? 'SelectedItemContainer' : 'RouteItemContainer'}
                            onClick={() => onSubClick(subIndex)}
                          >
                            <div className="RouteItemTitle">{subTitle}</div>
                            <div className="RouteItemDescription">{subDesc}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
        <div id="examples-panel" ref={ref} style={{ flexGrow: 1, pointerEvents: 'none' }} />
        {Entry && <Entry {...subProps} />}
      </div>
    </>
  )
}

export default Routes
