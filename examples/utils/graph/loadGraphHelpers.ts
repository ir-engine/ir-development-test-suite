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
import { AnimationManager } from "@etherealengine/engine/src/avatar/AnimationManager"

export const createDefaultObject = () => {

  const entity = createEntity()
  setTransformComponent(entity, new Vector3(0,0,0))
  
  return entity
}