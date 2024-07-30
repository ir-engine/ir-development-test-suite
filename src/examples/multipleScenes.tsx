import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  defineComponent,
  defineQuery,
  defineSystem,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  useOptionalComponent
} from '@etherealengine/ecs'
import { GLTFComponent } from '@etherealengine/engine/src/gltf/GLTFComponent'
import { GLTFAssetState, GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { PrimitiveGeometryComponent } from '@etherealengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { GeometryTypeEnum } from '@etherealengine/engine/src/scene/constants/GeometryTypeEnum'
import { getMutableState, useHookstate, useImmediateEffect } from '@etherealengine/hyperflux'
import { DirectionalLightComponent, PhysicsPreTransformSystem, TransformComponent } from '@etherealengine/spatial'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { computeTransformMatrix } from '@etherealengine/spatial/src/transform/systems/TransformSystem'
import { GLTF } from '@gltf-transform/core'
import React, { useEffect } from 'react'
import { Cache, Color, Euler, MathUtils, Matrix4, MeshLambertMaterial, Quaternion, Vector3 } from 'three'
import { Transform } from './utils/transform'

const TestSuiteBallTagComponent = defineComponent({ name: 'TestSuiteBallTagComponent' })
let physicsEntityCount = 0
export const createPhysicsEntity = (sceneEntity: Entity) => {
  const entity = createEntity()

  const i = physicsEntityCount++

  const position = new Vector3(Math.random() * 10 - 5, Math.random() * 2 + 2, Math.random() * 10 - 5)
  setComponent(entity, UUIDComponent, ('Ball-' + i) as EntityUUID)
  setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity })
  setComponent(entity, TransformComponent, { position, scale: new Vector3(2, 2, 2) })
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, RigidBodyComponent, { type: 'dynamic' })
  setComponent(entity, TestSuiteBallTagComponent)

  const colliderEntity = createEntity()
  setComponent(colliderEntity, VisibleComponent, true)
  setComponent(colliderEntity, UUIDComponent, ('Ball-' + i + '-collider') as EntityUUID)
  setComponent(colliderEntity, EntityTreeComponent, { parentEntity: entity })
  setComponent(colliderEntity, TransformComponent, { scale: new Vector3(0.25, 0.25, 0.25) })
  setComponent(colliderEntity, ColliderComponent, {
    shape: 'sphere',
    mass: MathUtils.randFloat(0.5, 1.5),
    friction: MathUtils.randFloat(0.1, 1.0),
    restitution: MathUtils.randFloat(0.1, 1.0)
  })
  setComponent(colliderEntity, PrimitiveGeometryComponent, {
    geometryType: GeometryTypeEnum.SphereGeometry
  })
  setComponent(colliderEntity, InputComponent)

  return entity
}

// create scene with a rigidbody loaded offset from the origin
const createSceneGLTF = (id: string): GLTF.IGLTF => ({
  asset: {
    version: '2.0',
    generator: 'iR Engine'
  },
  scenes: [{ nodes: [0] }],
  scene: 0,
  nodes: [
    {
      matrix: [5, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 5, 0, 0, 1, 0, 1],
      name: 'Rigidbody',
      extensions: {
        EE_uuid: 'rigidbody-' + id,
        EE_visible: true,
        EE_rigidbody: {
          type: 'fixed'
        },
        EE_collider: {
          shape: 'box'
        },
        EE_primitive_geometry: {
          geometryType: 0,
          geometryParams: {
            width: 1,
            height: 1,
            depth: 1
          }
        }
      }
    }
  ],
  extensionsUsed: ['EE_uuid', 'EE_visible', 'EE_rigidbody', 'EE_collider', 'EE_primitive_geometry']
})

const SceneReactor = (props: {
  coord: Vector3
  transform: { position: Vector3; rotation: Quaternion; scale: Vector3 }
}) => {
  const { coord, transform } = props

  const gltfEntityState = useHookstate(UndefinedEntity)
  const gltfComponent = useOptionalComponent(gltfEntityState.value, GLTFComponent)

  useEffect(() => {
    const sceneID = `scene-${coord.x}-${coord.z}`
    const gltf = createSceneGLTF(sceneID)

    const sceneURL = `/${sceneID}.gltf`

    Cache.add(sceneURL, gltf)

    const gltfEntity = GLTFSourceState.load(sceneURL, sceneURL as EntityUUID)
    getMutableComponent(Engine.instance.viewerEntity, RendererComponent).scenes.merge([gltfEntity])
    setComponent(gltfEntity, SceneComponent)
    getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)

    gltfEntityState.set(gltfEntity)

    return () => {
      GLTFSourceState.unload(gltfEntity)
      getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)
    }
  }, [])

  useEffect(() => {
    const gltfEntity = gltfEntityState.value

    // reset transform
    setComponent(gltfEntity, TransformComponent, {
      position: coord
        .clone()
        .sub(new Vector3(0.5, 0, 0.5))
        .multiplyScalar(gridSpacing),
      rotation: new Quaternion(),
      scale: new Vector3(0.5, 0.5, 0.5)
    })

    // apply transform state
    const transformComponent = getComponent(gltfEntity, TransformComponent)
    const mat4 = new Matrix4()
    transformComponent.matrix.multiply(mat4.compose(transform.position, transform.rotation, transform.scale))
    transformComponent.matrix.decompose(
      transformComponent.position,
      transformComponent.rotation,
      transformComponent.scale
    )
    computeTransformMatrix(gltfEntity)
  }, [transform.position, transform.rotation, transform.scale])

  useEffect(() => {
    if (gltfComponent?.progress?.value !== 100) return
    const entities = [] as Entity[]
    for (let i = 0; i < 10; i++) {
      entities.push(createPhysicsEntity(gltfEntityState.value))
    }
    return () => {
      for (const entity of entities) {
        removeEntity(entity)
      }
    }
  }, [gltfComponent?.progress?.value])

  return null
}

const testSuiteBallTagQuery = defineQuery([TestSuiteBallTagComponent])

const execute = () => {
  for (const entity of testSuiteBallTagQuery()) {
    const rigidbody = getComponent(entity, RigidBodyComponent)
    const transform = getComponent(entity, TransformComponent)
    if (rigidbody.position.y < -10) {
      transform.position.set(Math.random() * 10 - 5, Math.random() * 2 + 2, Math.random() * 10 - 5)
    }

    const colliderEntity = getComponent(entity, EntityTreeComponent).children[0]

    const isPointerOver = getComponent(colliderEntity, InputComponent).inputSources.length > 0
    const materialInstance = getOptionalComponent(colliderEntity, MaterialInstanceComponent)
    if (!materialInstance) continue
    const materialEntity = UUIDComponent.getEntityByUUID(materialInstance.uuid[0])
    const material = getComponent(materialEntity, MaterialStateComponent).material as MeshLambertMaterial
    material.color.set(isPointerOver ? 'red' : 'white')
  }
}

export const BallResetSystem = defineSystem({
  uuid: 'ee-development-test-suite.multiplescenes.ball-reset-system',
  insert: { before: PhysicsPreTransformSystem },
  execute
})

const gridCount = 3
const gridSpacing = 10

export default function MultipleScenesEntry() {
  useNetwork({ online: false })
  useLoadEngineWithScene()

  useImmediateEffect(() => {
    const lightEntity = createEntity()
    setComponent(lightEntity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(-4, -0.5, 0)) })
    setComponent(lightEntity, NameComponent, 'directional light')
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, DirectionalLightComponent, { intensity: 1, color: new Color(0xffffff) })
    getMutableComponent(Engine.instance.viewerEntity, RendererComponent).scenes.merge([lightEntity])

    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)
    const entity = Engine.instance.viewerEntity
    setComponent(entity, CameraOrbitComponent)
    setComponent(entity, InputComponent)
    getComponent(entity, CameraComponent).position.set(0, 3, 4)
  }, [])

  const coordsState = useHookstate<Vector3[]>([])

  useEffect(() => {
    const coords = [] as Vector3[]
    for (let i = -gridCount * 0.5; i < gridCount * 0.5; i++) {
      for (let j = -gridCount * 0.5; j < gridCount * 0.5; j++) {
        coords.push(new Vector3(i, 0, j))
      }
    }
    coordsState.set(coords)
  }, [])

  const transformState = useHookstate({
    position: new Vector3(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })

  return (
    <>
      {coordsState.value.map((coord) => (
        <SceneReactor key={`${coord.x}-${coord.z}`} coord={coord} transform={transformState.value} />
      ))}
      <div className="flex-grid pointer-events-auto absolute right-0 flex w-fit flex-col justify-start gap-1.5">
        <Transform transformState={transformState} />
      </div>
    </>
  )
}
