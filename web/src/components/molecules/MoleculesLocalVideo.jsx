import styled from 'styled-components';

export const MoleculesLocalVideo = styled.video`
  position: relative;
  width: 100%;
  background: black;

  @media screen and (min-width: 936px) {
    position: absolute;
    border: 1px solid #38444d;
    bottom: 60px;
    right: 40px;
    border-radius: 5px;
    width: 300px;
    height: auto;
  }
`;
