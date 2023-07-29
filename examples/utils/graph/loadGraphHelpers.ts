import { Engine } from "@etherealengine/engine/src/ecs/classes/Engine"
import { createEntity } from "@etherealengine/engine/src/ecs/functions/EntityFunctions"
import { Physics } from "@etherealengine/engine/src/physics/classes/Physics"
import { CollisionGroups, DefaultCollisionMask } from "@etherealengine/engine/src/physics/enums/CollisionGroups"
import { getInteractionGroups } from "@etherealengine/engine/src/physics/functions/getInteractionGroups"
import { setTransformComponent } from "@etherealengine/engine/src/transform/components/TransformComponent"
import { Vector3 } from "three"
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { PhysicsState } from "@etherealengine/engine/src/physics/state/PhysicsState"
import { getState } from "@etherealengine/hyperflux/functions/StateFunctions"
import { setComponent } from "@etherealengine/engine/src/ecs/functions/ComponentFunctions"
import { BehaveGraphComponent } from "@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent"

export const createPhysicsObject = () => {

  const entity = createEntity()
  setTransformComponent(entity, new Vector3(2.5 - Math.random() * 5, 1 + Math.random() * 5, 2.5 - Math.random() * 5))
  
  const rigidBodyDesc = RigidBodyDesc.dynamic()
  const colliderDesc = ColliderDesc.ball(0.1)
  colliderDesc.setCollisionGroups(
    getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask)
  )
  colliderDesc.setFriction(10).setRestitution(1)

  rigidBodyDesc.setCanSleep(false)

  Physics.createRigidBody(entity, getState(PhysicsState).physicsWorld, rigidBodyDesc, [colliderDesc])
  setComponent(entity,BehaveGraphComponent,{run:true})
  return entity
}