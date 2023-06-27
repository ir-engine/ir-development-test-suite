import React, { useEffect, useState } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { SelectInput } from '@etherealengine/editor/src/components/inputs/SelectInput'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { loadNetworkAvatar } from './utils/avatar/loadAvatarHelpers'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { useSimulateMovement } from './utils/simulateMovement'
import { Template } from './utils/template'
import { XRAction } from '@etherealengine/engine/src/xr/XRState'
import { xrTargetHeadSuffix, xrTargetLeftHandSuffix, xrTargetRightHandSuffix } from '@etherealengine/engine/src/avatar/components/AvatarIKComponents'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

// let entities = [] as Entity[]
// let entitiesLength = 0

// async function SimulateNetworkAvatarMovementSystem (world: World) {
//   const dataWriter = createDataWriter()
//   return () => {
//     if(entities.length !== entitiesLength) {
//       entities = []
//       for (let i = 0; i < entitiesLength; i++) {
//         const eid = Engine.instance.getUserAvatarEntity('user' + i as UserId)
//         if(eid) entities.push(eid)
//       }
//     }
//     if(Engine.instance.worldNetwork && entities.length) {
//       const data = dataWriter(world, Engine.instance.worldNetwork, entities)
//       console.log(data)
//       Engine.instance.worldNetwork.incomingMessageQueueUnreliable.add(data)
//     }
//   }
// }

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))
  const avatars = useHookstate(getMutableState(AvatarState))

  const [count, setCount] = useState(100)
  const [avatar, setAvatar] = useState('')

  const [entities, setEntities] = useState(0)

  useSimulateMovement()

  useEffect(() => {
    engineState.avatarLoadingEffect.set(false)

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const indexStr = urlParams.get('count')
    if (indexStr) setCount(parseInt(indexStr))
  }, [])

  useEffect(() => {
    setAvatar(avatars[0].get({ noproxy: true }))
  }, [avatars])

  useEffect(() => {
    if (!avatar || !engineState.connectedWorld.value) return
    for (let i = 0; i < entities; i++) removeEntity(Engine.instance.getUserAvatarEntity('user' + i as UserId))
    setEntities(count)
    for (let i = 0; i < count; i++) {
      const userId = loadNetworkAvatar(avatars.avatarList.value.find(val => val.id === avatar)!, i)
      dispatchAction({ ...XRAction.spawnIKTarget({ handedness: 'none', uuid: userId + xrTargetHeadSuffix as EntityUUID }), $from: userId,  })
      dispatchAction({ ...XRAction.spawnIKTarget({ handedness: 'left', uuid: userId + xrTargetLeftHandSuffix as EntityUUID }), $from: userId,  })
      dispatchAction({ ...XRAction.spawnIKTarget({ handedness: 'right', uuid: userId + xrTargetRightHandSuffix as EntityUUID }), $from: userId,  })
    }
  }, [count, avatar, engineState.connectedWorld])

  return (
    <>
      <Template />
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', margin: 'auto', paddingTop: '100px', pointerEvents: 'all' }}>
        <SelectInput options={avatars.avatarList.value.map(val => ({ value: val.id, label: val.name }))} onChange={setAvatar} value={avatar} />
        <NumericInput onChange={setCount} value={count} />
      </div>
    </>
  )
}