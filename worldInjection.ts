import { isClient } from '@etherealengine/common/src/utils/getEnvironment'

/**
 * products & carts are unnecessary on nodejs, as they're only used in the editor,
 * and will cause errors with node trying to import .tsx files
 */

export default async function () {
  if (isClient) {
    await import('./engine/Register')
  }
}
