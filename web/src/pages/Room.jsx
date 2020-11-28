import styles from '../App.css';
import { OrganismsHeader, OrganismsMain } from '../components/organisms';
import logo from '../images/logo.svg';
import { MoleculesLocalVideo, MoleculesRemoteVideo } from '../components/molecules';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/atoms';
import { createPeerConnectionContext } from '../utils/peer-video-connection';
import { useParams } from 'react-router-dom';

const senders = [];
const peerVideoConnection = createPeerConnectionContext();

export const Room = () => {
  const { room } = useParams();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [displayMediaStream, setDisplayMediaStream] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
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
    let interval;
    if (startTimer) {
      interval = setInterval(() => setElapsedTime((time) => time + 1), 1000);
    } else {
      setElapsedTime(0);
      remoteVideo.current.srcObject = null;
    }

    return () => clearInterval(interval);
  }, [startTimer]);

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
    peerVideoConnection.onDisconnected(() => setStartTimer(false));
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

  function formatElapsedTime() {
    return new Date(elapsedTime * 1000).toISOString().substr(11, 8);
  }

  const ShareButton = () =>
    displayMediaStream ? (
      <Button onClick={() => cancelScreenSharing(displayMediaStream)}>Cancel</Button>
    ) : (
      <Button onClick={() => shareScreen()}>Share Screen</Button>
    );

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
    setFullScreen(false);
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

  const FullScreenButton = () =>
    isFullScreen ? (
      <Button onClick={() => cancelFullScreen()}>Exit Full Screen</Button>
    ) : (
      <Button onClick={() => fullScreen()}>Full Screen</Button>
    );

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
            <ShareButton />
            <FullScreenButton />
          </div>
          <span style={{ color: 'white', fontWeight: 'bold', right: '40px', bottom: '12px', position: 'absolute' }}>
            {formatElapsedTime()}
          </span>
        </div>
      </OrganismsMain>
    </div>
  );
};
