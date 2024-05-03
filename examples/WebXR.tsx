import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { Shelves } from '@etherealengine/client-core/src/components/Shelves'
import { XRLoading } from '@etherealengine/client-core/src/components/XRLoading'
import { Engine, setComponent } from '@etherealengine/ecs'
import { loadEmptyScene } from '@etherealengine/engine/tests/util/loadEmptyScene'
import { getMutableState } from '@etherealengine/hyperflux'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { BackgroundComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { Color } from 'three'

export default function WebXR() {
  useEffect(() => {
    getMutableState(RendererState).gridVisibility.set(true)
    const sceneEntity = loadEmptyScene()!
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
    setComponent(sceneEntity, BackgroundComponent, new Color('black'))
    setComponent(Engine.instance.viewerEntity, CameraOrbitComponent)
  }, [])

  return (
    <>
      <div style={{ pointerEvents: 'all' }}>
        <Shelves />
        <XRLoading />
        <MediaIconsBox />
      </div>
    </>
  )
}
