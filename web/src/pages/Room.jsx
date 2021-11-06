import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Gallery, Header, LocalVideo, RemoteVideo, VideoControls } from '../components';
import { useCalculateVideoLayout, useCreateMediaStream, useStartPeerSession } from '../hooks';
import { toggleFullscreen } from '../utils/helpers';

export const Room = () => {
  const { room } = useParams();
  const galleryRef = useRef();
  const localVideoRef = useRef();
  const mainRef = useRef();

  const userMediaStream = useCreateMediaStream(localVideoRef);
  const { connectedUsers, shareScreen, cancelScreenSharing, isScreenShared } = useStartPeerSession(
    room,
    userMediaStream,
    localVideoRef,
  );

  useCalculateVideoLayout(galleryRef, connectedUsers.length + 1);

  async function handleScreenSharing(share) {
    if (share) {
      await shareScreen();
    } else {
      await cancelScreenSharing();
    }
  }

  function handleFullscreen(fullscreen) {
    toggleFullscreen(fullscreen, mainRef.current);
  }

  return (
    <div className="container">
      <Header title="WebRTC Example" />

      <div className="main" ref={mainRef}>
        <Gallery ref={galleryRef}>
          <LocalVideo ref={localVideoRef} autoPlay playsInline muted />
          {connectedUsers.map((user) => (
            <RemoteVideo key={user} id={user} autoPlay playsInline />
          ))}
        </Gallery>

        <VideoControls
          isScreenShared={isScreenShared}
          onScreenShare={handleScreenSharing}
          onToggleFullscreen={handleFullscreen}
        />
      </div>
    </div>
  );
};
