import React, { useEffect, useRef } from 'react'

import { Template } from './utils/template'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import { useHookstate } from '@etherealengine/hyperflux'
import { createEntity, entityExists, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { loadAvatarForPreview } from '@etherealengine/client-core/src/user/components/Panel3D/helperFunctions'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { AVATAR_FILE_ALLOWED_EXTENSIONS } from '@etherealengine/common/src/constants/AvatarConstants'


const RetargetingDND = () => {
  const asset = useHookstate(null as null | File)

  const handleChangeFile = (e) => {
    const { files } = e.target

    if (files.length === 0) {
      return
    }

    asset.set(files[0])

  }

  useEffect(() => {
    if (!asset.value) return
    const entity = createEntity()
    const url = URL.createObjectURL(asset.value) + '#' + asset.value.name

    loadAvatarForPreview(entity, url).then((avatar) => {
      console.log(avatar)
      if (!entityExists(entity)) return

      if (!avatar) return

      avatar.name = 'avatar ' + url
      addObjectToGroup(entity, avatar)
    })

    return () => {
      removeEntity(entity)
    }
  }, [asset])

  return <div style={{ height: '100%', width: '100%', background: 'white', fontSize: '20px' }} >
    <input
      type="file"
      name="avatarFile"
      accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
      onChange={handleChangeFile}
    />
  </div>
}
export default function Retargeting() {

  return (
    <div id="dnd-container" style={{ height: '25%', width: '25%', pointerEvents: 'all' }}>
      <DndWrapper id="dnd-container">
        <Template />
        <RetargetingDND />
      </DndWrapper>
    </div>
  )
}
