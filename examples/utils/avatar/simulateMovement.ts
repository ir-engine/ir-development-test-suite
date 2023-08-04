import { Quaternion } from 'three'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { V_010 } from '@etherealengine/engine/src/common/constants/MathConstants'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { defineQuery, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SimulationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { defineSystem, useSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'
import { RigidBodyComponent } from '@etherealengine/engine/src/physics/components/RigidBodyComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

// quaternion that represents a 1 degree turn on the y axis
const q = new Quaternion().setFromAxisAngle(V_010, Math.PI / 180)

const entitiesQuery = defineQuery([NetworkObjectComponent, RigidBodyComponent, AvatarComponent, AvatarRigComponent])
let entities = [] as Entity[]

const execute = () => {
  const entitiesLength = entitiesQuery().length
  if (entities.length !== entitiesLength) {
    entities = [...entitiesQuery()]
    for (const entity of entities) {
      // @todo improve this
      setInterval(() => {
        const uuid = getComponent(entity, UUIDComponent)
        const ikTargetLeftHand = NameComponent.entitiesByName[uuid + '_left']?.[0]
        const ikTargetRightHand = NameComponent.entitiesByName[uuid + '_right']?.[0]
        const transform = getComponent(entity, TransformComponent)
        if (ikTargetLeftHand) {
          const leftHandTransform = getComponent(ikTargetLeftHand, TransformComponent)
          leftHandTransform.position.set(Math.random(), Math.random(), Math.random()).add(transform.position)
        }
        if (ikTargetRightHand) {
          const rightHandTransform = getComponent(ikTargetRightHand, TransformComponent)
          rightHandTransform.position.set(Math.random(), Math.random(), Math.random()).add(transform.position)
        }
      }, 1000)
    }
  }
  // const x = Math.sin(Date.now() / 1000) * 0.2
  for (const entity of entities) {
    const rigidbody = getComponent(entity, RigidBodyComponent)
    // rigidbody.position.x = x
    // rigidbody.targetKinematicPosition.x = x
    rigidbody.body.setTranslation(rigidbody.position, true)
    rigidbody.targetKinematicRotation.multiply(q)
    const uuid = getComponent(entity, UUIDComponent)
    const headTargetEntity = NameComponent.entitiesByName[uuid + '_none']?.[0]
    if (headTargetEntity) {
      const rigComponent = getComponent(entity, AvatarRigComponent)
      const limitMultiplier = 1.1
      const headToFeetLength =
        (rigComponent.torsoLength + rigComponent.upperLegLength + rigComponent.lowerLegLength) * limitMultiplier
      const pivotHalfLength = rigComponent.upperLegLength * 0.5
      const minHeadHeight = (pivotHalfLength + rigComponent.lowerLegLength + rigComponent.footHeight) / limitMultiplier
      const headTargetY =
        (Math.sin(Engine.instance.elapsedSeconds * 2) + 1) * 0.5 * (headToFeetLength - minHeadHeight) + minHeadHeight
      const head = getComponent(headTargetEntity, TransformComponent)
      head.position.y = headTargetY + rigidbody.position.y
    }
  }
}

const SimulateAvatarMovementSystem = defineSystem({
  uuid: 'ee.development-test-suite.SimulateAvatarMovementSystem',
  execute
})

export const useSimulateMovement = () => {
  useSystem(SimulateAvatarMovementSystem, { with: SimulationSystemGroup })
}
