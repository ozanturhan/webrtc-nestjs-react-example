import React, { forwardRef } from 'react';
import { useCalculateVoiceVolume } from '../../hooks';
import { Video, VideoContainer, VoiceVisualizer } from '../atoms';

export const LocalVideo = forwardRef((props, ref) => {
  useCalculateVoiceVolume(ref?.current?.srcObject, 'local');

  return (
    <VideoContainer>
      <VoiceVisualizer id="local" />
      <Video {...props} ref={ref} />
    </VideoContainer>
  );
});
