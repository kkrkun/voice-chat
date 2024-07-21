const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } = skyway_room;

window.onload = async function () {
    await SkyWay_main(String(Token));
}

const Token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24 * 3,
    scope: {
        app: {
            id: "7dc26499-2433-43ec-8285-99beff41a46b",
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
}).encode("ektEwMWo27esBj8OPysenv96493Rh9Ze0wOAVa3ott4=");

function SkyWay_main(token) {
    const { SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory } = skyway_room;

    (async () => {
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

        let isMuted = true;

        const userPositions = {};

        joinButton.onclick = async () => {
            const userName = userNameInput.value.trim();
            if (userName === '') {
                alert('名前を入力してください');
                return;
            }

            userPositions[userName] = { x: 0, y: 0, z: 0 };

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

            const subscribeAndAttach = (publication) => {
                if (publication.publisher.id === me.id) return;

                const subscribeButton = document.createElement('button');
                subscribeButton.textContent = `${publication.publisher.name || publication.publisher.id}: ${publication.contentType}`;
                buttonArea.appendChild(subscribeButton);

                subscribeButton.onclick = async () => {
                    const { stream } = await me.subscribe(publication.id);

                    let newMedia;
                    switch (stream.track.kind) {
                        case 'audio':
                            newMedia = document.createElement('audio');
                            newMedia.controls = true;
                            newMedia.autoplay = true;
                            newMedia.setAttribute('data-username', publication.publisher.name || publication.publisher.id); // ユーザー名をデータ属性として設定
                            break;
                        default:
                            return;
                    }
                    stream.attach(newMedia);
                    remoteMediaArea.appendChild(newMedia);

                    setInterval(async () => {
                        try {
                            const response = await fetch('http://is-lecture.gl.at.ply.gg:26473/getPositions');
                            const positions = await response.json();
                            console.log('Received positions:', positions);

                            for (const [name, position] of Object.entries(positions)) {
                                if (userPositions[name]) {
                                    userPositions[name] = position;
                                } else {
                                    // 位置情報がない場合はデフォルト値を設定
                                    userPositions[name] = { x: 0, y: 0, z: 0 };
                                }

                                const mediaElement = document.querySelector(`[data-username="${name}"]`);
                                if (mediaElement) {
                                    adjustVolume(mediaElement, userPositions[myName.textContent], userPositions[name]);
                                }
                            }
                        } catch (error) {
                            console.error('Failed to fetch positions:', error);
                        }
                    }, 500); // 0.5秒ごとに位置情報を取得
                };

                subscribeButton.click();
                Members++;
                Memberselem.textContent = Members + "人";
            };

            me.onPublicationUnsubscribed.add(() => {
                Members--;
                Memberselem.textContent = Members + "人";
            });

            room.publications.forEach(publication => {
                const publisherName = publication.publisher.name || publication.publisher.id;
                if (!userPositions[publisherName]) {
                    userPositions[publisherName] = { x: 0, y: 0, z: 0 };
                }
                subscribeAndAttach(publication);
            });

            room.onStreamPublished.add((e) => {
                const publisherName = e.publication.publisher.name || e.publication.publisher.id;
                if (!userPositions[publisherName]) {
                    userPositions[publisherName] = { x: 0, y: 0, z: 0 };
                }
                subscribeAndAttach(e.publication);
            });

            await publication.enable();
        };
    })();
}

navigator.permissions.query({ name: 'microphone' }).then((result) => {
    if (result.state === 'granted') {
        console.log("マイクを利用します");
    } else {
        console.log("マイクの権限取得エラーです");
        alert("マイクを使用する権限を与えて下さい");
    }
});

function calculateDistance(pos1, pos2) {
    return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
    );
}

function adjustVolume(mediaElement, pos1, pos2) {
    const distance = calculateDistance(pos1, pos2);
    const maxDistance = 10; // 最大距離
    const minVolume = 0; // 最小音量
    const volume = Math.max(minVolume, 1 - (distance / maxDistance));
    mediaElement.volume = volume;
    console.log(`Volume adjusted for ${mediaElement.getAttribute('data-username')}: ${volume}`);
}
