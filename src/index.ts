import { GenesysCloudWebrtcSdk, ScreenRecordingMetadata, SessionTypes } from 'genesys-cloud-webrtc-sdk';
import { getDomainFromHost } from './utils';

async function getAllScreensMedia (): Promise<ScreenCaptureMediaStreamTrack[] | undefined> {
  return navigator.mediaDevices.getAllScreensMedia && await navigator.mediaDevices.getAllScreensMedia();
}

async function hasGetAllScreensMediaAccess () {
  try {
    const media = await getAllScreensMedia();
    if (!media) {
      console.info('getAllScreensMedia api does not exist');
      return false;
    }

    media.forEach(stream => {
      stream.stop();
    });
    return true;
  } catch (err) {
    console.warn('could not access getAllScreensMedia', err);
    return false;
  }
}

function getMetaDataFromTrack ({ screenDetailed, id }: ScreenCaptureMediaStreamTrack): ScreenRecordingMetadata {
  return {
    originX: screenDetailed.left,
    originY: screenDetailed.top,
    primary: screenDetailed.isPrimary,
    resolutionX: screenDetailed.width,
    resolutionY: screenDetailed.height,
    screenId: 'unknown',
    trackId: id
  };
}

async function getStreamAndMetadatas (): Promise<{ stream: MediaStream, metadatas: ScreenRecordingMetadata[] }> {
  const medias = await getAllScreensMedia();

  const stream = new MediaStream();
  const metadatas: ScreenRecordingMetadata[] = [];

  medias!.forEach(media => {
    stream.addTrack(media);
    metadatas.push(getMetaDataFromTrack(media));
  });

  return { stream, metadatas };
}

// Function to send a message to the parent window
function sendMessageToParent(message: any) {
  if (window.parent) {
    message.type = 'gcsr-host';
    window.parent.postMessage(message, 'https://localhost:4300');
  } else {
    console.error('cant send message, no window.parent object');
  }
}

// Optionally, handle incoming messages from the parent
function handleMessageFromParent(event: MessageEvent) {
  // ignore unintended events
  if (event.data?.type !== 'gcsr-client') {
    return;
  }

  console.log('Message received in iframe from parent:', event.data);

  if (event.data.accessToken) {
    startSdk(event.data.accessToken);
  }
}

async function startSdk (token: string) {
  console.info('instantiating sdk');
  // TODO: change this to jwt?
  const sdk = new GenesysCloudWebrtcSdk({
    accessToken: token,
    allowedSessionTypes: [ SessionTypes.screenRecording ],
    environment: getDomainFromHost(window.location.host)
  });

  console.info('initializing sdk');

  sdk.on('pendingSession', (pendingSession) => {
    sdk.acceptPendingSession({
      conversationId: pendingSession.conversationId,
      sessionType: SessionTypes.screenRecording
    });
  });

  // we received the session, now we need to accept it with media
  sdk.on('sessionStarted', async (session) => {
    const { stream, metadatas } = await getStreamAndMetadatas();
    sdk.acceptSession({
      screenRecordingMetadatas: metadatas,
      mediaStream: stream,
      conversationId: session.conversationId,
      sessionType: SessionTypes.screenRecording
    })
  });
  await sdk.initialize();
}

async function init () {
  // if (!hasGetAllScreensMediaAccess()) {
  //   return;
  // }

  // Set up an event listener for messages from the parent
  window.addEventListener('message', handleMessageFromParent, false);
  sendMessageToParent({ action: 'ready' });
}

init();