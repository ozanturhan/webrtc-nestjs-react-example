import React, { useEffect, useState } from 'react';
import { AtomsFullScreenButton, AtomsShareScreen } from '../atoms';

export const MoleculesVideoControls = ({ isScreenSharing, onScreenShare, isFullScreen, onFullScreen }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <div>
        <AtomsShareScreen isSharing={isScreenSharing} onToggle={() => onScreenShare(!isScreenSharing)} />
        <AtomsFullScreenButton isFullScreen={isFullScreen} onToggle={() => onFullScreen(!isFullScreen)} />
      </div>
    </div>
  );
};
