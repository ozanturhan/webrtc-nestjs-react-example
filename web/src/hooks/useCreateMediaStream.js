import { useEffect, useState } from 'react';

export const useCreateMediaStream = (localVideoRef) => {
  const [userMediaStream, setUserMediaStream] = useState(null);

  useEffect(() => {
    const createMediaStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 640, ideal: 1920 },
          height: { min: 400, ideal: 1080 },
          aspectRatio: { ideal: 1.7777777778 },
        },
        audio: true,
      });

      localVideoRef.current.srcObject = stream;

      setUserMediaStream(stream);
    };

    createMediaStream();
  }, [localVideoRef]);

  return userMediaStream;
};
