import React, { useEffect, useState } from 'react';
import { useCalculateVoiceVolume } from '../../hooks';
import { Video, VideoContainer, VoiceVisualizer } from '../atoms';

export const RemoteVideo = (props) => {
  const [mediaStream, setMediaStream] = useState();

  useCalculateVoiceVolume(mediaStream, props.id);

  useEffect(() => {
    const interval = setInterval(() => {
      const stream = document.getElementById(props.id).srcObject;

      if (stream) {
        setMediaStream(stream);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [props.id]);

  return (
    <VideoContainer>
      <VoiceVisualizer id={props.id} />
      <Video {...props} />
    </VideoContainer>
  );
};
