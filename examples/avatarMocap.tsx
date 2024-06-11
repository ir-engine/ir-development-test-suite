import { useWorldNetwork } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { UserID } from '@etherealengine/common/src/schemas/user/user.schema'
import { Entity, UUIDComponent, removeEntity } from '@etherealengine/ecs'
import { useOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { MotionCaptureResults, mocapDataChannelType } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { NO_PROXY, createState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { DataChannelRegistryState, NetworkState } from '@etherealengine/network'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { VisibleComponent, setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { encode } from 'msgpackr'
import React, { useEffect } from 'react'
import { useAvatars } from '../engine/TestUtils'
import { loadNetworkAvatar } from './utils/avatar/loadAvatarHelpers'

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
  const entity = useHookstate(UUIDComponent.entitiesByUUIDState[userID + '_avatar']).value
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

export default function AvatarMocap(props: { sceneEntity: Entity }) {
  const network = useWorldNetwork()
  const avatars = useAvatars()
  const selectedAvatar = useHookstate<undefined | string>(undefined)
  const userID = useHookstate('' as UserID)
  const entity = useHookstate(UUIDComponent.entitiesByUUIDState[userID.value + '_avatar']).value

  useEffect(() => {
    if (!selectedAvatar.value || !network?.ready.value) return

    const userid = loadNetworkAvatar(selectedAvatar.value, 0, selectedAvatar.value, -1)
    userID.set(userid)
    return () => {
      removeEntity(UUIDComponent.entitiesByUUIDState[userid + '_avatar'].value)
      userID.set('' as UserID)
    }
  }, [network?.ready, selectedAvatar])

  return (
    <>
      {avatars.value && avatars.value.length && (
        <select
          style={{
            background: 'lightgrey',
            color: 'grey',
            padding: '0.5em',
            margin: '0.5em',
            borderRadius: '0.5em',
            border: 'none',
            position: 'absolute',
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: 'all'
          }}
          onChange={(e) => selectedAvatar.set(avatars.get(NO_PROXY)[e.target.value])}
        >
          {avatars.value.map((avatar, i) => (
            <option key={avatar} value={i}>
              {avatar}
            </option>
          ))}
        </select>
      )}

      {/* <Template /> */}
      <ActivePoseUI />
      {entity && <MocapAvatar userID={userID.value} />}
    </>
  )
}
