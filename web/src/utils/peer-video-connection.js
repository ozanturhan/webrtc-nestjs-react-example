import * as io from 'socket.io-client';

const { RTCPeerConnection, RTCSessionDescription } = window;

class PeerConnectionSession {
  constructor(socket, peerConnection) {
    this.socket = socket;
    this.peerConnection = peerConnection;

    this.onCallMade();
  }

  isAlreadyCalling = false;
  getCalled = false;

  async callUser(to) {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    this.socket.emit('call-user', { offer, to });
  }

  onCallMade() {
    this.socket.on('call-made', async (data) => {
      if (this.getCalled) {
        const confirmed = window.confirm(`User "Socket: ${data.socket}" wants to call you. Do accept this call?`);

        if (!confirmed) {
          this.socket.emit('reject-call', {
            from: data.socket,
          });

          return;
        }
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer));

      this.socket.emit('make-answer', {
        answer,
        to: data.socket,
      });
      this.getCalled = true;
    });
  }

  onRemoveUser(callback) {
    this.socket.on('update-user-list', ({ users }) => {
      callback(users);
    });
  }

  onUpdateUserList(callback) {
    this.socket.on('update-user-list', ({ users }) => {
      callback(users);
    });
  }

  onAnswerMade(callback) {
    this.socket.on('answer-made', async (data) => {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

      if (!this.isAlreadyCalling) {
        callback(data.socket);
        this.isAlreadyCalling = true;
      }
    });
  }

  onCallRejected(callback) {
    this.socket.on('call-rejected', (data) => {
      callback(data);
    });
  }

  onTrack(callback) {
    this.peerConnection.ontrack = function ({ streams: [stream] }) {
      callback(stream);
    };
  }
}

export const createPeerConnectionContext = () => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ url: 'stun:stun2.1.google.com:19302' }],
  });
  console.log('Socket URL', process.env.REACT_APP_SOCKET_URL);
  const socket = io(process.env.REACT_APP_SOCKET_URL);

  return new PeerConnectionSession(socket, peerConnection);
};
