import React from 'react';
import styled from 'styled-components';
import logo from '../../images/logo.svg';

export const RightLogo = styled.h1`
  color: white;
  font-size: 1.5rem;
  @media screen and (max-width: 936px) {
    font-size: 1rem;
  }
`;

const LeftLogoContainer = styled.div`
  height: inherit;
  display: flex;
  align-items: center;
  margin-bottom: -5px;

  span {
    width: 40px;
    height: 40px;
    display: flex;
    overflow: hidden;
    position: relative;
    font-size: 2rem;
    align-items: center;
    flex-shrink: 0;
    font-family: inherit;
    line-height: 1;
    user-select: none;
    border-radius: 50%;
    justify-content: center;
  }

  img {
    color: transparent;
    width: 100%;
    height: 100%;
    object-fit: cover;
    text-align: center;
    text-indent: 10000px;
  }
`;

export const LeftLogo = () => {
  return (
    <LeftLogoContainer>
      <span>
        <img src={logo} alt="React Logo" />
      </span>
    </LeftLogoContainer>
  );
};
