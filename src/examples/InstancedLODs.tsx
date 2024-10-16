import { Entity, QueryReactor, getComponent, setComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { useGLTF } from '@ir-engine/engine/src/assets/functions/resourceLoaderHooks'
import { DomainConfigState } from '@ir-engine/engine/src/assets/state/DomainConfigState'
import { InstancingComponent } from '@ir-engine/engine/src/scene/components/InstancingComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { VariantComponent } from '@ir-engine/engine/src/scene/components/VariantComponent'
import { NO_PROXY, getState } from '@ir-engine/hyperflux'
import '@ir-engine/ir-bot/src/functions/BotHookSystem'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { InstancedBufferAttribute, Matrix4, Vector3 } from 'three'
import { useRouteScene } from '../sceneRoute'
import { useExampleEntity } from './utils/common/entityUtils'

// create random instance matrix
const matrices = [] as number[]
const mat4 = new Matrix4()

for (let i = 0; i < 1000; i++) {
  mat4.makeRotationY(Math.random() * Math.PI * 2)
  mat4.elements[12] = Math.random() * 100 - 50
  mat4.elements[13] = 0
  mat4.elements[14] = Math.random() * 100 - 50
  matrices.push(...mat4.elements)
}

const instanceMatrix = new InstancedBufferAttribute(new Float32Array(matrices), 16)

/** Force assets to be cached */
const VariantResourceReactor = ({ level }) => {
  useGLTF(level.src)
  return null
}

const VariantMeshReactor = (props: { entity: Entity }) => {
  useEffect(() => {
    setComponent(props.entity, InstancingComponent, { instanceMatrix })
  }, [])
  return null
}

const VariantReactor = () => {
  const entity = useEntityContext()

  const variantComponent = useComponent(entity, VariantComponent)

  useEffect(() => {
    setComponent(entity, InstancingComponent, { instanceMatrix })
    setComponent(entity, ModelComponent, { src: getComponent(entity, VariantComponent).levels[0].src })
  }, [])

  const children = useChildrenWithComponents(entity, [MeshComponent])

  return (
    <>
      {children.map((child, index) => (
        <VariantMeshReactor key={index} entity={child} />
      ))}
      {variantComponent.get(NO_PROXY).levels.map((level, index) => (
        <VariantResourceReactor key={index} level={level} />
      ))}
    </>
  )
}

const SceneReactor = ({ sceneEntity }) => {
  const entity = useExampleEntity(sceneEntity!)

  useEffect(() => {
    setComponent(entity, TransformComponent, { position: new Vector3(0, 2, -2) })
    setComponent(entity, VisibleComponent)
    setComponent(entity, NameComponent, 'GLTF Viewer')
    // create src from blob url
    setComponent(entity, ModelComponent, {
      src:
        getState(DomainConfigState).cloudDomain +
        '/projects/ir-engine/ir-development-test-suite/assets/LOD/GrassInstanceLOD.gltf'
    })
  }, [])

  return <QueryReactor Components={[VariantComponent]} ChildEntityReactor={VariantReactor} />
}

export default function InstancedLODs() {
  const sceneEntity = useRouteScene()
  if (!sceneEntity) return null

  return <SceneReactor sceneEntity={sceneEntity} />
}
