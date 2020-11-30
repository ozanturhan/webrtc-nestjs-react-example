import React from 'react';
import { Button } from './AtomsButton';

export const AtomsFullScreenButton = ({ isFullScreen, onToggle }) => {
  return <Button onClick={() => onToggle()}>{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</Button>;
};
