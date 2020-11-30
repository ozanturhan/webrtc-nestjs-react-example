import React from 'react';
import { Button } from './AtomsButton';

export const AtomsShareScreen = ({ isSharing, onToggle }) => {
  return <Button onClick={() => onToggle()}>{isSharing ? 'Cancel' : 'Share Screen'}</Button>;
};
