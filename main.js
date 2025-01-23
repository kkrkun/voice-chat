const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } = skyway_room;

let url;
const slider = {};
let Members = 0;
let nowAd;
const userLang = navigator.language || navigator.userLanguage;
let lang = userLang.startsWith('ja') ? 'ja' : 'en';
let isPC;
let isMuted;

document.addEventListener("DOMContentLoaded", function () {

    // 選択した言語のコンテンツを表示
    if (lang === 'ja') {
        document.getElementById('my-servers').style.display = 'block';
        document.getElementById('header-text').textContent = "近接VC in Mcbe";
        document.getElementById('name-disp').innerHTML = "ゲーマータグ: <span id='my-name'></span>";
        document.getElementById('Menber-disp').innerHTML = "参加人数: <span id='Members'>不明</span>";
        document.getElementById('address').textContent = "ルームID: ";
        document.getElementById('gamertag').textContent = "ゲーマータグ: ";
        document.getElementById('join').textContent = "接続する";
        document.getElementById('NonMute-btn').textContent = "ミュートON/OFF";
        document.getElementById('MuteInfo').textContent = "接続されていません";
        document.getElementById('leave').textContent = "退出";
        document.getElementById('participant').textContent = "参加者リスト";
        document.getElementById('switch-language').textContent = "Switch to English";
        document.getElementById('use').textContent = "あなたはAdblockerを使用しています！";
        document.getElementById('creator').textContent = "製作者が泣いてるよ";
        document.getElementById('disable').textContent = "広告ブロッカーを無効にしてよ！";
        document.getElementById('creator2').textContent = "↓↓↓製作者はいつも押してる↓↓↓";
        document.getElementById('continueWithout').innerHTML = "そんなのシラネ―無視だー<span id='countdown'></span>";
    }

    function checkHeight() {
        // 画面幅でPCかスマホを判定
        isPC = window.matchMedia("(min-width: 768px)").matches;
        console.log(lang)
        // PCの場合は日本語用広告を表示
        if (isPC) {
            if (lang === 'ja') {
                document.getElementById('ad-japanese-pc').style.display = 'block';  // 日本語用広告
                if (window.matchMedia("(min-height: 850px)").matches) {
                    document.getElementById('ad-japanese2-pc').style.display = 'block';  // 日本語用広告
                } else {
                    document.getElementById('ad-japanese2-pc').style.display = 'none';  // 850px未満の場合は非表示
                }
            } else {
                document.getElementById('ad-other-pc').style.display = 'block';  // 日本語以外用広告
                if (window.matchMedia("(min-height: 850px)").matches) {
                    document.getElementById('ad-other2-pc').style.display = 'block';  // 日本語用広告
                } else {
                    document.getElementById('ad-other2-pc').style.display = 'none';  // 850px未満の場合は非表示
                }
            }
        } else {
            if (lang === 'ja') {
                document.getElementById('ad-japanese-phone').style.display = 'block';  // 日本語用広告
            } else {
                document.getElementById('ad-other-phone').style.display = 'block';  // 日本語以外用広告
            }
        }
    }

    checkHeight();

    // 画面のリサイズ時に再度チェック
    window.addEventListener('resize', checkHeight);
    // 言語切り替えボタンの動作
    const switchButton = document.getElementById('switch-language');

    switchButton.addEventListener('click', function () {
        if (lang === 'en') {
            // 言語切り替え
            lang = 'ja';
            document.getElementById('my-servers').style.display = 'block';
            document.getElementById('header-text').textContent = "近接VC in Mcbe";
            document.getElementById('name-disp').innerHTML = "ゲーマータグ: <span id='my-name'></span>";
            document.getElementById('Menber-disp').innerHTML = "参加人数: <span id='Members'>不明</span>";
            document.getElementById('address').textContent = "ルームID: ";
            document.getElementById('gamertag').textContent = "ゲーマータグ: ";
            document.getElementById('join').textContent = "接続する";
            document.getElementById('NonMute-btn').textContent = "ミュートON/OFF";
            document.getElementById('MuteInfo').textContent = "接続されていません";
            const now_mute = document.getElementById('MuteInfo');
            const Memberselem = document.getElementById('Members');
            if (now_mute.textContent === "Muted" || now_mute.textContent === "Unmuted") {
                now_mute.textContent = isMuted ? "ミュート中" : "ミュート解除中";
                Memberselem.textContent = Members + "人";
            } else {
                now_mute.textContent = "接続されていません";
            }
            document.getElementById('leave').textContent = "退出";
            document.getElementById('participant').textContent = "参加者リスト";
            document.getElementById('switch-language').textContent = "Switch to English";
            document.getElementById('use').textContent = "あなたはAdblockerを使用しています！";
            document.getElementById('creator').textContent = "製作者が泣いています";
            document.getElementById('disable').textContent = "広告ブロッカーを無効にしてよ！";
            document.getElementById('creator2').textContent = "↓↓↓製作者はいつも押してる↓↓";
            document.getElementById('continueWithout').innerHTML = "そんなのシラネ―無視だー<span id='countdown'></span>";
            if (isPC) {
                document.getElementById('ad-japanese-pc').style.display = 'block';  // 日本語用広告
                document.getElementById('ad-other-pc').style.display = 'none';  // 日本語以外用広告
                document.getElementById('ad-other2-pc').style.display = 'none';  // 日本語以外用広告
                if (window.matchMedia("(min-height: 850px)").matches) {
                    document.getElementById('ad-japanese2-pc').style.display = 'block';  // 日本語用広告
                } else {
                    document.getElementById('ad-japanese2-pc').style.display = 'none';  // 850px未満の場合は非表示
                }
            } else {
                document.getElementById('ad-japanese-phone').style.display = 'block';  // 日本語用広告
                document.getElementById('ad-other-phone').style.display = 'none';  // 日本語以外用広告
            }
        } else {
            lang = 'en';
            document.getElementById('my-servers').style.display = 'none';
            document.getElementById('header-text').textContent = "Proximity VC in Mcbe";
            document.getElementById('name-disp').innerHTML = "GamerTag: <span id='my-name'></span>";
            document.getElementById('Menber-disp').innerHTML = "Participants: <span id='Members'>undefined</span>";
            document.getElementById('address').textContent = "ルームID: ";
            document.getElementById('gamertag').textContent = "GamerTag: ";
            document.getElementById('join').textContent = "Connect";
            document.getElementById('NonMute-btn').textContent = "Mute ON/OFF";
            const now_mute = document.getElementById('MuteInfo');
            const Memberselem = document.getElementById('Members');
            if (now_mute.textContent === "ミュート中" || now_mute.textContent === "ミュート解除中") {
                now_mute.textContent = isMuted ? "Muted" : "Unmuted";
                Memberselem.textContent = Members + "people";
            } else {
                now_mute.textContent = "Not connected";
            }
            document.getElementById('leave').textContent = "Leave";
            document.getElementById('participant').textContent = "Participant List";
            document.getElementById('switch-language').textContent = "日本語に切り替え";
            document.getElementById('use').textContent = "You are using an Adblocker!";
            document.getElementById('creator').textContent = "The creator is in tears.";
            document.getElementById('disable').textContent = "We would greatly appreciate it if you could disable your ad blocker.";
            document.getElementById('creator2').textContent = "";
            document.getElementById('continueWithout').innerHTML = "Continue with Adblocker anyway<span id='countdown'></span>";
            if (isPC) {
                document.getElementById('ad-japanese-pc').style.display = 'none';  // 日本語用広告
                document.getElementById('ad-japanese2-pc').style.display = 'none';  // 日本語用広告
                document.getElementById('ad-other-pc').style.display = 'block';  // 日本語以外用広告
                if (window.matchMedia("(min-height: 850px)").matches) {
                    document.getElementById('ad-other2-pc').style.display = 'block';  // 日本語用広告
                } else {
                    document.getElementById('ad-other2-pc').style.display = 'none';  // 850px未満の場合は非表示
                }
            } else {
                document.getElementById('ad-japanese-phone').style.display = 'none';  // 日本語用広告
                document.getElementById('ad-other-phone').style.display = 'block';  // 日本語以外用広告
            }
        }
    });
    // 広告の選択肢を定義
    const pc_yoko_ads = [
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZES+CIP5PU+348+6OHEP" target="_blank" rel="nofollow">
<img border="0" width="728" height="90" alt="" src="https://www27.a8.net/svt/bgt?aid=250122052757&wid=001&eno=01&mid=s00000000404001122000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=44WZES+CIP5PU+348+6OHEP" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZES+CQFSKY+348+1C71F5" target="_blank" rel="nofollow">
<img border="0" width="728" height="90" alt="" src="https://www27.a8.net/svt/bgt?aid=250122052770&wid=001&eno=01&mid=s00000000404008095000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=44WZES+CQFSKY+348+1C71F5" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZES+CDXOVM+4EKC+62U35" target="_blank" rel="nofollow">
<img border="0" width="600" height="100" alt="" src="https://www23.a8.net/svt/bgt?aid=250122052749&wid=001&eno=01&mid=s00000020550001021000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=44WZES+CDXOVM+4EKC+62U35" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+64VU7M+50+7S05SX" target="_blank" rel="nofollow">
<img border="0" width="728" height="90" alt="" src="https://www25.a8.net/svt/bgt?aid=250122056371&wid=001&eno=01&mid=s00000000018047030000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=44WZEW+64VU7M+50+7S05SX" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+A7XWMQ+50+7A9VEP" target="_blank" rel="nofollow">
<img border="0" width="728" height="90" alt="" src="https://www27.a8.net/svt/bgt?aid=250122056618&wid=001&eno=01&mid=s00000000018044052000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=44WZEW+A7XWMQ+50+7A9VEP" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+A7XWMQ+50+7A6FY9" target="_blank" rel="nofollow">
<img border="0" width="728" height="90" alt="" src="https://www26.a8.net/svt/bgt?aid=250122056618&wid=001&eno=01&mid=s00000000018044036000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=44WZEW+A7XWMQ+50+7A6FY9" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+A7XWMQ+50+7A9VEP" target="_blank" rel="nofollow">
<img border="0" width="728" height="90" alt="" src="https://www24.a8.net/svt/bgt?aid=250122056618&wid=001&eno=01&mid=s00000000018044052000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=44WZEW+A7XWMQ+50+7A9VEP" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+ADAT2Q+CO4+2NA7NL" target="_blank" rel="nofollow">
<img border="0" width="468" height="60" alt="" src="https://www25.a8.net/svt/bgt?aid=250122056627&wid=001&eno=01&mid=s00000001642016004000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=44WZEW+ADAT2Q+CO4+2NA7NL" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+DCGTYQ+CO4+3H2J1T" target="_blank" rel="nofollow">
<img border="0" width="468" height="60" alt="" src="https://www24.a8.net/svt/bgt?aid=250122056807&wid=001&eno=01&mid=s00000001642021007000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=44WZEW+DCGTYQ+CO4+3H2J1T" alt="">`,
        'adMax'
    ];
    const pc_tate_ads = [
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZES+CIP5PU+348+6NU9D" target="_blank" rel="nofollow">
<img border="0" width="160" height="600" alt="" src="https://www27.a8.net/svt/bgt?aid=250122052757&wid=001&eno=01&mid=s00000000404001119000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=44WZES+CIP5PU+348+6NU9D" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZES+CQFSKY+348+1C5BOX" target="_blank" rel="nofollow">
<img border="0" width="160" height="600" alt="" src="https://www26.a8.net/svt/bgt?aid=250122052770&wid=001&eno=01&mid=s00000000404008087000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=44WZES+CQFSKY+348+1C5BOX" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+64VU7M+50+7RY8CX" target="_blank" rel="nofollow">
<img border="0" width="160" height="600" alt="" src="https://www29.a8.net/svt/bgt?aid=250122056371&wid=001&eno=01&mid=s00000000018047021000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=44WZEW+64VU7M+50+7RY8CX" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+A7XWMQ+50+79ZSR5" target="_blank" rel="nofollow">
<img border="0" width="160" height="600" alt="" src="https://www25.a8.net/svt/bgt?aid=250122056618&wid=001&eno=01&mid=s00000000018044005000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=44WZEW+A7XWMQ+50+79ZSR5" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+A7XWMQ+50+7AAQ9T" target="_blank" rel="nofollow">
<img border="0" width="160" height="600" alt="" src="https://www28.a8.net/svt/bgt?aid=250122056618&wid=001&eno=01&mid=s00000000018044056000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=44WZEW+A7XWMQ+50+7AAQ9T" alt="">`,
        'adMax'
    ];

    const pc_tate_ads2 = [
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZES+CDXOVM+4EKC+639IP" target="_blank" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www21.a8.net/svt/bgt?aid=250122052749&wid=001&eno=01&mid=s00000020550001023000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=44WZES+CDXOVM+4EKC+639IP" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEV+9DKSS2+461Y+61C2P" target="_blank" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www27.a8.net/svt/bgt?aid=250122055567&wid=001&eno=01&mid=s00000019447001014000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=44WZEV+9DKSS2+461Y+61C2P" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+64VU7M+50+7RY0N5" target="_blank" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www24.a8.net/svt/bgt?aid=250122056371&wid=001&eno=01&mid=s00000000018047020000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=44WZEW+64VU7M+50+7RY0N5" alt="">`,
        `<a href="https://px.a8.net/svt/ejp?a8mat=44WZEW+ADAT2Q+CO4+2NAN35" target="_blank" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www24.a8.net/svt/bgt?aid=250122056627&wid=001&eno=01&mid=s00000001642016006000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www11.a8.net/0.gif?a8mat=44WZEW+ADAT2Q+CO4+2NAN35" alt="">`,
        'adMax'
    ];

    // <div id="ads">の中身を更新する関数
    function updateAd() {
        let ad_ja_pc_num = 1;
        let previousAds = {}; // 各スロットごとの前回の広告を記録
        while (ad_ja_pc_num < 6) {
            let randomAd;
            if (ad_ja_pc_num == 1) {
                // 横向き広告の選択
                const availableAds = pc_yoko_ads.filter(ad => ad !== previousAds[ad_ja_pc_num]); // 前回広告を除外
                randomAd = availableAds[Math.floor(Math.random() * availableAds.length)];
            } else if (ad_ja_pc_num < 4) {
                // 縦向き広告の選択
                const availableAds = pc_tate_ads.filter(ad => ad !== previousAds[ad_ja_pc_num]); // 前回広告を除外
                randomAd = availableAds[Math.floor(Math.random() * availableAds.length)];
            } else if (ad_ja_pc_num < 6) {
                // 横向き広告の選択
                const availableAds = pc_tate_ads2.filter(ad => ad !== previousAds[ad_ja_pc_num]); // 前回広告を除外
                randomAd = availableAds[Math.floor(Math.random() * availableAds.length)];
            }

            previousAds[ad_ja_pc_num] = randomAd; // 今回の広告を記録

            const adsContainer = document.getElementById(`ad-japanese-pc${ad_ja_pc_num}`);
            if (adsContainer) {
                if (randomAd === "adMax") {
                    adsContainer.style.display = "none"; // 元の広告を非表示
                    const adsContainer2 = document.getElementById(`ad-japanese-pc${ad_ja_pc_num}-2`);
                    if (adsContainer2) adsContainer2.style.display = "block"; // 新しい広告を表示
                } else {
                    adsContainer.innerHTML = randomAd;
                    adsContainer.style.display = "block"; // 元の広告を表示
                    const adsContainer2 = document.getElementById(`ad-japanese-pc${ad_ja_pc_num}-2`);
                    if (adsContainer2) adsContainer2.style.display = "none"; // 新しい広告を非表示
                }
            }
            ad_ja_pc_num++;
        }
    }

    // 最初の広告を表示
    updateAd();

    // 一定間隔で広告を変更（例: 5秒ごと）
    setInterval(updateAd, 20000);

    function adBlockDetected() {
        /*広告ブロッカー検知時の動作*/
        document.getElementById("kk-detected").style.display = "flex";
        console.log("広告ブロッカー検知");
    }
    function adBlockNotDetected() {
        /*広告ブロッカー未検知時の動作*/
        document.getElementById("kk-detected").style.display = "none";
        console.log("広告ブロッカー未検知");
    }
    if (typeof blockAdBlock === "undefined") {
    } else {
        /*広告ブロッカー検知*/
        blockAdBlock.onDetected(adBlockDetected);
        /*広告ブロッカー未検知*/
        blockAdBlock.onNotDetected(adBlockNotDetected);
    }
    const continueWithoutAds = document.getElementById('continueWithout');

    continueWithoutAds.addEventListener('click', function () {
        let countdownElement = document.getElementById("countdown");
        let counter = 5; // 3秒カウント
        countdownElement.textContent = ` ${counter}`; // 初期表示

        let interval = setInterval(function () {
            counter--; // カウントダウン
            countdownElement.textContent = ` ${counter}`;

            if (counter === 0) {
                clearInterval(interval); // カウントダウン停止
                document.getElementById("kk-detected").style.display = "none"; // 非表示にする
            }
        }, 1000); // 1秒ごとに実行
    });
});

async function fetchAppIdAndSecretId() {
    const socket = new WebSocket(url);

    return new Promise((resolve, reject) => {
        socket.addEventListener('open', () => {
            console.log('WebSocket connection established');
        });

        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.app_id && data.secret_key) {
                resolve({ app_id: data.app_id, secret_key: data.secret_key });
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

async function connectvc(userName) {
    try {
        // WebSocketでapp_idとsecret_idを取得
        const { app_id, secret_key } = await fetchAppIdAndSecretId();

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
        }).encode(secret_key);

        await SkyWay_main(Token, userName);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function SkyWay_main(token, userName) {
    const { SkyWayContext, SkyWayRoom, SkyWayStreamFactory } = skyway_room;

    const buttonArea = document.getElementById('button-area');
    const remoteMediaArea = document.getElementById('remote-media-area');
    const roomNameInput = "transceiver";

    const myId = document.getElementById('my-id');
    const myName = document.getElementById('my-name');
    const Memberselem = document.getElementById('Members');
    const IdDisp = document.getElementById('id-disp');
    const joinButton = document.getElementById('join');
    const target = document.getElementById('MuteInfo');
    const NonMutebtn = document.getElementById('NonMute-btn');
    const leavebtn = document.getElementById('leave');
    const participantList = document.getElementById('participant-list');

    isMuted = false;

    const userPositions = {};

    const socket = await establishWebSocketConnection();

    // マイクストリームの取得
    let audio = null;
    try {
        audio = await SkyWayStreamFactory.createMicrophoneAudioStream({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
    } catch (error) {
        console.warn('マイクの権限がないか、エラーが発生しました。ミュートで参加します。');
        if (lang === 'ja') {
            alert('マイクの権限がないため、ミュートで参加します。');
        } else {
            alert('You will join muted since microphone access is not granted.');
        }
        isMuted = true;
    }

    if (roomNameInput === '') return;

    const context = await SkyWayContext.Create(token);
    const room = await SkyWayRoom.FindOrCreate(context, {
        type: 'p2p',
        name: roomNameInput,
    });
    const me = await room.join({ name: userName });

    // マイクストリームが取得できた場合のみ公開する
    let publication = null;
    if (audio) {
        publication = await me.publish(audio);
    }

    console.log(`${userName} is connected`);

    if (lang === 'ja') {
        target.textContent = isMuted ? "ミュート中" : "ミュート解除中";
        Memberselem.textContent = Members + "人";
    } else {
        target.textContent = isMuted ? "Muted" : "Unmuted";
        Memberselem.textContent = Members + "people";
    }
    NonMutebtn.style.backgroundColor = isMuted ? "red" : "rgb(147, 235, 235)";
    myId.textContent = me.id;
    myName.textContent = userName;
    IdDisp.style.visibility = "visible";
    NonMutebtn.style.visibility = "visible";
    NonMutebtn.style.opacity = 1;
    joinButton.style.visibility = "hidden";
    leavebtn.style.visibility = "visible";

    leavebtn.onclick = () => {
        me.leave();
        location.reload();
    };

    // ミュートボタンの処理
    NonMutebtn.addEventListener('click', async () => {
        if (isMuted) {
            // ミュート解除時にマイクの権限を要求
            const micPermissionStatus = await navigator.permissions.query({ name: 'microphone' });

            // マイク権限が「拒否」されている場合は、権限を要求する
            if (micPermissionStatus.state !== 'granted') {
                try {
                    // 権限が付与され、マイクが有効になった場合にミュート解除
                    isMuted = false;
                    if (lang === 'ja') {
                        target.textContent = "ミュート解除中";
                    } else {
                        target.textContent = "Unmuted";
                    }
                    NonMutebtn.style.backgroundColor = "rgb(147, 235, 235)";
                    // マイクストリームの取得を試みる
                    const audio = await SkyWayStreamFactory.createMicrophoneAudioStream({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }
                    });
                    publication = null
                    // ストリームが取得できた場合、パブリッシュする
                    if (audio) {
                        publication = await me.publish(audio);
                    }
                    await publication.enable();
                } catch (error) {
                    // 権限が付与され、マイクが有効になった場合にミュート解除
                    console.log(error)
                    isMuted = true;
                    if (lang === 'ja') {
                        target.textContent = "ミュート中";
                    } else {
                        target.textContent = "Muted";
                    }
                    NonMutebtn.style.backgroundColor = "red";
                    // マイク権限が拒否された場合の処理
                    console.error('マイク権限が拒否されました。ミュートのままです。', error);
                    if (lang === 'ja') {
                        alert('マイクの権限が拒否されたため、ミュート解除できません。');
                    } else {
                        alert('Microphone access was denied. Unable to unmute.');
                    }
                }
            } else {
                // 既にマイクの権限が付与されている場合は、普通にミュート解除
                await publication.enable();
                isMuted = false;
                if (lang === 'ja') {
                    target.textContent = "ミュート解除中";
                } else {
                    target.textContent = "Unmuted";
                }
                NonMutebtn.style.backgroundColor = "rgb(147, 235, 235)";
            }
        } else {
            // ミュート状態にする
            isMuted = true;
            if (lang === 'ja') {
                target.textContent = "ミュート中";
            } else {
                target.textContent = "Muted";
            }
            NonMutebtn.style.backgroundColor = "red";
            await publication.disable();
        }
    });

    // 参加者リストの更新関数
    const updateParticipantList = () => {
        Members = 0
        participantList.innerHTML = '';
        room.members.forEach(member => {
            Members++; // ここでもメンバー数を増やす
            if (lang === 'ja') {
                Memberselem.textContent = Members + "人";
            } else {
                Memberselem.textContent = Members + "people";
            }
            const listItem = document.createElement('li');
            const volumeSlider = document.createElement('input');
            const volumeIcon = document.createElement('span'); // 🔊アイコン用の要素

            // 参加者の名前を取得
            const name = member.name || member.id;
            listItem.textContent = name;

            // 音量アイコンを追加
            volumeIcon.textContent = '🔊';
            volumeIcon.style.marginLeft = '10px'; // 名前とアイコンの間隔を調整

            // 音量調整用のスライダーを作成
            volumeSlider.type = 'range';
            volumeSlider.min = '0';
            volumeSlider.max = '100';
            volumeSlider.value = slider[member.name] !== undefined ? slider[member.name] : 100; // スライダーの初期値は保存されている値、なければ100
            // スライダーの変更イベントをリッスンし、sliderオブジェクトに値を保存
            volumeSlider.addEventListener('input', () => {
                slider[member.name] = volumeSlider.value; // スライダーの値をslider[member.name]に保存
                if (slider[member.name] == 0) {
                    volumeIcon.textContent = '🔇';
                } else if (slider[member.name] > 50) {
                    volumeIcon.textContent = '🔊';
                } else if (slider[member.name] <= 50 && slider[member.name] > 25) {
                    volumeIcon.textContent = '🔉';
                } else if (slider[member.name] <= 25 && slider[member.name] > 0) {
                    volumeIcon.textContent = '🔈';
                }
            });
            // リストアイテムにアイコンとスライダーを追加
            listItem.appendChild(volumeIcon);
            listItem.appendChild(volumeSlider);
            participantList.appendChild(listItem);
        });
    };

    // subscribeAndAttach内で呼ばれる音量調整関数を修正
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

                // WebSocketのメッセージイベントをリッスンし、位置データに基づいて音量を調整
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
                            adjustVolume(mediaElement, userPositions[myName.textContent], userPositions[name], name);
                        }
                    }
                });

            } catch (error) {
                console.error('Failed to subscribe to publication:', error);
            }
        };

        subscribeButton.click();
        updateParticipantList(); // 参加者リストの更新
    };

    room.onStreamPublished.add((e) => {
        subscribeAndAttach(e.publication);
    });

    room.onMemberJoined.add((e) => {
        // メンバー数を更新する
        updateParticipantList();
    });

    room.onMemberLeft.add((e) => {
        updateParticipantList();
    });

    room.publications.forEach(publication => {
        subscribeAndAttach(publication);
    });

    updateParticipantList(); // 初期参加者リストの更新

    if (publication) {
        await publication.enable();
    }
}

// ページ読み込み時にボタンイベントハンドラを設定
window.onload = async function () {
    const joinButton = document.getElementById('join');
    joinButton.onclick = async () => {
        const userName = document.getElementById('user-name').value.trim();
        const address = document.getElementById('address-input').value.trim();
        url = `wss://${address}.tcpexposer.com`;
        if (userName === '') {
            if (lang === 'ja') {
                alert('名前を入力してください');
            } else {
                alert('Please enter your name.');
            }
            return;
        }
        const socket = new WebSocket(url);
        let pass = true
        socket.addEventListener('message', async (event) => {
            const data = JSON.parse(event.data);
            const password = data.password;
            const passwords = data.passwords;
            if (password) {
                let userInput = "";
                if (lang === 'ja') {
                    userInput = prompt("パスワードを入力してください\n※マイクラで!nameと打つと確認できます");
                } else {
                    userInput = prompt("Please enter password\n*You can check it by typing !name in Minecraft");
                }
                if (userInput === null) {
                    if (lang === 'ja') {
                        alert("パスワードが違います");
                    } else {
                        alert("Incorrect password");
                    }
                    socket.close();
                    return;
                }
                if (userInput == passwords[userName]) {
                    socket.close();
                    await connectvc(userName);
                }
                else {
                    if (lang === 'ja') {
                        alert("パスワードが違います");
                    } else {
                        alert("Incorrect password");
                    }
                    socket.close();
                    return;
                }
            } else {
                socket.close();
                await connectvc(userName);
            }
        });
    }
};

navigator.permissions.query({ name: 'microphone' }).then((result) => {
    if (result.state === 'granted') {
        console.log("マイクを利用します");
    } else {
        if (lang === 'ja') {
            alert("マイクを使用する権限を与えて下さい");
        } else {
            alert("Please grant microphone permissions.");
        }
        console.log("マイクの権限取得エラーです");
    }
});


function calculateDistance(pos1, pos2) {
    return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
    );
}

// 音量調整を位置データとスライダーの値を使って行う関数
function adjustVolume(mediaElement, pos1, pos2, name) {
    if (!pos1 || !pos2 || typeof pos1.x !== 'number' || typeof pos1.y !== 'number' || typeof pos1.z !== 'number' ||
        typeof pos2.x !== 'number' || typeof pos2.y !== 'number' || typeof pos2.z !== 'number') {
        console.error('Invalid positions:', pos1, pos2);
        mediaElement.volume = 0;
        mediaElement.muted = true;
        return;
    }
    const sliderValue = slider[name] !== undefined ? Number(slider[name]) : 100; // デフォルト値は100
    const SliderVolume = sliderValue / 100;
    const distance = calculateDistance(pos1, pos2);
    const minVolume = 0;
    let volume = Math.max(minVolume, 1 - (distance / serverDistance)); // serverDistance を使用
    volume = volume * SliderVolume
    if (volume == 0) {
        mediaElement.volume = minVolume;
        mediaElement.muted = true;
    } else {
        mediaElement.volume = volume;
        mediaElement.muted = false;
    }
}
