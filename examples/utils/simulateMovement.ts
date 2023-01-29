import { useEffect } from 'react'

import { UserId } from "@xrengine/common/src/interfaces/UserId"
import { AvatarLeftArmIKComponent, AvatarRightArmIKComponent, AvatarHeadIKComponent } from "@xrengine/engine/src/avatar/components/AvatarIKComponents"
import { Engine } from "@xrengine/engine/src/ecs/classes/Engine"
import { useEngineState } from "@xrengine/engine/src/ecs/classes/EngineState"
import { World } from "@xrengine/engine/src/ecs/classes/World"
import { defineQuery, getComponent } from "@xrengine/engine/src/ecs/functions/ComponentFunctions"
import { initSystems } from "@xrengine/engine/src/ecs/functions/SystemFunctions"
import { SystemUpdateType } from "@xrengine/engine/src/ecs/functions/SystemUpdateType"
import { RigidBodyComponent } from "@xrengine/engine/src/physics/components/RigidBodyComponent"
import { TransformComponent } from "@xrengine/engine/src/transform/components/TransformComponent"
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { AvatarRigComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { V_010 } from '@xrengine/engine/src/common/constants/MathConstants'
import { Quaternion } from 'three'

// quaternion that represents a 1 degree turn on the y axis
const q = new Quaternion().setFromAxisAngle(V_010, Math.PI / 180)

async function SimulateAvatarMovementSystem(world: World) {
  const entitiesQuery = defineQuery([NetworkObjectComponent, RigidBodyComponent, AvatarComponent, AvatarRigComponent])
  let entities = [] as Entity[]
  const execute = () => {
    const entitiesLength = entitiesQuery().length
    if (entities.length !== entitiesLength) {
      entities = []
      for (let i = 0; i < entitiesLength; i++) {
        const eid = world.getUserAvatarEntity('user' + i as UserId)
        if (eid) entities.push(eid)
      }
      for (const entity of entities) {
        // @todo improve this
        setInterval(() => {
          const { position } = getComponent(entity, RigidBodyComponent)
          const left = getComponent(entity, AvatarLeftArmIKComponent)
          left?.target.position.set(Math.random(), Math.random(), Math.random()).add(position)
          const right = getComponent(entity, AvatarRightArmIKComponent)
          right?.target.position.set(Math.random(), Math.random(), Math.random()).add(position)
        }, 1000)
      }
    }
    const x = Math.sin(Date.now() / 1000) * 0.2
    for (const entity of entities) {
      const rigidbody = getComponent(entity, RigidBodyComponent)
      // rigidbody.position.x = x
      // rigidbody.targetKinematicPosition.x = x
      rigidbody.body.setTranslation(rigidbody.position, true)
      rigidbody.targetKinematicRotation.multiply(q)

      const head = getComponent(entity, AvatarHeadIKComponent)
      if (head) {
        const rigComponent = getComponent(entity, AvatarRigComponent)
        const limitMultiplier = 1.1
        const headToFeetLength = (rigComponent.torsoLength + rigComponent.upperLegLength + rigComponent.lowerLegLength) * limitMultiplier
        const pivotHalfLength = rigComponent.upperLegLength * 0.5
        const minHeadHeight = (pivotHalfLength + rigComponent.lowerLegLength + rigComponent.footHeight) / limitMultiplier
        const headTargetY =
          (Math.sin(Engine.instance.currentWorld.elapsedSeconds * 2) + 1) * 0.5 * (headToFeetLength - minHeadHeight) +
          minHeadHeight
        head.target.position.y = headTargetY + rigidbody.position.y
      }
    }
  }

  return { execute, cleanup: async () => { } }
}


export const useSimulateMovement = () => {
  const engineState = useEngineState()
  useEffect(() => {
    if (engineState.isEngineInitialized.value) {
      initSystems(Engine.instance.currentWorld, [
        {
          systemLoader: () => Promise.resolve({ default: SimulateAvatarMovementSystem }),
          uuid: 'SimulateAvatarMovement',
          type: SystemUpdateType.FIXED
        }
      ])
    }
  }, [engineState.isEngineInitialized])
}