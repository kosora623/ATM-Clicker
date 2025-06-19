// ゲームの状態変数
let money = 0;
let clickValue = 1; // 1クリックあたりの収入
let cps = 0;        // Cash Per Second (1秒あたりの自動収入)

// アップグレードのコストと効果
const upgrades = {
    banker: {
        cost: 10,
        effect: 1, // 1秒あたり1円増加
        owned: 0
    },
    atmUpgrade: {
        cost: 50,
        effect: 1, // 1クリックあたり1円増加
        owned: 0
    }
};

// DOM要素
const currentMoneyEl = document.getElementById('currentMoney');
const cpsEl = document.getElementById('cps');
const atmButton = document.getElementById('atmButton');
const clickValueEl = document.getElementById('clickValue');
// ATM描画コンテナの参照はここでは使わないが、将来的にアニメーションを追加する際に便利
const atmDrawingContainer = document.querySelector('.atm-drawing-container'); 

const bankerCostEl = document.getElementById('bankerCost');
const bankerEffectEl = document.getElementById('bankerEffect');
const buyBankerButton = document.getElementById('buyBanker');

const atmUpgradeCostEl = document.getElementById('atmUpgradeCost');
const atmUpgradeEffectEl = document.getElementById('atmUpgradeEffect');
const buyAtmUpgradeButton = document.getElementById('buyAtmUpgrade');

// ゲームの状態を更新し、表示に反映する関数
function updateDisplay() {
    currentMoneyEl.textContent = money;
    cpsEl.textContent = cps;
    clickValueEl.textContent = clickValue;

    // 銀行員アップグレードの表示更新
    bankerCostEl.textContent = upgrades.banker.cost;
    bankerEffectEl.textContent = upgrades.banker.effect;
    buyBankerButton.disabled = money < upgrades.banker.cost; // 購入可能かチェック

    // ATM増設アップグレードの表示更新
    atmUpgradeCostEl.textContent = upgrades.atmUpgrade.cost;
    atmUpgradeEffectEl.textContent = upgrades.atmUpgrade.effect;
    buyAtmUpgradeButton.disabled = money < upgrades.atmUpgrade.cost; // 購入可能かチェック
}

// クリック時のお金ポップアップエフェクト
function createMoneyPop(amount) {
    const moneyPop = document.createElement('div');
    moneyPop.classList.add('money-pop');
    moneyPop.textContent = `+${amount}円`;

    // ATMボタンの真ん中あたりに表示
    const rect = atmButton.getBoundingClientRect();
    moneyPop.style.left = `${rect.left + rect.width / 2}px`;
    moneyPop.style.top = `${rect.top - 20}px`; 

    document.body.appendChild(moneyPop);

    moneyPop.addEventListener('animationend', () => {
        moneyPop.remove();
    });
}

// ATMボタンがクリックされた時の処理
atmButton.addEventListener('click', () => {
    money += clickValue;
    createMoneyPop(clickValue); // ポップアップエフェクトを生成
    updateDisplay();
});

// 銀行員を購入する処理
buyBankerButton.addEventListener('click', () => {
    if (money >= upgrades.banker.cost) {
        money -= upgrades.banker.cost;
        cps += upgrades.banker.effect;
        upgrades.banker.owned++;
        upgrades.banker.cost = Math.floor(upgrades.banker.cost * 1.15);
        updateDisplay();
    }
});

// ATM増設を購入する処理
buyAtmUpgradeButton.addEventListener('click', () => {
    if (money >= upgrades.atmUpgrade.cost) {
        money -= upgrades.atmUpgrade.cost;
        clickValue += upgrades.atmUpgrade.effect;
        upgrades.atmUpgrade.owned++;
        upgrades.atmUpgrade.cost = Math.floor(upgrades.atmUpgrade.cost * 1.2);
        updateDisplay();
    }
});


setInterval(() => {
    money += cps;
    updateDisplay();
}, 1000); 

updateDisplay();

function saveGame() {
    const gameData = {
        money: money,
        clickValue: clickValue,
        cps: cps,
        upgrades: upgrades
    };
    localStorage.setItem('atmClickerGame', JSON.stringify(gameData));
    console.log('ゲームを保存しました！');
}

function loadGame() {
    const savedData = localStorage.getItem('atmClickerGame');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        money = gameData.money;
        clickValue = gameData.clickValue;
        cps = gameData.cps;
        if (gameData.upgrades) {
            upgrades.banker = gameData.upgrades.banker || upgrades.banker;
            upgrades.atmUpgrade = gameData.upgrades.atmUpgrade || upgrades.atmUpgrade;
        }
        updateDisplay();
        console.log('ゲームをロードしました！');
    }
}

window.onload = loadGame;

window.onbeforeunload = saveGame;