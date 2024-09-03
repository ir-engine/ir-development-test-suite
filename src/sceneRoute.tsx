// @ts-ignore
import styles from './sceneRoute.css?inline'

import React, { useEffect } from 'react'

import { SearchParamState } from '@ir-engine/client-core/src/common/services/RouterService'
import { useLoadEngineWithScene, useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@ir-engine/client-core/src/components/World/LoadLocationScene'
import { useEngineCanvas } from '@ir-engine/client-core/src/hooks/useEngineCanvas'
import '@ir-engine/client-core/src/world/LocationModule'
import { useFind } from '@ir-engine/common'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { Entity, getComponent, setComponent } from '@ir-engine/ecs'
import '@ir-engine/engine/src/EngineModule'
import { GLTFAssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import {
  getMutableState,
  none,
  useHookstate,
  useImmediateEffect,
  useMutableState,
  useReactiveRef
} from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { HiChevronDown, HiChevronLeft, HiChevronRight, HiChevronUp } from 'react-icons/hi2'

export type RouteData = {
  name: string
  description: string
  entry: (...args: any[]) => any
  spawnAvatar?: boolean
}

export type RouteCategories = Array<{ category: string; routes: RouteData[] }>

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

export const useRouteScene = (
  projectName = 'ir-engine/ir-development-test-suite',
  sceneName = 'public/scenes/Examples.gltf'
) => {
  const viewerEntity = useMutableState(EngineState).viewerEntity.value
  useLoadScene({ projectName: projectName, sceneName: sceneName })
  useNetwork({ online: false })
  useLoadEngineWithScene()
  const sceneKey = `projects/${projectName}/${sceneName}`
  const assetQuery = useFind(staticResourcePath, { query: { key: sceneKey, type: 'scene' } })

  const gltfState = useMutableState(GLTFAssetState)
  const sceneEntity = useHookstate<undefined | Entity>(undefined)

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
  }, [viewerEntity])

  return sceneEntity
}

const getPathForRoute = (category: string, name: string) => {
  return (category.toLowerCase() + '_' + name.toLocaleLowerCase()).replace(' ', '_')
}

const Routes = (props: { routeCategories: RouteCategories; header: string }) => {
  const { routeCategories, header } = props
  const currentRoute = useMutableState(SearchParamState).example.value
  const categoriesShown = useHookstate({} as Record<string, boolean>)
  const hidden = useHookstate(false)

  const [ref, setRef] = useReactiveRef<HTMLDivElement>()

  useEngineCanvas(ref)

  const viewerEntity = useHookstate(getMutableState(EngineState).viewerEntity).value

  const onClick = (category: string, route: string) => {
    SearchParamState.set('example', getPathForRoute(category, route))
  }

  const selectedRoute = routeCategories.flatMap((route) =>
    route.routes.filter((r) => getPathForRoute(route.category, r.name) === currentRoute)
  )[0]

  useEffect(() => {
    if (selectedRoute?.spawnAvatar) SearchParamState.set('spectate', none)
    else SearchParamState.set('spectate', '')
  }, [selectedRoute])

  const Entry = selectedRoute && selectedRoute.entry

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
              <HiChevronRight className="pointer-events-none place-self-center text-theme-primary" />
            ) : (
              <HiChevronLeft className="pointer-events-none place-self-center text-theme-primary" />
            )
          }
        />
        <div className="NavBarContainer" style={{ zIndex: '100', width: hidden.value ? '0%' : '' }}>
          <Header header={header} />
          <div className="NavBarSelectionContainer">
            {routeCategories.map((category, index) => {
              const categoryShown = categoriesShown[category.category]
              return (
                <React.Fragment key={category.category}>
                  <div className="flex flex-row text-white">
                    <Button
                      className="m-2"
                      rounded="full"
                      variant="outline"
                      onClick={() => categoryShown.set(!categoryShown.value)}
                      endIcon={
                        <div className="m-1 flex w-full flex-row">
                          {categoryShown.value ? (
                            <HiChevronUp className="pointer-events-none m-1 place-self-center text-theme-primary" />
                          ) : (
                            <HiChevronDown className="pointer-events-none m-1 place-self-center text-theme-primary" />
                          )}
                        </div>
                      }
                    >
                      {category.category}
                    </Button>
                  </div>
                  {categoryShown.value &&
                    category.routes.map((route, index) => {
                      const title = route.name
                      const desc = route.description
                      const path = getPathForRoute(category.category, title)
                      return (
                        <React.Fragment key={title}>
                          <div
                            className={path === currentRoute ? 'SelectedItemContainer' : 'RouteItemContainer'}
                            onClick={() => onClick(category.category, title)}
                          >
                            <div className="RouteItemTitle">{title}</div>
                            <div className="RouteItemDescription">{desc}</div>
                          </div>
                        </React.Fragment>
                      )
                    })}
                </React.Fragment>
              )
            })}
          </div>
        </div>
        <div id="examples-panel" ref={setRef} style={{ flexGrow: 1, pointerEvents: 'none' }} />
        {viewerEntity && Entry && <Entry />}
      </div>
    </>
  )
}

export default Routes
