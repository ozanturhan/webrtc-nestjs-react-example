import React from 'react';
import styled from 'styled-components';

const VoiceVisualizerContainer = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const VoiceVisualizer = ({ id }) => {
  return (
    <VoiceVisualizerContainer>
      <canvas id={`canvas-${id}`} width="100" height="50" />
    </VoiceVisualizerContainer>
  );
};
