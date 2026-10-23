const SDK_SCRIPT_ID = 'facebook-jssdk'
const SDK_SRC = 'https://connect.facebook.net/pt_BR/sdk.js'

export type FacebookLoginResponse = {
  status?: string
  authResponse?: {
    code?: string
    accessToken?: string
  }
}

export type FacebookSdk = {
  init(params: {
    appId: string
    cookie?: boolean
    xfbml?: boolean
    version: string
  }): void
  login(
    callback: (response: FacebookLoginResponse) => void,
    options: Record<string, unknown>,
  ): void
}

declare global {
  interface Window {
    FB?: FacebookSdk
    fbAsyncInit?: () => void
  }
}

let sdkLoadPromise: Promise<FacebookSdk> | null = null
let initializedAppId: string | null = null

export function loadFacebookSdk(appId: string, graphVersion = 'v22.0'): Promise<FacebookSdk> {
  if (sdkLoadPromise && initializedAppId === appId && window.FB) {
    return sdkLoadPromise
  }

  initializedAppId = appId
  sdkLoadPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      if (!window.FB) {
        reject(new Error('Facebook SDK não carregou corretamente.'))
        return
      }
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: graphVersion,
      })
      resolve(window.FB)
    }

    if (document.getElementById(SDK_SCRIPT_ID)) {
      if (window.FB) {
        window.fbAsyncInit?.()
        return
      }
    }

    const script = document.createElement('script')
    script.id = SDK_SCRIPT_ID
    script.async = true
    script.defer = true
    script.src = SDK_SRC
    script.onerror = () => reject(new Error('Não foi possível carregar o SDK do Facebook.'))
    document.head.appendChild(script)
  })

  return sdkLoadPromise
}
