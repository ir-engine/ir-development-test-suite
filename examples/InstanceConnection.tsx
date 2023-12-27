import React from 'react'

import { LocationInstanceState } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadLocation } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { LocationSeed, LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { SocketWebRTCClientNetwork } from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { Button } from '@etherealengine/editor/src/components/inputs/Button'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { LocationType } from '@etherealengine/engine/src/schemas/social/location.schema'
import { getMutableState, getState } from '@etherealengine/hyperflux'

globalThis.NetworkState = NetworkState

export default function InstanceConnection() {
  useNetwork({ online: true })

  useLoadLocation({ locationName: 'default' })

  AuthService.useAPIListeners()

  useLoadEngineWithScene()

  /** Mimic a server choosing to close our connection */
  const onNetworkDisconnect = () => {
    const instanceID = Object.keys(getState(LocationInstanceState).instances)[0]
    const network = getState(NetworkState).networks[instanceID] as SocketWebRTCClientNetwork
    network.transport.primus.end()
  }

  const onNetworkLostConnection = () => {
    const instanceID = Object.keys(getState(LocationInstanceState).instances)[0]
    const network = getState(NetworkState).networks[instanceID] as SocketWebRTCClientNetwork
    clearInterval(network.transport.heartbeat)
    /** in 10 seconds, the server will end the connection to the client and remove it's peer */
  }

  /**  */
  const onLeaveLocation = () => {
    getMutableState(LocationState).set({
      locationName: null! as string,
      currentLocation: {
        location: LocationSeed as LocationType,
        bannedUsers: [] as string[],
        selfUserBanned: false,
        selfNotAuthorized: false
      },
      invalidLocation: false
    })
  }

  /** Mimic a server kicking us */
  // const onNetworkKick = () => {}

  /** Mimic a server banning us */
  // const onNetworkBan = () => {}

  /** Mimic us choosing to close a network */
  // const onNetworkClose = () => {}

  return (
    <>
      <div style={{ pointerEvents: 'all', position: 'absolute', top: '50%', left: '50%' }}>
        <Button onClick={onNetworkDisconnect}>Disconnect Network</Button>
        <Button onClick={onNetworkLostConnection}>Lose Connection</Button>
        {/* <Button onClick={onLeaveLocation}>Leave Location</Button> */}
      </div>
      <LocationIcons />
    </>
  )
}
