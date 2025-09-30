// ゲームの状態
const state = {
    cash: 0,
    totalCash: 0,
    clicks: 0,
    clickValue: 1,
    mps: 0,
    upgradesBought: 0,
    startTime: Date.now(),
    upgrades: [
        {
            id: 'pin-pad',
            name: '高性能PINパッド',
            description: 'クリックあたりの現金を¥1増やす',
            cost: 10,
            baseCost: 10,
            amount: 0,
            effect: 'click',
            increment: 1
        },
        {
            id: 'security-camera',
            name: '防犯カメラ',
            description: '1秒あたり¥0.10を自動的に稼ぐ',
            cost: 50,
            baseCost: 50,
            amount: 0,
            effect: 'mps',
            increment: 0.1
        },
        {
            id: 'cash-dispenser',
            name: '新型現金ディスペンサー',
            description: '1秒あたり¥1.00を自動的に稼ぐ',
            cost: 200,
            baseCost: 200,
            amount: 0,
            effect: 'mps',
            increment: 1
        },
        {
            id: 'bank-manager',
            name: '銀行管理者',
            description: '1秒あたり¥5.00を自動的に稼ぐ',
            cost: 1000,
            baseCost: 1000,
            amount: 0,
            effect: 'mps',
            increment: 5
        },
        {
            id: 'atm-network',
            name: 'ATMネットワーク',
            description: '1秒あたり¥25.00を自動的に稼ぐ',
            cost: 5000,
            baseCost: 5000,
            amount: 0,
            effect: 'mps',
            increment: 25
        },
        {
            id: 'vault',
            name: '堅牢な金庫',
            description: '1秒あたり¥100.00を自動的に稼ぐ',
            cost: 25000,
            baseCost: 25000,
            amount: 0,
            effect: 'mps',
            increment: 100
        }
    ]
};

// DOM要素
const cashDisplay = document.getElementById('cash-display');
const clickValueDisplay = document.getElementById('click-value');
const mpsValueDisplay = document.getElementById('mps-value');
const totalCashDisplay = document.getElementById('total-cash');
const totalClicksDisplay = document.getElementById('total-clicks');
const upgradesBoughtDisplay = document.getElementById('upgrades-bought');
const activeTimeDisplay = document.getElementById('active-time');
const clickButton = document.getElementById('click-button');
const upgradesContainer = document.getElementById('upgrades-container');
const resetBtn = document.getElementById('reset-btn');
const achievementElement = document.getElementById('achievement');
const achievementText = document.getElementById('achievement-text');
const particlesContainer = document.getElementById('particles');

// 表示用に数値をフォーマット
function formatNumber(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(1) + '兆';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + '億';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e4) { // 1万以上は「万」
        return (num / 1e4).toFixed(1) + '万';
    } else {
        return num.toFixed(0);
    }
}

// 全ての表示を更新
function updateDisplay() {
    cashDisplay.textContent = `¥${formatNumber(state.cash)}`;
    clickValueDisplay.textContent = `¥${formatNumber(state.clickValue)}`;
    mpsValueDisplay.textContent = `¥${formatNumber(state.mps)}/秒`;
    totalCashDisplay.textContent = `¥${formatNumber(state.totalCash)}`;
    totalClicksDisplay.textContent = state.clicks.toLocaleString();
    upgradesBoughtDisplay.textContent = state.upgradesBought.toLocaleString();
    
    // プレイ時間を更新
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    activeTimeDisplay.textContent = 
        `${hours > 0 ? hours + '時間 ' : ''}${minutes > 0 ? minutes + '分 ' : ''}${seconds}秒`;
    
    // アップグレードの進捗バーを更新
    document.querySelectorAll('.upgrade-card').forEach(card => {
        const upgradeId = card.dataset.id;
        const upgrade = state.upgrades.find(u => u.id === upgradeId);
        const progress = card.querySelector('.upgrade-progress-bar');
        
        if (upgrade) {
            const percentage = Math.min(100, (state.cash / upgrade.cost) * 100);
            progress.style.width = `${percentage}%`;
        }
        
        // 購入ボタンの有効/無効を更新
        const buyButton = card.querySelector('.buy-button');
        if (buyButton) {
            buyButton.disabled = state.cash < upgrade.cost;
        }
    });
}

// ATMをクリック
function clickATM() {
    state.cash += state.clickValue;
    state.totalCash += state.clickValue;
    state.clicks++;
    
    // 現金アニメーションを表示
    const cashAmount = document.createElement('div');
    cashAmount.className = 'particle';
    // ATM画面の相対的な位置に設定
    const atmRect = clickButton.closest('.atm').getBoundingClientRect();
    const gameAreaRect = particlesContainer.getBoundingClientRect();
    const offsetX = atmRect.left - gameAreaRect.left + atmRect.width / 2;
    const offsetY = atmRect.top - gameAreaRect.top + atmRect.height / 2;

    cashAmount.style.left = `${offsetX + (Math.random() - 0.5) * 50}px`;
    cashAmount.style.top = `${offsetY + (Math.random() - 0.5) * 50}px`;
    cashAmount.textContent = `+¥${formatNumber(state.clickValue)}`;
    cashAmount.style.fontSize = `${16 + Math.random() * 14}px`;
    cashAmount.style.color = '#4caf50';
    cashAmount.style.textShadow = '0 0 5px rgba(76, 175, 80, 0.7)';
    particlesContainer.appendChild(cashAmount);
    
    // アニメーションして削除
    setTimeout(() => {
        cashAmount.style.transform = 'translateY(-50px) scale(1.5)';
        cashAmount.style.opacity = '0';
        setTimeout(() => cashAmount.remove(), 1000);
    }, 10);
    
    updateDisplay();
    checkAchievements();
}

// アップグレードを購入
function buyUpgrade(upgradeId) {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (state.cash >= upgrade.cost) {
        state.cash -= upgrade.cost;
        state.upgradesBought++;
        
        if (upgrade.effect === 'click') {
            state.clickValue += upgrade.increment;
        } else if (upgrade.effect === 'mps') {
            state.mps = parseFloat((state.mps + upgrade.increment).toFixed(2)); // 小数点誤差対策
        }
        
        upgrade.amount++;
        // 価格上昇: 基本価格 * 1.15の購入回数乗
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.amount));
        
        // カードの表示を更新（特にコスト）
        const costElement = document.querySelector(`.upgrade-card[data-id="${upgradeId}"] .upgrade-cost`);
        if (costElement) {
            costElement.textContent = `¥${formatNumber(upgrade.cost)}`;
        }

        updateDisplay();
        checkAchievements();
    }
}

// 実績をチェック
function checkAchievements() {
    const achievements = [
        { condition: state.totalCash >= 100, text: "初の入金: ¥100を稼いだ" },
        { condition: state.totalCash >= 1000, text: "貯金口座開設: ¥1,000を稼いだ" },
        { condition: state.totalCash >= 10000, text: "富裕層: ¥10,000を稼いだ" },
        { condition: state.totalCash >= 100000, text: "億万長者: ¥100,000を稼いだ" },
        { condition: state.totalCash >= 1000000, text: "大富豪: ¥1,000,000を稼いだ" },
        { condition: state.clicks >= 100, text: "クリッカー: 100回クリックした" },
        { condition: state.upgradesBought >= 5, text: "アップグレードマスター: 5個のアップグレードを購入" },
        { condition: state.mps >= 10, text: "不労所得: 1秒あたり¥10達成" },
        { condition: state.mps >= 100, text: "安定収入: 1秒あたり¥100達成" }
    ];
    
    // 既に実績が解除されたかを追跡するための簡単なオブジェクト
    if (!state.earnedAchievements) {
        state.earnedAchievements = {};
    }

    achievements.forEach((achievement, index) => {
        // 実績のIDとしてインデックスを使用
        const achievementId = index; 

        if (achievement.condition && !state.earnedAchievements[achievementId]) {
            achievementText.textContent = achievement.text;
            achievementElement.classList.add('show');
            
            // 3秒後に非表示
            setTimeout(() => {
                achievementElement.classList.remove('show');
            }, 3000);
            
            // 実績を解除済みにマーク
            state.earnedAchievements[achievementId] = true;
        }
    });
}

// アップグレードカードを作成
function createUpgradeCards() {
    upgradesContainer.innerHTML = '';
    
    state.upgrades.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.dataset.id = upgrade.id;
        
        card.innerHTML = `
            <div class="upgrade-header">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-cost">¥${formatNumber(upgrade.cost)}</div>
            </div>
            <div class="upgrade-description">${upgrade.description} (${upgrade.amount}個所有)</div>
            <div class="upgrade-progress">
                <div class="upgrade-progress-bar" style="width: 0%"></div>
            </div>
            <div class="upgrade-buttons">
                <button class="buy-button" data-id="${upgrade.id}">購入</button>
            </div>
        `;
        
        upgradesContainer.appendChild(card);
    });
    
    // 購入ボタンにイベントリスナーを追加
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', () => {
            buyUpgrade(button.dataset.id);
        });
    });
}

// 自動で現金を生成
function autoGenerateMoney() {
    state.cash = parseFloat((state.cash + state.mps).toFixed(2));
    state.totalCash = parseFloat((state.totalCash + state.mps).toFixed(2));
    updateDisplay();
    checkAchievements();
}

// パーティクルを作成（背景装飾用）
function createParticles() {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
        @keyframes float {
            0% { transform: translate(0, 0); }
            50% { transform: translate(${Math.random() > 0.5 ? 10 : -10}px, -20px); }
            100% { transform: translate(0, 0); }
        }
    `;
    document.head.appendChild(styleTag);

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = `${Math.random() * 5 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        // 色を青系でランダムに
        particle.style.backgroundColor = `hsl(180, 70%, ${Math.random() * 20 + 70}%)`; 
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.animation = `float ${Math.random() * 10 + 5}s infinite ease-in-out alternate`;
        particlesContainer.appendChild(particle);
    }
}

// ゲームをリセット
function resetGame() {
    if (confirm('本当に進行状況をリセットしますか？この操作は元に戻せません。')) {
        // stateのプロパティを初期値にリセット
        state.cash = 0;
        state.totalCash = 0;
        state.clicks = 0;
        state.clickValue = 1;
        state.mps = 0;
        state.upgradesBought = 0;
        state.startTime = Date.now();
        state.earnedAchievements = {}; // 実績もリセット
        
        state.upgrades.forEach(upgrade => {
            upgrade.amount = 0;
            upgrade.cost = upgrade.baseCost;
        });
        
        updateDisplay();
        createUpgradeCards(); // カードを再描画して最新のコストを表示
    }
}

// ゲームの状態をローカルストレージに保存
function saveGame() {
    try {
        // 保存するデータからDOM要素の参照などを除外
        const saveData = {
            cash: state.cash,
            totalCash: state.totalCash,
            clicks: state.clicks,
            clickValue: state.clickValue,
            mps: state.mps,
            upgradesBought: state.upgradesBought,
            startTime: state.startTime,
            upgrades: state.upgrades,
            earnedAchievements: state.earnedAchievements || {}
        };
        
        localStorage.setItem('atmClickerSave', JSON.stringify(saveData));
    } catch (e) {
        console.error("データの保存に失敗しました: ", e);
    }
}

// ローカルストレージからゲームの状態を読み込み
function loadGame() {
    try {
        const savedData = localStorage.getItem('atmClickerSave');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // 既存のstateに上書き
            Object.assign(state, parsedData);
            
            // プレイ時間の計測を継続するために、startTimeのみ現在の時刻で再計算
            // 必要に応じて、長期間放置された場合のオフライン収入計算も実装すべきですが、ここでは省略
            // state.startTime = Date.now() - (Date.now() - parsedData.startTime);
            
            console.log("ゲームデータを読み込みました。");
            return true;
        }
    } catch (e) {
        console.error("データの読み込みに失敗しました: ", e);
    }
    return false;
}

// ゲームの初期化
function init() {
    createParticles();
    createUpgradeCards();
    updateDisplay();
    
    clickButton.addEventListener('click', clickATM);
    resetBtn.addEventListener('click', resetGame);
    
    // 自動での現金生成（1秒ごと）
    setInterval(autoGenerateMoney, 1000);
    
    // 実績表示のクリックで非表示
    document.addEventListener('click', () => {
        if (achievementElement.classList.contains('show')) {
            achievementElement.classList.remove('show');
        }
    });
}

// ゲーム開始
window.addEventListener('load', init);