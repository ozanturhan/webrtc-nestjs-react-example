import styles from '../App.css';
import { OrganismsHeader, OrganismsMain } from '../components/organisms';
import logo from '../images/logo.svg';
import {
  MoleculesLocalVideo,
  MoleculesRemoteVideo,
  MoleculesVideo,
  MoleculesVideoControls,
} from '../components/molecules';
import React, { useEffect, useRef, useState } from 'react';
import { createPeerConnectionContext } from '../utils/peer-video-connection';
import { useParams } from 'react-router-dom';
import { Gallery } from '../components/layout';

const senders = [];
const peerVideoConnection = createPeerConnectionContext();

export const Room = () => {
  const { room } = useParams();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [displayMediaStream, setDisplayMediaStream] = useState(null);
  const [startTimer, setStartTimer] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);

  const galleryRef = useRef();

  useCalculateVideoLayout(galleryRef, connectedUsers.length + 1);

  const localVideo = useRef();
  const mainRef = useRef();

  useEffect(() => {
    const createMediaStream = async () => {
      if (!userMediaStream) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 640, ideal: 1920 },
            height: { min: 400, ideal: 1080 },
            aspectRatio: { ideal: 1.7777777778 },
          },
          audio: true,
        });

        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }

        setUserMediaStream(stream);

        peerVideoConnection.joinRoom(room);
        peerVideoConnection.onAddUser((user) => {
          setConnectedUsers((users) => [...users, user]);
          peerVideoConnection.addPeerConnection(`${user}`, localVideo.current.srcObject, (_stream) => {
            document.getElementById(user).srcObject = _stream;
          });
        });

        peerVideoConnection.onRemoveUser((socketId) => {
          setConnectedUsers((users) => users.filter((user) => user !== socketId));
          peerVideoConnection.removePeerConnection(socketId);
        });

        peerVideoConnection.onUpdateUserList((users) => {
          setConnectedUsers(users);
          users.forEach((user) => {
            peerVideoConnection.addPeerConnection(`${user}`, localVideo.current.srcObject, (_stream) => {
              document.getElementById(user).srcObject = _stream;
            });
            peerVideoConnection.callUser(user);
          });
        });

        peerVideoConnection.onAnswerMade((socket) => peerVideoConnection.callUser(socket));
      }
    };

    createMediaStream();
  }, []);

  async function shareScreen() {
    const stream = displayMediaStream || (await navigator.mediaDevices.getDisplayMedia());

    await peerVideoConnection.senders
      .find((sender) => sender.track.kind === 'video')
      .replaceTrack(stream.getTracks()[0]);

    stream.getVideoTracks()[0].addEventListener('ended', () => {
      cancelScreenSharing(stream);
    });

    localVideo.current.srcObject = stream;

    setDisplayMediaStream(stream);
  }

  async function cancelScreenSharing(stream) {
    await peerVideoConnection.senders
      .find((sender) => sender.track.kind === 'video')
      .replaceTrack(userMediaStream.getTracks().find((track) => track.kind === 'video'));

    localVideo.current.srcObject = userMediaStream;
    stream.getTracks().forEach((track) => track.stop());
    setDisplayMediaStream(null);
  }

  function fullScreen() {
    setFullScreen(true);
    const elem = mainRef.current;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }

  function cancelFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  function handleFullScreen(isFullScreen) {
    setFullScreen(isFullScreen);
    if (isFullScreen) {
      fullScreen();
    } else {
      cancelFullScreen();
    }
  }

  async function handleScreenSharing(isScreenShared) {
    if (isScreenShared) {
      await shareScreen();
    } else {
      await cancelScreenSharing(displayMediaStream);
    }
  }

  return (
    <div className="container">
      <OrganismsHeader
        onNavItemSelect={(user) => peerVideoConnection.callUser(user.id)}
        title="WebRTC Example"
        picture={logo}
      />

      <div className="main" ref={mainRef}>
        <Gallery ref={galleryRef}>
          <MoleculesVideo ref={localVideo} autoPlay playsInline muted  />
          {connectedUsers.map((user) => (
              <MoleculesVideo key={user} onClick={() => peerVideoConnection.callUser(user)} id={user} autoPlay playsInline />
          ))}
        </Gallery>

        <MoleculesVideoControls
          isScreenSharing={Boolean(displayMediaStream)}
          onScreenShare={handleScreenSharing}
          isFullScreen={isFullScreen}
          onFullScreen={handleFullScreen}
          isTimerStarted={startTimer}
        />
      </div>
    </div>
  );
};

// https://adosov.dev/zoom-video-gallery-p1/
function calculateLayout(containerWidth, containerHeight, videoCount, aspectRatio) {
  let bestLayout = {
    area: 0,
    cols: 0,
    rows: 0,
    width: 0,
    height: 0,
  };

  // brute-force search layout where video occupy the largest area of the container
  for (let cols = 1; cols <= videoCount; cols++) {
    const rows = Math.ceil(videoCount / cols);
    const hScale = containerWidth / (cols * aspectRatio);
    const vScale = containerHeight / rows;
    let width;
    let height;
    if (hScale <= vScale) {
      width = Math.floor(containerWidth / cols);
      height = Math.floor(width / aspectRatio);
    } else {
      height = Math.floor(containerHeight / rows);
      width = Math.floor(height * aspectRatio);
    }
    const area = width * height;
    if (area > bestLayout.area) {
      bestLayout = {
        area,
        width,
        height,
        rows,
        cols,
      };
    }
  }
  return bestLayout;
}

const useCalculateVideoLayout = (gallery, videoCount) => {
  useEffect(() => {
    const recalculateLayout = () => {
      const headerHeight = document.getElementsByTagName('header')?.[0]?.offsetHeight;
      const aspectRatio = 16 / 9;

      const screenWidth = document.body.getBoundingClientRect().width;
      const screenHeight = document.body.getBoundingClientRect().height - headerHeight;

      const { width, height, cols } = calculateLayout(screenWidth, screenHeight, videoCount, aspectRatio);

      gallery.current?.style?.setProperty('--width', width + 'px');
      gallery.current?.style?.setProperty('--height', height + 'px');
      gallery.current?.style?.setProperty('--cols', cols + '');
    };

    recalculateLayout();

    window.addEventListener('resize', recalculateLayout);

    return () => {
      window.removeEventListener('resize', recalculateLayout);
    };
  }, [gallery.current, videoCount]);
};
/*

<OrganismsMain ref={mainRef}>
        <MoleculesRemoteVideo ref={remoteVideo} autoPlay />
        <MoleculesLocalVideo ref={localVideo} autoPlay muted />
        <MoleculesVideoControls
          isScreenSharing={Boolean(displayMediaStream)}
          onScreenShare={handleScreenSharing}
          isFullScreen={isFullScreen}
          onFullScreen={handleFullScreen}
          isTimerStarted={startTimer}
        />
      </OrganismsMain>
 */
