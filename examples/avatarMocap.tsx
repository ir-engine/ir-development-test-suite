import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/EngineState'
import { createState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { useWorldNetwork } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { useOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { MotionCaptureResults, mocapDataChannelType } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { DataChannelRegistryState } from '@etherealengine/engine/src/networking/systems/DataChannelRegistry'
import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { UUIDComponent } from '@etherealengine/engine/src/common/UUIDComponent'
import { VisibleComponent, setVisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { avatarPath } from '@etherealengine/common/src/schemas/user/avatar.schema'
import { UserID } from '@etherealengine/common/src/schemas/user/user.schema'
import { encode } from 'msgpackr'
import { loadNetworkAvatar } from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'
import { AnimationState } from '@etherealengine/engine/src/avatar/AnimationManager'

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

const mocapTestData = {} as Record<AvailablePoses, MotionCaptureResults>[]
getMocapTestData().then((data) => {
  Object.assign(mocapTestData, data)
  console.log({ mocapTestData })
})

const ActivePoseState = createState<AvailablePoses>('mocapTPose')

const MocapAvatar = (props: { userID: UserID }) => {
  const { userID } = props
  const entity = useHookstate(UUIDComponent.entitiesByUUIDState[userID]).value
  const rig = useOptionalComponent(entity, AvatarRigComponent)
  const activePose = useHookstate(ActivePoseState)
  const visible = !!useOptionalComponent(entity, VisibleComponent)?.value
  const avatarDebug = useHookstate(getMutableState(RendererState).avatarDebug)

  const setVisible = () => {
    setVisibleComponent(entity, !visible)
  }

  const setHelper = () => {
    avatarDebug.set(!avatarDebug.value)
  }

  useEffect(() => {
    if (!rig?.value) return
    const data = mocapTestData[activePose.value]

    const timer = setInterval(() => {
      const dataChannelFunctions = getState(DataChannelRegistryState)[mocapDataChannelType]
      if (dataChannelFunctions) {
        const message = encode({
          timestamp: Date.now(),
          results: data
        })
        for (const func of dataChannelFunctions)
          func(NetworkState.worldNetwork, mocapDataChannelType, props.userID as any, message)
      }
    }, 500)

    return () => clearInterval(timer)
  }, [rig, activePose])

  return (
    <>
      <button
        style={{
          background: visible ? 'darkgreen' : 'lightgrey',
          color: visible ? 'lightgreen' : 'grey',
          padding: '0.5em',
          margin: '0.5em',
          borderRadius: '0.5em',
          border: 'none',
          pointerEvents: 'all'
        }}
        onClick={setVisible}
      >
        Show Avatar
      </button>
      <button
        style={{
          background: avatarDebug.value ? 'darkgreen' : 'lightgrey',
          color: avatarDebug.value ? 'lightgreen' : 'grey',
          padding: '0.5em',
          margin: '0.5em',
          borderRadius: '0.5em',
          border: 'none',
          pointerEvents: 'all'
        }}
        onClick={setHelper}
      >
        Show Helper
      </button>
    </>
  )
}

const ActivePoseUI = () => {
  const activePose = useHookstate(ActivePoseState)
  return (
    <div style={{ position: 'absolute', right: 0, top: 0, zIndex: 1000 }}>
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
    </div>
  )
}

export default function AvatarMocap() {
  const network = useWorldNetwork()
  const avatarList = useFind(avatarPath, {
    query: {
      $skip: 0,
      $limit: 100
    }
  })

  const selectedAvatar = useHookstate(avatarList.data[0])
  const userID = useHookstate('' as UserID)
  const entity = useHookstate(UUIDComponent.entitiesByUUIDState[userID.value]).value

  useEffect(() => {
    getMutableState(AnimationState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (!network?.ready.value || !avatarList.data.length || !selectedAvatar.value) return
    const userid = loadNetworkAvatar(selectedAvatar.value, 0, selectedAvatar.value.id, -1)
    userID.set(userid)
    return () => {
      removeEntity(UUIDComponent.entitiesByUUIDState[userid].value)
      userID.set('' as UserID)
    }
  }, [network?.ready, avatarList.data.length, selectedAvatar])

  return (
    <>
      <select
        style={{
          background: 'lightgrey',
          color: 'grey',
          padding: '0.5em',
          margin: '0.5em',
          borderRadius: '0.5em',
          border: 'none',
          top: 0,
          left: 0,
          zIndex: 1000,
          pointerEvents: 'all'
        }}
        onChange={(e) => selectedAvatar.set(avatarList.data.find((avatar) => avatar.id === e.target.value)!)}
      >
        {[{ name: 'None', id: '' }, ...avatarList.data].map((avatar) => (
          <option key={avatar.id} value={avatar.id}>
            {avatar.name}
          </option>
        ))}
      </select>

      <Template />
      <ActivePoseUI />
      {entity && <MocapAvatar userID={userID.value} />}
    </>
  )
}
