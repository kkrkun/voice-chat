const localAudio = document.createElement('audio');
localAudio.muted = true;
document.body.appendChild(localAudio);

const constraints = { audio: true, video: false };
let localStream;
let peerConnection;
const socket = io.connect();
let isJoined = false;

document.getElementById('joinButton').addEventListener('click', joinChat);
document.getElementById('leaveButton').addEventListener('click', leaveChat);

function joinChat() {
    if (isJoined) return;
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            localAudio.srcObject = stream;
            localStream = stream;

            // Initialize WebRTC peer connection
            peerConnection = new RTCPeerConnection();

            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

            peerConnection.ontrack = event => {
                const remoteAudioElement = document.getElementById('remoteAudio');
                remoteAudioElement.srcObject = event.streams[0];
                setupSpatialAudio(remoteAudioElement);
            };

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit('candidate', { candidate: event.candidate });
                }
            };

            socket.on('offer', async message => {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.emit('answer', { answer: answer });
            });

            socket.on('answer', message => {
                peerConnection.setRemoteDescription(new RTCSessionDescription(message));
            });

            socket.on('candidate', message => {
                peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
            });

            socket.emit('join');
            createOffer();
            isJoined = true;
            document.getElementById('joinButton').disabled = true;
            document.getElementById('leaveButton').disabled = false;
        }).catch(error => {
            console.error('Error accessing media devices.', error);
        });
}

function leaveChat() {
    if (!isJoined) return;
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    socket.emit('leave');
    isJoined = false;
    document.getElementById('joinButton').disabled = false;
    document.getElementById('leaveButton').disabled = true;
}

async function createOffer() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', { offer: offer });
}

function setupSpatialAudio(remoteAudioElement) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const omnitone = Omnitone.createFOARenderer(audioContext);
    const remoteAudioSource = audioContext.createMediaElementSource(remoteAudioElement);

    omnitone.initialize()
        .then(() => {
            remoteAudioSource.connect(omnitone.input);
            omnitone.output.connect(audioContext.destination);
            omnitone.setChannelMap([0, 1, 2, 3]);
        })
        .catch(error => {
            console.error('Error initializing Omnitone.', error);
        });

    remoteAudioElement.play();
}

socket.on('connect', () => {
    console.log('Connected to signaling server');
});
