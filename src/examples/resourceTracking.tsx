import config from '@ir-engine/common/src/config'
import { Engine, Entity, getComponent, removeEntity, setComponent } from '@ir-engine/ecs'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { TransformComponent } from '@ir-engine/spatial'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { MathUtils } from 'three'
import { useRouteScene } from '../sceneRoute'
import { setupEntity } from './utils/common/entityUtils'

type AssetMetaData = {
  name: string
  endpoint: string
  type: 'image' | 'gltf'
}
const assets: AssetMetaData[] = [
  {
    name: 'Test Image',
    endpoint: '/projects/ir-engine/ir-development-test-suite/assets/Images/testImage.jpg',
    type: 'image'
  },
  {
    name: 'Flight Helmet',
    endpoint: '/projects/ir-engine/ir-development-test-suite/assets/GLTF/Flight%20Helmet/FlightHelmet.gltf',
    type: 'gltf'
  }
]

function getRandomPosition() {
  const position = getComponent(Engine.instance.cameraEntity, TransformComponent).position.clone()
  position.setZ(position.z - MathUtils.randFloat(4, 14))
  position.setX(position.x + MathUtils.randFloat(-3.0, 3.0))
  position.setY(0)
  return position
}

function createImage(parentEntity: Entity, endpoint: string) {
  const entity = setupEntity(parentEntity)
  const position = getRandomPosition()
  setComponent(entity, ImageComponent, {
    source: config.client.fileServer + endpoint
  })
  setVisibleComponent(entity, true)
  getComponent(entity, TransformComponent).position.set(position.x, position.y, position.z)

  return () => {
    removeEntity(entity)
  }
}

function createGLTF(parentEntity: Entity, endpoint: string) {
  const entity = setupEntity(parentEntity)
  const position = getRandomPosition()
  setComponent(entity, ModelComponent, {
    cameraOcclusion: true,
    src: config.client.fileServer + endpoint
  })
  setComponent(entity, ShadowComponent, { receive: false })
  setVisibleComponent(entity, true)
  getComponent(entity, TransformComponent).position.set(position.x, position.y, position.z)

  return () => {
    removeEntity(entity)
  }
}

function createAsset(entity: Entity, asset: AssetMetaData): () => void {
  switch (asset.type) {
    case 'image':
      return createImage(entity, asset.endpoint)
    case 'gltf':
      return createGLTF(entity, asset.endpoint)

    default:
      break
  }
  return () => {}
}

const removes = {} as Record<string, (() => void)[]>

function ResourceTrackingUI(props: { entity: Entity }) {
  const { entity } = props
  const buttonContainerClass = 'h-16 px-1.5	py-1 w-2/4'
  const buttonClass = 'h-full w-full basis-2/5 cursor-pointer'
  return (
    <div className="absolute bottom-0 right-0 h-1/4 w-1/4	bg-gray-900" style={{ pointerEvents: 'all', zIndex: 100 }}>
      {assets.map((asset) => {
        return (
          <div className="flex h-auto w-full" key={asset.endpoint}>
            <div className={buttonContainerClass}>
              <Button
                className={buttonClass}
                onClick={() => {
                  if (!removes[asset.name]) removes[asset.name] = []
                  removes[asset.name].push(createAsset(entity, asset))
                }}
              >{`Create ${asset.name}`}</Button>
            </div>
            <div className={buttonContainerClass}>
              <Button
                className={buttonClass}
                onClick={() => {
                  if (!removes[asset.name]) removes[asset.name] = []
                  removes[asset.name].pop()?.()
                }}
              >{`Remove ${asset.name}`}</Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ResourceTrackingRoute(props: {
  Reactor: React.FC<{ parent: Entity; onLoad: (entity: Entity) => void }>
}) {
  const sceneEntity = useRouteScene()
  console.log('ResourceTrackingRoute sceneEntity: ' + sceneEntity)
  return sceneEntity ? <ResourceTrackingUI entity={sceneEntity} /> : null
}
