import logo from '../images/logo.svg';
import { MoleculesVideo, MoleculesVideoControls, OrganismsHeader, Gallery } from '../components';
import React, { useEffect, useRef, useState } from 'react';
import { createPeerConnectionContext } from '../utils/peer-video-connection';
import { useParams } from 'react-router-dom';
import { useCalculateVideoLayout } from '../hooks';

const peerVideoConnection = createPeerConnectionContext();

export const Room = () => {
  const { room } = useParams();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [displayMediaStream, setDisplayMediaStream] = useState(null);
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
          peerVideoConnection.callUser(user);
        });

        peerVideoConnection.onRemoveUser((socketId) => {
          setConnectedUsers((users) => users.filter((user) => user !== socketId));
          peerVideoConnection.removePeerConnection(socketId);
        });

        peerVideoConnection.onUpdateUserList(async (users) => {
          setConnectedUsers(users);
          for (const user of users) {
            peerVideoConnection.addPeerConnection(`${user}`, localVideo.current.srcObject, (_stream) => {
              document.getElementById(user).srcObject = _stream;
            });
          }
        });

        peerVideoConnection.onAnswerMade((socket) => peerVideoConnection.callUser(socket));
      }
    };

    createMediaStream();
  }, []);

  async function shareScreen() {
    const stream = displayMediaStream || (await navigator.mediaDevices.getDisplayMedia());

    const sender = await peerVideoConnection.senders.find((sender) => sender.track.kind === 'video');

    if (sender) {
      sender.replaceTrack(stream.getTracks()[0]);
    }

    stream.getVideoTracks()[0].addEventListener('ended', () => {
      cancelScreenSharing(stream);
    });

    localVideo.current.srcObject = stream;

    setDisplayMediaStream(stream);
  }

  async function cancelScreenSharing(stream) {
    const sender = await peerVideoConnection.senders.find((sender) => sender.track.kind === 'video');

    if (sender) {
      sender.replaceTrack(userMediaStream.getTracks().find((track) => track.kind === 'video'));
    }

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
      <OrganismsHeader title="WebRTC Example" picture={logo} />

      <div className="main" ref={mainRef}>
        <Gallery ref={galleryRef}>
          <MoleculesVideo ref={localVideo} autoPlay playsInline muted />
          {connectedUsers.map((user) => (
            <MoleculesVideo
              key={user}
              onClick={() => {
                peerVideoConnection.callUser(user);
              }}
              id={user}
              autoPlay
              playsInline
            />
          ))}
        </Gallery>

        <MoleculesVideoControls
          isScreenSharing={Boolean(displayMediaStream)}
          onScreenShare={handleScreenSharing}
          isFullScreen={isFullScreen}
          onFullScreen={handleFullScreen}
        />
      </div>
    </div>
  );
};
