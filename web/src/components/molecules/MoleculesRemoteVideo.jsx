import styled from 'styled-components';
import { AtomsVideo, AtomsVideoContainer } from '../atoms';
import { forwardRef } from 'react';

export const MoleculesRemoteVideo = styled(AtomsVideo)`
  background: black;
  border: 1px solid red;
  width: 100%;
  height: 100%;
  background: black;

  @media screen and (max-width: 936px) {
    box-shadow: none;
    border-radius: 0;
    width: 100%;
    height: auto;
    border: none;
  }
`;

export const MoleculesVideo = forwardRef((props, ref) => {
  return (
    <AtomsVideoContainer>
      <AtomsVideo {...props} ref={ref} />
    </AtomsVideoContainer>
  );
});
