// 记忆翻牌游戏 JavaScript 逻辑

// 游戏状态变量
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    attempts: 0,
    timer: 0,
    timerInterval: null,
    isGameActive: false,
    isGameOver: false,
    difficulty: 'medium'
};

// 卡片符号集合
const cardSymbols = [
    '🎯', '🎪', '🎨', '🎭', '🎪', '🎡', '🎢', '🎠',
    '🎨', '🎭', '🎯', '🎨', '🎭', '🎯', '🎪', '🎡'
];

// DOM 元素引用
const gameBoard = document.getElementById('game-board');
const difficultySelect = document.getElementById('difficulty-select');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const attemptsDisplay = document.getElementById('attempts');
const matchesDisplay = document.getElementById('matches');
const timerDisplay = document.getElementById('timer');
const gameOverModal = document.getElementById('game-over-modal');
const finalTimeDisplay = document.getElementById('final-time');
const finalAttemptsDisplay = document.getElementById('final-attempts');
const playAgainButton = document.getElementById('play-again-button');

// 初始化游戏
function initGame() {
    // 添加事件监听器
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    playAgainButton.addEventListener('click', startGame);
    difficultySelect.addEventListener('change', () => {
        gameState.difficulty = difficultySelect.value;
    });
    
    // 初始化游戏板
    resetGame();
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    resetGame();
    
    // 根据难度设置游戏参数
    setDifficulty();
    
    // 生成卡片
    generateCards();
    
    // 洗牌并渲染卡片
    shuffleCards();
    renderCards();
    
    // 启动计时器
    startTimer();
    
    // 更新游戏状态
    gameState.isGameActive = true;
    gameState.isGameOver = false;
}

// 重置游戏
function resetGame() {
    // 重置游戏状态
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.attempts = 0;
    gameState.timer = 0;
    gameState.isGameActive = false;
    gameState.isGameOver = true;
    
    // 清除计时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // 清除游戏板
    gameBoard.innerHTML = '';
    
    // 隐藏游戏结束弹窗
    gameOverModal.classList.remove('show');
    
    // 更新显示
    updateStats();
}

// 设置游戏难度
function setDifficulty() {
    // 移除旧的难度类
    gameBoard.classList.remove('easy', 'medium', 'hard');
    
    // 添加新的难度类
    gameBoard.classList.add(gameState.difficulty);
    
    // 根据难度设置卡片数量
    switch (gameState.difficulty) {
        case 'easy':
            gameState.totalPairs = 6; // 12张卡片
            break;
        case 'medium':
            gameState.totalPairs = 8; // 16张卡片
            break;
        case 'hard':
            gameState.totalPairs = 12; // 24张卡片
            break;
    }
}

// 生成卡片
function generateCards() {
    gameState.cards = [];
    
    // 创建卡片对
    for (let i = 0; i < gameState.totalPairs; i++) {
        // 使用卡片符号集合
        const symbol = cardSymbols[i % cardSymbols.length];
        
        // 创建两张相同的卡片
        gameState.cards.push({
            id: i * 2,
            symbol: symbol,
            isFlipped: false,
            isMatched: false
        });
        
        gameState.cards.push({
            id: i * 2 + 1,
            symbol: symbol,
            isFlipped: false,
            isMatched: false
        });
    }
}

// 洗牌算法（Fisher-Yates）
function shuffleCards() {
    for (let i = gameState.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.cards[i], gameState.cards[j]] = [gameState.cards[j], gameState.cards[i]];
    }
}

// 渲染卡片
function renderCards() {
    gameBoard.innerHTML = '';
    
    gameState.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`;
        cardElement.dataset.cardId = card.id;
        
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-back">?</div>
                <div class="card-front">
                    <div class="card-symbol">${card.symbol}</div>
                </div>
            </div>
        `;
        
        // 添加点击事件
        cardElement.addEventListener('click', () => flipCard(card.id));
        
        gameBoard.appendChild(cardElement);
    });
}

// 翻牌逻辑
function flipCard(cardId) {
    // 检查游戏是否活跃
    if (!gameState.isGameActive) return;
    
    const cardIndex = gameState.cards.findIndex(card => card.id === cardId);
    const card = gameState.cards[cardIndex];
    
    // 检查卡片是否已经翻或匹配
    if (card.isFlipped || card.isMatched) return;
    
    // 检查是否已经翻了两张卡片
    if (gameState.flippedCards.length >= 2) return;
    
    // 翻牌
    card.isFlipped = true;
    gameState.flippedCards.push(card);
    
    // 更新界面
    updateCardDisplay(cardId);
    
    // 如果翻了两张卡片，检查是否匹配
    if (gameState.flippedCards.length === 2) {
        gameState.attempts++;
        updateStats();
        
        // 延迟检查匹配，让玩家有时间看到两张卡片
        setTimeout(checkMatch, 1000);
    }
}

// 更新卡片显示
function updateCardDisplay(cardId) {
    const cardElement = gameBoard.querySelector(`[data-card-id="${cardId}"]`);
    const card = gameState.cards.find(card => card.id === cardId);
    
    if (card.isFlipped) {
        cardElement.classList.add('flipped');
    } else {
        cardElement.classList.remove('flipped');
    }
    
    if (card.isMatched) {
        cardElement.classList.add('matched');
    } else {
        cardElement.classList.remove('matched');
    }
}

// 检查卡片匹配
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    
    if (card1.symbol === card2.symbol) {
        // 匹配成功
        card1.isMatched = true;
        card2.isMatched = true;
        gameState.matchedPairs++;
        
        // 更新界面
        updateCardDisplay(card1.id);
        updateCardDisplay(card2.id);
        
        // 检查游戏是否结束
        checkGameOver();
    } else {
        // 匹配失败，翻回去
        card1.isFlipped = false;
        card2.isFlipped = false;
        
        // 更新界面
        updateCardDisplay(card1.id);
        updateCardDisplay(card2.id);
    }
    
    // 清空已翻卡片
    gameState.flippedCards = [];
    
    // 更新统计信息
    updateStats();
}

// 检查游戏是否结束
function checkGameOver() {
    if (gameState.matchedPairs === gameState.totalPairs) {
        // 游戏结束
        gameState.isGameActive = false;
        gameState.isGameOver = true;
        
        // 停止计时器
        stopTimer();
        
        // 显示游戏结束弹窗
        showGameOverModal();
    }
}

// 显示游戏结束弹窗
function showGameOverModal() {
    finalTimeDisplay.textContent = formatTime(gameState.timer);
    finalAttemptsDisplay.textContent = gameState.attempts;
    gameOverModal.classList.add('show');
}

// 启动计时器
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateStats();
    }, 1000);
}

// 停止计时器
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// 格式化时间显示
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 更新统计信息
function updateStats() {
    attemptsDisplay.textContent = gameState.attempts;
    matchesDisplay.textContent = gameState.matchedPairs;
    timerDisplay.textContent = formatTime(gameState.timer);
}

// 重启游戏
function restartGame() {
    stopTimer();
    startGame();
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);
