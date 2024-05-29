interface ScreenDetailed {
  availHeight: number;
  availLeft: number;
  availTop: number;
  availWidth: number;
  colorDepth: number;
  devicePixelRatio: number;
  height: number;
  isExtended: boolean
  isInternal: boolean
  isPrimary: boolean
  label: string
  left: number
  pixelDepth: number
  top: number
  width: number
}

interface ScreenCaptureMediaStreamTrack extends MediaStreamTrack {
  screenDetailed: ScreenDetailed;
}

interface ScreenCaptureMediaStream extends MediaStream {
  getTracks(): ScreenCaptureMediaStreamTrack[];
  getVideoTracks(): ScreenCaptureMediaStreamTrack[];
}

interface MediaDevices {
  getAllScreensMedia?(): Promise<ScreenCaptureMediaStreamTrack[]>;
}