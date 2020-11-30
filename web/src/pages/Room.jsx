import styles from '../App.css';
import { OrganismsHeader, OrganismsMain } from '../components/organisms';
import logo from '../images/logo.svg';
import { MoleculesLocalVideo, MoleculesRemoteVideo, MoleculesVideoControls } from '../components/molecules';
import React, { useEffect, useRef, useState } from 'react';
import { createPeerConnectionContext } from '../utils/peer-video-connection';
import { useParams } from 'react-router-dom';

const senders = [];
const peerVideoConnection = createPeerConnectionContext();

export const Room = () => {
  const { room } = useParams();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [displayMediaStream, setDisplayMediaStream] = useState(null);
  const [startTimer, setStartTimer] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);

  const localVideo = useRef();
  const remoteVideo = useRef();
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

        if (localVideo) {
          localVideo.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
          senders.push(peerVideoConnection.peerConnection.addTrack(track, stream));
        });

        setUserMediaStream(stream);
      }
    };

    createMediaStream();
  }, [userMediaStream]);

  useEffect(() => {
    peerVideoConnection.joinRoom(room);
    peerVideoConnection.onRemoveUser((socketId) =>
      setConnectedUsers((users) => users.filter((user) => user !== socketId)),
    );
    peerVideoConnection.onUpdateUserList((users) => setConnectedUsers(users));
    peerVideoConnection.onAnswerMade((socket) => peerVideoConnection.callUser(socket));
    peerVideoConnection.onCallRejected((data) => alert(`User: "Socket: ${data.socket}" rejected your call.`));
    peerVideoConnection.onTrack((stream) => (remoteVideo.current.srcObject = stream));

    peerVideoConnection.onConnected(() => {
      setStartTimer(true);
    });
    peerVideoConnection.onDisconnected(() => {
      setStartTimer(false);
      remoteVideo.current.srcObject = null;
    });
  }, []);

  async function shareScreen() {
    const stream = displayMediaStream || (await navigator.mediaDevices.getDisplayMedia());

    await senders.find((sender) => sender.track.kind === 'video').replaceTrack(stream.getTracks()[0]);

    stream.getVideoTracks()[0].addEventListener('ended', () => {
      cancelScreenSharing(stream);
    });

    localVideo.current.srcObject = stream;

    setDisplayMediaStream(stream);
  }

  async function cancelScreenSharing(stream) {
    await senders
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
    <div className={styles.container}>
      <OrganismsHeader
        onNavItemSelect={(user) => peerVideoConnection.callUser(user.id)}
        navItems={connectedUsers.map((user) => ({ id: user, title: user }))}
        title="Learn Something"
        picture={logo}
      />

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
    </div>
  );
};
