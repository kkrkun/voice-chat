const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } = skyway_room;

// ページロード時に SkyWay の初期化を行う
window.onload = async function () {
    await SkyWay_main(String(Token));
}

// SkyWay の認証トークンを生成
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

// SkyWay のメイン処理を実行
async function SkyWay_main(token) {
    const { SkyWayContext, SkyWayRoom, SkyWayStreamFactory } = skyway_room;

    // メイン処理を非同期で実行
    (async () => {
        const buttonArea = document.getElementById('button-area');
        const remoteMediaArea = document.getElementById('remote-media-area');
        const roomNameInput = "transceiver";

        let Members = 1;

        // DOM 要素の取得
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

        // ユーザー位置情報の管理オブジェクト
        const userPositions = {};

        // ユーザーが参加ボタンをクリックしたときの処理
        joinButton.onclick = async () => {
            const userName = userNameInput.value.trim();
            if (userName === '') {
                alert('名前を入力してください');
                return;
            }

            let audio = null;
            try {
                // マイクのオーディオストリームを作成
                audio = await SkyWayStreamFactory.createMicrophoneAudioStream();
            } catch (error) {
                console.error("マイクのオーディオストリームを作成できませんでした:", error);
            }

            if (roomNameInput === '') return;

            const context = await SkyWayContext.Create(token);
            const room = await SkyWayRoom.FindOrCreate(context, {
                type: 'p2p',
                name: roomNameInput,
            });
            const me = await room.join({ name: userName });

            let publication = null;
            if (audio) {
                publication = await me.publish(audio);
                console.log(`${userName} is connected with audio`);
            } else {
                console.log(`${userName} is connected without audio`);
            }

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
                if (!publication) return;
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
                    try {
                        const { stream } = await me.subscribe(publication.id);

                        // 古いメディア要素を削除
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
                                newMedia.volume = 0; // 再接続時に音量を0にリセット
                                break;
                            default:
                                return;
                        }
                        stream.attach(newMedia);
                        remoteMediaArea.appendChild(newMedia);
            
                        // 音量調整の関数を呼び出す
                        const adjustVolumeForAll = async () => {
                            try {
                                const response = await fetch('https://kkryade1212.tcpexposer.com/getPositions');
                                if (!response.ok) {
                                    throw new Error('Failed to fetch positions');
                                }
                                const positions = await response.json();
                                console.log('Received positions:', positions);
            
                                for (const [name, position] of Object.entries(positions)) {
                                    if (!userPositions[name]) {
                                        userPositions[name] = { x: 0, y: 10000, z: 0 };
                                    } else if (!position || Object.keys(position).length === 0) {
                                        userPositions[name] = { x: 0, y: 10000, z: 0 };
                                    } else {
                                        userPositions[name] = position;
                                    }

                                    const mediaElement = document.querySelector(`[data-username="${name}"]`);
                                    if (name != myName.textContent && mediaElement && userPositions[myName.textContent] && userPositions[name] && position && Object.keys(position).length >= 1) {
                                        console.log(`Adjusting volume for ${name}:`, userPositions[myName.textContent], userPositions[name]);
                                        adjustVolume(mediaElement, userPositions[myName.textContent], userPositions[name]);
                                    }
                                }
                            } catch (error) {
                                console.error('Failed to fetch positions:', error);
                            }
                        };
            
                        // 定期的に位置情報を取得し、音量調節を行う
                        setInterval(adjustVolumeForAll, 1000);
                    } catch (error) {
                        console.error('Failed to subscribe to publication:', error);
                    }
                };
            
                subscribeButton.click();
                Members++;
                Memberselem.textContent = Members + "人";
            };
            
            room.onStreamPublished.add((e) => {
               console.log('New publication:', e.publication);
               subscribeAndAttach(e.publication);
            });
            me.onPublicationUnsubscribed.add(() => {
                Members--;
                Memberselem.textContent = Members + "人";
            });

            room.publications.forEach(publication => {
                subscribeAndAttach(publication);
            });

            if (publication) {
                await publication.enable();
            }
        };
    })();
}

// マイクの権限を確認
navigator.permissions.query({ name: 'microphone' }).then((result) => {
    if (result.state === 'granted') {
        console.log("マイクを利用します");
    } else {
        console.log("マイクの権限取得エラーです");
        alert("マイクを使用する権限を与えて下さい");
    }
});

// 2点間の距離を計算
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
        mediaElement.volume = 0; // デフォルトの最小音量
        mediaElement.muted = true; // ミュートにする
        return;
    }

    const distance = calculateDistance(pos1, pos2);
    const maxDistance = 10; // 最大距離
    const minVolume = 0; // 最小音量を0に設定
    volume = Math.max(minVolume, 1 - (distance / maxDistance));
    if (volume == 0) {
        mediaElement.volume = minVolume; // デフォルトの最小音量
        mediaElement.muted = true; // ミュートにする
    } else {
        mediaElement.volume = volume; // 音量調節
        mediaElement.muted = false; // ミュートにする
    }
    console.log(`now volume: ${volume}`);
    console.log(`Media element volume set to: ${mediaElement.volume}`);
    console.log(`Volume adjusted for ${mediaElement.getAttribute('data-username')}: ${mediaElement.volume}`);
}
