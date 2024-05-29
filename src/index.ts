import { GenesysCloudWebrtcSdk } from 'genesys-cloud-webrtc-sdk';


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

async function init () {
  if (!hasGetAllScreensMediaAccess()) {
    return;
  }
  
  const sdk = new GenesysCloudWebrtcSdk({
    accessToken: 'b2D7KFSDUlpZ9S3MPG8AZ8cxC0H7GkS8XU-I_aRMiZ4ya4QaW5aVv1Tcm5lQSpPG0qDMX-x_Yu0_mfSDBjJU_g'
  });
}

init();