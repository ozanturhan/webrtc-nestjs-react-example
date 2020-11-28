import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
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

export const AtomsProfilePicture = ({ picture }) => {
  return (
    <Container>
      <span>
        <img src={picture} alt="Profile Photo" />
      </span>
    </Container>
  );
};
