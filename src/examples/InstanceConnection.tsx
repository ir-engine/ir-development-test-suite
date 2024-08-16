import React from 'react'

import { LocationInstanceState } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadLocation } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { LocationSeed, LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { SocketWebRTCClientNetwork } from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { InstanceID, LocationType } from '@etherealengine/common/src/schema.type.module'
import { PresentationSystemGroup, useExecute } from '@etherealengine/ecs'
import { Button } from '@etherealengine/editor/src/components/inputs/Button'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import {
  MediasoupDataProducerConsumerState,
  MediasoupMediaProducerConsumerState,
  MediasoupTransportState,
  Network,
  NetworkState
} from '@etherealengine/network'

const ProducerInfo = (props: { networkID: InstanceID; value: any }) => {
  const { networkID, value } = props
  const state = useHookstate('')

  useExecute(
    () => {
      if (value.dataChannel) {
        const dataProducer = MediasoupDataProducerConsumerState.getProducerByDataChannel(networkID, value.dataChannel)
        if (dataProducer) {
          state.set(`- ${value.dataChannel} \n  - closed: ${dataProducer.closed}\n  - readyState: ${dataProducer.readyState}`)
          return
        }
      }
      if (value.mediaTag) {
        const mediaProducer = MediasoupMediaProducerConsumerState.getProducerByPeerIdAndMediaTag(
          networkID,
          value.peerID,
          value.mediaTag
        )
        if (mediaProducer) {
          state.set(
            `- ${value.mediaTag} \n  - closed: ${mediaProducer.closed}\n  - readyState: ${mediaProducer.readyState}`
          )
          return
        }
      }
      state.set('')
    },
    { after: PresentationSystemGroup }
  )

  return <div>{state.value}</div>
}

const ConsumerInfo = (props: { networkID: InstanceID; value: any }) => {
  const { networkID, value } = props
  const state = useHookstate('')

  useExecute(
    () => {
      if (value.dataChannel) {
        const dataConsumer = MediasoupDataProducerConsumerState.getConsumerByDataChannel(networkID, value.dataChannel)
        if (dataConsumer) {
          state.set(`- ${value.dataChannel} \n  - closed: ${dataConsumer.closed}\n   - readyState: ${dataConsumer.readyState}`)
          return
        }
      }
      if (value.mediaTag) {
        const mediaConsumer = MediasoupMediaProducerConsumerState.getConsumerByPeerIdAndMediaTag(
          networkID,
          value.peerID,
          value.mediaTag
        )
        if (mediaConsumer) {
          state.set(
            `- ${value.mediaTag} \n  - closed: ${mediaConsumer.closed}\n  - readyState: ${mediaConsumer.readyState}`
          )
          return
        }
      }
      state.set('')
    },
    { after: PresentationSystemGroup }
  )

  return <div>{state.value}</div>
}

const TransportInfo = (props: { networkID: InstanceID; transportID: string }) => {
  const transportState = useHookstate(
    getMutableState(MediasoupTransportState)[props.networkID][props.transportID]
  ).value
  const dataState = {
    ...useHookstate(getMutableState(MediasoupDataProducerConsumerState)[props.networkID]).value,
    ...useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[props.networkID]).value
  }
  return (
    <div>
      {transportState.direction} - {transportState.connected ? 'Active' : 'Waiting'}
      {dataState?.producers && (
        <div>
          Producers
          {Object.entries(dataState?.producers)
            .filter(([_, producer]) => producer.transportID === props.transportID)
            .map(([key, value]) => (
              <ProducerInfo key={key} networkID={props.networkID} value={value} />
            ))}
        </div>
      )}
      {dataState?.consumers && (
        <div>
          Consumers
          {Object.entries(dataState?.consumers)
            .filter(([_, consumer]) => consumer.transportID === props.transportID)
            .map(([key, value]) => (
              <ConsumerInfo key={key} networkID={props.networkID} value={value} />
            ))}
        </div>
      )}
    </div>
  )
}

const NetworkInfo = (props: { networkID: InstanceID }) => {
  const transportState = useHookstate(getMutableState(MediasoupTransportState)[props.networkID]).value
  if (!transportState) return <></>
  return (
    <>
      <h3>
        {getState(NetworkState).networks[props.networkID].topic} Network ID: {props.networkID}
      </h3>
      {Object.entries(transportState).map(([key, value]) => (
        <div key={key}>
          <br />
          <TransportInfo networkID={props.networkID} transportID={key} />
        </div>
      ))}
    </>
  )
}

export default function InstanceConnection() {
  const online = useHookstate(false)
  useNetwork({ online: online.value })

  useLoadLocation({ locationName: 'default' })

  AuthService.useAPIListeners()

  useLoadEngineWithScene()

  const networks = useHookstate(getMutableState(NetworkState).networks)

  /** Mimic a server choosing to close our connection */
  const onNetworkDisconnect = () => {
    console.log('onNetworkDisconnect')
    const instanceID = Object.keys(getState(LocationInstanceState).instances)[0]
    const network = getState(NetworkState).networks[instanceID] as SocketWebRTCClientNetwork | Network
    if ('primus' in network) network.primus.end()
  }

  const onNetworkLostConnection = () => {
    console.log('debug onNetworkLostConnection')
    const instanceID = Object.keys(getState(LocationInstanceState).instances)[0]
    const network = getState(NetworkState).networks[instanceID] as SocketWebRTCClientNetwork | Network
    if ('heartbeat' in network) clearInterval(network.heartbeat)
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
      <div style={{ pointerEvents: 'all', position: 'absolute', top: '20%', left: '50%' }}>
        <Button
          onClick={() => {
            online.set((val) => !val)
            console.log('debug SWITCH', online.value)
          }}
        >
          Go {online.value ? 'Offline' : 'Online'}
        </Button>
        <Button onClick={onNetworkDisconnect}>End Connection</Button>
        <Button onClick={onNetworkLostConnection}>Stop Heartbeat</Button>
        {/* <Button onClick={onLeaveLocation}>Leave Location</Button> */}
        {networks.keys.map((networkID: InstanceID) => (
          <div key={networkID}>
            <br />
            <NetworkInfo networkID={networkID} />
          </div>
        ))}
      </div>
      <LocationIcons />
    </>
  )
}
