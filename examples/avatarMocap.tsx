import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { useOptionalComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { mocapDataChannelType } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { drawMocapDebug } from '@etherealengine/engine/src/mocap/UpdateAvatar'
import { DataChannelRegistryState } from '@etherealengine/engine/src/networking/systems/DataChannelRegistry'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { NormalizedLandmarkList } from '@mediapipe/holistic'
import { encode } from 'msgpackr'
import { loadNetworkAvatar } from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'

const getMocapTestData = async () => {
  return Object.fromEntries(
    (
      await Promise.all(
        //@ts-ignore
        Object.entries(import.meta.glob<any>('../../../../engine/src/mocap/testPoses/*.json')).map(async ([k, v]) => [
          k.split('/').pop()?.replace('.json', ''),
          await v()
        ])
      )
    ).map(([k, v]) => [k, v.default])
  )
}

type AvailablePoses =
  | 'mocapTPose'
  | 'mocapArmTurn90'
  | 'mocapLeanForward'
  | 'mocapSideBend'
  | 'mocapTurn45'
  | 'mocapTurn90'

const mocapTestData = {} as Record<AvailablePoses, NormalizedLandmarkList>[]
getMocapTestData().then((data) => {
  Object.assign(mocapTestData, data)
  console.log({ mocapTestData })
})

const mocapRawDataHelper = drawMocapDebug()

const MocapAvatar = (props: { userID: UserID }) => {
  const { userID } = props
  const entity = useHookstate(UUIDComponent.entitiesByUUIDState[userID]).value
  const activePose = useHookstate<AvailablePoses>('mocapTPose')
  const rig = useOptionalComponent(entity, AvatarRigComponent)

  useEffect(() => {
    if (!rig?.value) return
    const data = mocapTestData[activePose.value]

    const timer = setInterval(() => {
      const dataChannelFunctions = getState(DataChannelRegistryState)[mocapDataChannelType]
      if (dataChannelFunctions) {
        const message = encode({
          timestamp: Date.now(),
          peerID: props.userID,
          results: data
        })
        for (const func of dataChannelFunctions)
          func(Engine.instance.worldNetwork, mocapDataChannelType, Engine.instance.worldNetwork.hostPeerID, message)
      }
    }, 500)

    return () => clearInterval(timer)
  }, [rig, activePose])

  return (
    <>
      {Object.keys(mocapTestData).map((pose: any) => (
        <div key={pose}>
          <button
            style={{
              background: activePose.value === pose ? 'darkgreen' : 'lightgrey',
              color: activePose.value === pose ? 'lightgreen' : 'grey',
              padding: '0.5em',
              margin: '0.5em',
              borderRadius: '0.5em',
              border: 'none',
              pointerEvents: 'all'
            }}
            onClick={() => activePose.set(pose)}
          >
            {pose}
          </button>
          <br />
        </div>
      ))}
    </>
  )
}

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))
  const avatarList = useFind(avatarPath, {
    query: {
      $skip: 0,
      $limit: 100
    }
  })

  const userID = useHookstate('' as UserID)

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (!engineState.connectedWorld.value || !avatarList.data.length) return
    userID.set(loadNetworkAvatar(avatarList.data[0], 0))
  }, [engineState.connectedWorld, avatarList.data.length])

  return (
    <>
      <Template />
      {userID.value && <MocapAvatar userID={userID.value} />}
    </>
  )
}
