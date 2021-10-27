import styled from 'styled-components';

export const AtomsVideoContainer = styled.div`
  width: var(--width);
  height: var(--height);
  background-color: #3a3a3e;
  border: 1px solid palegoldenrod;
  box-sizing: border-box;
`;

export const AtomsVideo = styled.video`
  height: 100%;
  width: 100%;
`;

/*
transform: ${(props) => (props.screenShared ? 'none' : 'rotateY(180deg)')};
-webkit-transform: rotateY(180deg);
-moz-transform: rotateY(180deg);
 */
