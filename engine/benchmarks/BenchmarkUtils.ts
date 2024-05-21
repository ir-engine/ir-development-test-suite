export const sleep = async (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

export const waitForPropertyLoad = async <T>(component: T | undefined, property: keyof T) => {
  return new Promise<void>((resolve) => {
    const checkPropertyLoaded = () => {
      if (component && component[property]) {
        resolve()
      } else {
        setTimeout(checkPropertyLoaded, 100)
      }
    }
    checkPropertyLoaded()
  })
}
