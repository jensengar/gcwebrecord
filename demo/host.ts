import authenticatorFactory, { IAuthData, parseOauthParams } from 'genesys-cloud-client-auth';
import { getDomainFromHost } from '../src/utils';

const authRedirectUri = 'https://localhost:4300';
const iframeOrigin = 'https://localhost:8443';

// const authTokenToSend = 'P7T87y_cP6sqc5ERx1G4nPekAWaslpr7KwtAeQejc--UAPMGRTs9faJjAAIkgfiCsSVkWB_J-3RhUv1RK7QgNg';
const authClientId = '2e10c888-5261-45b9-ac32-860a1e67eff8'; // we cheated and are using the sdk's clientId
const domain = getDomainFromHost(window.location.host);
const storageKey = 'genesys-cloud-screen-recording-web'

let authenticatingPromise: Promise<IAuthData> | undefined;
let iframeReady = false;
let authData: IAuthData | undefined;

const authClient = authenticatorFactory(authClientId, {
  environment: domain,
  persist: true,
  storageKey: storageKey,
  debugMode: false
});

// Function to send a message to the iframe
function sendMessageToIframe(message: any) {
  message.type = 'gcsr-client';
  const iframe = document.querySelector('iframe');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(message, iframeOrigin);
  }
}

// Function to handle messages received from the iframe
function handleMessageFromIframe(event: MessageEvent) {
  if (event.data?.type !== 'gcsr-host') {
    // Ignore messages from unexpected origins
    return;
  }
  console.log('Message received from iframe:', event.data);
  if (event.data.action === 'ready') {
    iframeReady = true;

    if (authData) {
      sendAuthToIframe();
    }
  }
}

function sendAuthToIframe () {
  console.info('sending token to iframe');
  sendMessageToIframe({ accessToken: authData!.accessToken });
}

async function authenticate (): Promise<IAuthData> {
  const authDataFromOldHash: IAuthData = parseOauthParams(window.location.hash);
  const existingAuthData = (authDataFromOldHash.accessToken || authDataFromOldHash.error) ? authDataFromOldHash : undefined;
  if (authenticatingPromise) {
    return authenticatingPromise;
  }

  return authenticatingPromise = new Promise<IAuthData>(async (resolve, reject) => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    const redirectRoute = pathname + hash;
    /* if we are using popup locally, we will keep our redirect and let `popup-auth-hackery.js` do its dirty work */

    const logOpts = JSON.stringify({
      options: {
        state: redirectRoute,
      },
      existingAuthData
    });
    console.debug('about to login implicitly using', logOpts);

    authClient.loginImplicitGrant({
      state: redirectRoute,
      redirectUri: authRedirectUri,
    }, existingAuthData).then((authData?: IAuthData) => {
      const data = authData || {};
      console.debug('returned from authentication with', { data }, { skipServer: true });

      // TODO: setup a timeout to count down when our token expires
      //  right before it expires, we could re-auth

      if (data.state) {
        const stateUrl = new URL(decodeURIComponent(data.state), window.location.origin);

        /* if our pathnames don't match, that means we are trying to use a feature-branch. Auth can't redirect back to a FB, tho */
        if (window.location.pathname !== stateUrl.pathname) {
          console.debug('replacing window URL to stateUrl since pathnames do not match: \n' +
            `  stateUrl:   ${stateUrl}\n` +
            `  currentUrl: ${window.location.href}`
          );
          window.location.replace(stateUrl.toString());
          // we resolve for testing purposes. replacing the url will cause a full page refresh
          return resolve(data);
        }

        const hashRoute = stateUrl.hash.startsWith('#/') ? stateUrl.hash.slice(2) : '';
        if (hashRoute) {
          console.debug('we have a stateUrl hash. Routing Angular via navigateByUrl. \n  Route: ' + hashRoute);
          // this.router.navigateByUrl(hashRoute);
        }
      }

      resolve(data);
    }).catch((err: any) => {
      console.error(err);
      reject(err);
    });
  })
    // timeout because... javascript /shrug (see PCM-1818)
    .finally(() => setTimeout(() => authenticatingPromise = undefined, 150));
}

async function run () {
  window.addEventListener('message', handleMessageFromIframe, false);

  authData = await authenticate();
  if (iframeReady) {
    sendAuthToIframe();
  }
}

run();