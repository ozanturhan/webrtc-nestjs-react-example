import React, { useEffect, useState } from 'react';
import { AtomsFullScreenButton, AtomsShareScreen } from '../atoms';

export const MoleculesVideoControls = ({
  isScreenSharing,
  onScreenShare,
  isFullScreen,
  onFullScreen,
  isTimerStarted,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isTimerStarted) {
      interval = setInterval(() => setElapsedTime((time) => time + 1), 1000);
    } else {
      setElapsedTime(0);
    }

    return () => clearInterval(interval);
  }, [isTimerStarted]);

  function formatElapsedTime() {
    return new Date(elapsedTime * 1000).toISOString().substr(11, 8);
  }

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
      <span style={{ color: 'white', fontWeight: 'bold', right: '40px', bottom: '12px', position: 'absolute' }}>
        {formatElapsedTime(elapsedTime)}
      </span>
    </div>
  );
};
