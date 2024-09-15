const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } = skyway_room;

async function fetchAppIdAndSecretId() {
    const url = 'wss://kkryade1212.tcpexposer.com';
    const socket = new WebSocket(url);

    return new Promise((resolve, reject) => {
        socket.addEventListener('open', () => {
            console.log('WebSocket connection established');
        });

        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.app_id && data.secret_id) {
                resolve({ app_id: data.app_id, secret_id: data.secret_id });
                socket.close();
            }
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        });

        socket.addEventListener('close', () => {
            console.log('WebSocket connection closed');
        });
    });
}

async function establishWebSocketConnection() {
    const url = 'wss://kkryade1212.tcpexposer.com';
    let socket;

    const connect = () => {
        return new Promise((resolve, reject) => {
            socket = new WebSocket(url);

            socket.addEventListener('open', () => {
                console.log('WebSocket connection established');
                resolve(socket);
            });

            socket.addEventListener('error', (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            });

            socket.addEventListener('close', () => {
                console.log('WebSocket connection closed');
            });
        });
    };

    try {
        socket = await connect();
        return socket;
    } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        throw error;
    }
}

async function SkyWay_main(token, userName) {
    const { SkyWayContext, SkyWayRoom, SkyWayStreamFactory } = skyway_room;

    const buttonArea = document.getElementById('button-area');
    const remoteMediaArea = document.getElementById('remote-media-area');
    const roomNameInput = "transceiver";

    let Members = 1;

    const myId = document.getElementById('my-id');
    const myName = document.getElementById('my-name');
    const Memberselem = document.getElementById('Members');
    const IdDisp = document.getElementById('id-disp');
    const joinButton = document.getElementById('join');
    const userNameInput = document.getElementById('user-name');
    const target = document.getElementById('MuteInfo');
    const NonMutebtn = document.getElementById('NonMute-btn');
    const leavebtn = document.getElementById('leave');
    const participantList = document.getElementById('participant-list');

    let isMuted = true;

    const userPositions = {};

    const socket = await establishWebSocketConnection();
    const audio = await SkyWayStreamFactory.createMicrophoneAudioStream();

    if (roomNameInput === '') return;

    const context = await SkyWayContext.Create(token);
    const room = await SkyWayRoom.FindOrCreate(context, {
        type: 'p2p',
        name: roomNameInput,
    });
    const me = await room.join({ name: userName });

    const publication = await me.publish(audio);

    console.log(`${userName} is connected`);

    target.textContent = "ミュート解除中";
    NonMutebtn.style.backgroundColor = "rgb(147, 235, 235)";
    myId.textContent = me.id;
    myName.textContent = userName;
    Memberselem.textContent = Members + "人";
    IdDisp.style.visibility = "visible";

    NonMutebtn.style.visibility = "visible";
    NonMutebtn.style.opacity = 1;
    joinButton.style.visibility = "hidden";
    leavebtn.style.visibility = "visible";

    leavebtn.onclick = () => {
        me.leave();
        location.reload();
    };

    NonMutebtn.addEventListener('click', async () => {
        isMuted = !isMuted;
        if (isMuted) {
            target.textContent = "ミュート中";
            NonMutebtn.style.backgroundColor = "red";
            await publication.disable();
        } else {
            target.textContent = "ミュート解除中";
            NonMutebtn.style.backgroundColor = "rgb(147, 235, 235)";
            await publication.enable();
        }
    });

    const updateParticipantList = () => {
        participantList.innerHTML = '';
        room.members.forEach(member => {
            const listItem = document.createElement('li');
            listItem.textContent = member.name || member.id;
            participantList.appendChild(listItem);
        });
    };

    const subscribeAndAttach = async (publication) => {
        if (publication.publisher.id === me.id) return;

        const subscribeButton = document.createElement('button');
        subscribeButton.textContent = `${publication.publisher.name || publication.publisher.id}: ${publication.contentType}`;
        buttonArea.appendChild(subscribeButton);

        subscribeButton.onclick = async () => {
            try {
                const { stream } = await me.subscribe(publication.id);

                const oldMediaElement = remoteMediaArea.querySelector(`[data-username="${publication.publisher.name || publication.publisher.id}"]`);
                if (oldMediaElement) {
                    remoteMediaArea.removeChild(oldMediaElement);
                }

                let newMedia;
                switch (stream.track.kind) {
                    case 'audio':
                        newMedia = document.createElement('audio');
                        newMedia.controls = true;
                        newMedia.autoplay = true;
                        newMedia.setAttribute('data-username', publication.publisher.name || publication.publisher.id);
                        newMedia.volume = 0;
                        break;
                    default:
                        return;
                }
                stream.attach(newMedia);
                remoteMediaArea.appendChild(newMedia);

                socket.addEventListener('message', (event) => {
                    const data = JSON.parse(event.data);
                    const positions = data.positions;
                    serverDistance = data.distance;
                    for (const [name, position] of Object.entries(positions)) {
                        if (!userPositions[name]) {
                            userPositions[name] = { x: 0, y: 10000, z: 0 };
                        } else if (!position || Object.keys(position).length === 0) {
                            userPositions[name] = { x: 0, y: 10000, z: 0 };
                        } else {
                            userPositions[name] = position;
                        }

                        const mediaElement = document.querySelector(`[data-username="${name}"]`);
                        if (name !== myName.textContent && mediaElement && userPositions[myName.textContent] && userPositions[name] && position && Object.keys(position).length >= 1) {
                            adjustVolume(mediaElement, userPositions[myName.textContent], userPositions[name]);
                        }
                    }
                });

            } catch (error) {
                console.error('Failed to subscribe to publication:', error);
            }
        };

        subscribeButton.click();
        Members++;
        Memberselem.textContent = Members + "人";
        updateParticipantList();
    };

    room.onStreamPublished.add((e) => {
        console.log('New publication:', e.publication);
        subscribeAndAttach(e.publication);
    });

    me.onPublicationUnsubscribed.add(() => {
        Members--;
        Memberselem.textContent = Members + "人";
        updateParticipantList();
    });

    room.publications.forEach(publication => {
        subscribeAndAttach(publication);
    });

    updateParticipantList(); // 初期参加者リストの更新

    await publication.enable();
}

// ページ読み込み時にボタンイベントハンドラを設定
window.onload = async function () {
    const joinButton = document.getElementById('join');
    joinButton.onclick = async () => {
        const userName = document.getElementById('user-name').value.trim();
        if (userName === '') {
            alert('名前を入力してください');
            return;
        }

        try {
            // WebSocketでapp_idとsecret_idを取得
            const { app_id, secret_id } = await fetchAppIdAndSecretId();

            // Tokenの作成
            const Token = new SkyWayAuthToken({
                jti: uuidV4(),
                iat: nowInSec(),
                exp: nowInSec() + 60 * 60 * 24 * 3,
                scope: {
                    app: {
                        id: app_id,
                        turn: true,
                        actions: ['read'],
                        channels: [
                            {
                                id: '*',
                                name: '*',
                                actions: ['write'],
                                members: [
                                    {
                                        id: '*',
                                        name: '*',
                                        actions: ['write'],
                                        publication: {
                                            actions: ['write'],
                                        },
                                        subscription: {
                                            actions: ['write'],
                                        },
                                    },
                                ],
                                sfuBots: [
                                    {
                                        actions: ['write'],
                                        forwardings: [
                                            {
                                                actions: ['write'],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                },
            }).encode(secret_id);

            await SkyWay_main(Token, userName);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    navigator.permissions.query({ name: 'microphone' }).then((result) => {
        if (result.state === 'granted') {
            console.log("マイクを利用します");
        } else {
            console.log("マイクの権限取得エラーです");
            alert("マイクを使用する権限を与えて下さい");
        }
    });
}

function calculateDistance(pos1, pos2) {
    return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
    );
}

function adjustVolume(mediaElement, pos1, pos2) {
    if (!pos1 || !pos2 || typeof pos1.x !== 'number' || typeof pos1.y !== 'number' || typeof pos1.z !== 'number' ||
        typeof pos2.x !== 'number' || typeof pos2.y !== 'number' || typeof pos2.z !== 'number') {
        console.error('Invalid positions:', pos1, pos2);
        mediaElement.volume = 0;
        mediaElement.muted = true;
        return;
    }

    const distance = calculateDistance(pos1, pos2);
    const minVolume = 0;
    const volume = Math.max(minVolume, 1 - (distance / serverDistance)); // serverDistance を使用
    if (volume == 0) {
        mediaElement.volume = minVolume;
        mediaElement.muted = true;
    } else {
        mediaElement.volume = volume;
        mediaElement.muted = false;
    }
}
