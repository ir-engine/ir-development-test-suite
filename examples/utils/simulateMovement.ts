import { UserId } from "@etherealengine/common/src/interfaces/UserId"
import { AvatarLeftArmIKComponent, AvatarRightArmIKComponent, AvatarHeadIKComponent } from "@etherealengine/engine/src/avatar/components/AvatarIKComponents"
import { Engine } from "@etherealengine/engine/src/ecs/classes/Engine"
import { defineQuery, getComponent } from "@etherealengine/engine/src/ecs/functions/ComponentFunctions"
import { RigidBodyComponent } from "@etherealengine/engine/src/physics/components/RigidBodyComponent"
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { V_010 } from '@etherealengine/engine/src/common/constants/MathConstants'
import { Quaternion } from 'three'
import { defineSystem, useSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SimulationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'

// quaternion that represents a 1 degree turn on the y axis
const q = new Quaternion().setFromAxisAngle(V_010, Math.PI / 180)

const entitiesQuery = defineQuery([NetworkObjectComponent, RigidBodyComponent, AvatarComponent, AvatarRigComponent])
let entities = [] as Entity[]
const execute = () => {
  const entitiesLength = entitiesQuery().length
  if (entities.length !== entitiesLength) {
    entities = []
    for (let i = 0; i < entitiesLength; i++) {
      const eid = Engine.instance.getUserAvatarEntity('user' + i as UserId)
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
        (Math.sin(Engine.instance.elapsedSeconds * 2) + 1) * 0.5 * (headToFeetLength - minHeadHeight) +
        minHeadHeight
      head.target.position.y = headTargetY + rigidbody.position.y
    }
  }
}


const SimulateAvatarMovementSystem = defineSystem({
  'uuid': 'ee.development-test-suite.SimulateAvatarMovementSystem',
  execute
})


export const useSimulateMovement = () => {
  useSystem(SimulateAvatarMovementSystem, { with: SimulationSystemGroup })
}