import styles from '../App.css';
import { OrganismsHeader, OrganismsMain } from '../components/organisms';
import logo from '../images/logo.svg';
import { MoleculesLocalVideo, MoleculesRemoteVideo } from '../components/molecules';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/atoms';
import { createPeerConnectionContext } from '../utils/peer-video-connection';

const senders = [];
const peerVideoConnection = createPeerConnectionContext();

export const Home = () => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [displayMediaStream, setDisplayMediaStream] = useState(null);

  const localVideo = useRef();
  const remoteVideo = useRef();

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
    peerVideoConnection.onRemoveUser((socketId) =>
      setConnectedUsers((users) => users.filter((user) => user !== socketId)),
    );
    peerVideoConnection.onUpdateUserList((users) => setConnectedUsers(users));
    peerVideoConnection.onAnswerMade((socket) => peerVideoConnection.callUser(socket));
    peerVideoConnection.onCallRejected((data) => alert(`User: "Socket: ${data.socket}" rejected your call.`));
    peerVideoConnection.onTrack((stream) => (remoteVideo.current.srcObject = stream));
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

  const ShareButton = () =>
    displayMediaStream ? (
      <Button onClick={() => cancelScreenSharing(displayMediaStream)}>Cancel</Button>
    ) : (
      <Button onClick={() => shareScreen()}>Share Screen</Button>
    );

  return (
    <div className={styles.container}>
      <OrganismsHeader
        onNavItemSelect={(user) => peerVideoConnection.callUser(user.id)}
        navItems={connectedUsers.map((user) => ({ id: user, title: user }))}
        title="Learn Something"
        picture={logo}
      />

      <OrganismsMain>
        <MoleculesRemoteVideo ref={remoteVideo} autoPlay />

        <MoleculesLocalVideo ref={localVideo} autoPlay muted />

        <div style={{ position: 'absolute', bottom: '24px' }}>
          <ShareButton />
        </div>
      </OrganismsMain>
    </div>
  );
};
