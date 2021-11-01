import styled from 'styled-components';

export const HeaderContainer = styled.header`
  position: relative;
  width: 100%;
  display: flex;
  background: #16202c;
  box-shadow: 2px 2px 6px #000000;
  box-sizing: border-box;
  flex-shrink: 0;
  flex-direction: column;
  z-index: 10;
`;

export const Toolbar = styled.div`
  height: 64px;
  padding-left: 24px;
  padding-right: 24px;
  display: flex;
  position: relative;
  align-items: center;
`;
