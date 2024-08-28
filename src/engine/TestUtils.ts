import { AvatarType, avatarPath } from '@ir-engine/common/src/schema.type.module'
import { NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { useFind } from '@ir-engine/common'
import { useEffect } from 'react'
import { MathUtils } from 'three'

export const useAvatars = () => {
  const avatars = useHookstate<string[]>([])
  const avatarQuery = useFind(avatarPath, {
    query: {
      $skip: 0,
      $limit: 100
    }
  })

  useEffect(() => {
    if (!avatarQuery.data.length || avatarQuery.status != 'success') return

    avatars.set(
      avatarQuery.data.map((item) => {
        return item.modelResource!.url
      })
    )
  }, [avatarQuery.status])

  return avatars
}

export const useRandomAvatar = () => {
  const avatars = useAvatars()
  const avatar = useHookstate<string | undefined>(undefined)

  useEffect(() => {
    const avatarArr = avatars.get(NO_PROXY)
    if (!avatarArr.length || avatar.value) return
    avatar.set(avatarArr[MathUtils.randInt(0, avatarArr.length)])
  }, [avatars])

  return avatar
}

export const useAvatarData = () => {
  const avatars = useHookstate<AvatarType[]>([])
  const avatarQuery = useFind(avatarPath, {
    query: {
      $skip: 0,
      $limit: 100
    }
  })

  useEffect(() => {
    if (!avatarQuery.data.length || avatarQuery.status != 'success') return

    avatars.set(avatarQuery.data)
  }, [avatarQuery.status])

  return avatars
}

export const useRandomAvatarData = () => {
  const avatars = useAvatarData()
  const avatar = useHookstate<AvatarType | undefined>(undefined)

  useEffect(() => {
    const avatarArr = avatars.get(NO_PROXY)
    if (!avatarArr.length || avatar.value) return
    avatar.set(avatarArr[MathUtils.randInt(0, avatarArr.length)])
  }, [avatars])

  return avatar
}
