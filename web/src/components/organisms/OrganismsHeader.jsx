import styled from 'styled-components';
import React, { useState } from 'react';
import { AtomsLogo, AtomsProfilePicture } from '../atoms';
import menu from '../../images/menu.svg';
import { MoleculesLeftSide } from '../molecules';

const HeaderContainer = styled.header`
  position: relative;
  width: 100%;
  display: flex;
  background: #16202c;
  box-shadow: 2px 2px 6px #000000;
  box-sizing: border-box;
  flex-shrink: 0;
  flex-direction: column;
  z-index: 10;

  .toolbar {
    height: 64px;
    padding-left: 24px;
    padding-right: 24px;
    display: flex;
    position: relative;
    align-items: center;
  }
`;

const MenuIcon = styled.input.attrs({
  type: 'image',
  src: menu,
})`
  height: 40px;
  width: 40px;
  margin-right: 24px;
  display: none;

  &:focus {
    outline: none;
  }

  @media screen and (max-width: 936px) {
    display: block;
    margin-left: 0;
    flex-direction: column;
  }
`;

export const OrganismsHeader = ({ title, picture }) => {
  return (
    <>
      <HeaderContainer>
        <div className="toolbar">
          <AtomsLogo>{title}</AtomsLogo>

          <div style={{ flexGrow: 1 }} />
          <AtomsProfilePicture picture={picture} />
        </div>
      </HeaderContainer>
    </>
  );
};
