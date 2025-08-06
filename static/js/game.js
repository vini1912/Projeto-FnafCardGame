// FNAF Card Battle - Game Logic
document.addEventListener('DOMContentLoaded', function() {
    // Elementos da interface
    const playerCardsContainer = document.getElementById('player-cards');
    const computerCardContainer = document.getElementById('computer-card');
    const gameMessages = document.getElementById('game-messages');
    const attackButton = document.getElementById('attack-button');
    const specialButton = document.getElementById('special-button');
    const endTurnButton = document.getElementById('end-turn-button');
    const newGameButton = document.getElementById('new-game-button');
    const rulesButton = document.getElementById('rules-button');
    const closeRulesButton = document.getElementById('close-rules');
    const rulesModal = document.getElementById('rules-modal');
    const jumpscareModal = document.getElementById('jumpscare-modal');
    const jumpscareImage = document.getElementById('jumpscare-image');
    const jumpscareSound = document.getElementById('jumpscare-sound');
    const loadingScreen = document.getElementById('loading');
    const dayNightIndicator = document.getElementById('dayNightIndicator');
    const dayNightIcon = document.getElementById('dayNightIcon');

    // Estatísticas do jogo
    const playerHealthDisplay = document.getElementById('player-health');
    const playerEnergyDisplay = document.getElementById('player-energy');
    const computerHealthDisplay = document.getElementById('computer-health');
    const computerEnergyDisplay = document.getElementById('computer-energy');
    const computerCardNameDisplay = document.getElementById('computer-card-name');
    const turnCounterDisplay = document.getElementById('turn-counter');
    const playerHealthBar = document.getElementById('player-health-bar');
    const playerEnergyBar = document.getElementById('player-energy-bar');
    const computerHealthBar = document.getElementById('computer-health-bar');
    const computerEnergyBar = document.getElementById('computer-energy-bar');

    // Estado do jogo
    let gameState = {
        playerHealth: 100,
        playerMaxHealth: 100,
        playerEnergy: 3,
        playerMaxEnergy: 3,
        computerHealth: 100,
        computerMaxHealth: 100,
        computerEnergy: 3,
        computerMaxEnergy: 3,
        turn: 1,
        isPlayerTurn: true,
        selectedCard: null,
        computerCard: null,
        isNight: true,
        gameOver: false,
        playerEffects: [],
        computerEffects: []
    };

    // Inicializar o jogo
    function initGame() {
        // Esconder tela de carregamento após 2 segundos
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 2000);

        // Resetar estado do jogo
        resetGameState();

        // Carregar cartas do servidor
        fetchCards();

        // Configurar eventos dos botões
        setupButtonEvents();

        // Atualizar interface
        updateUI();
    }

    // Resetar estado do jogo
    function resetGameState() {
        gameState = {
            playerHealth: 100,
            playerMaxHealth: 100,
            playerEnergy: 3,
            playerMaxEnergy: 3,
            computerHealth: 100,
            computerMaxHealth: 100,
            computerEnergy: 3,
            computerMaxEnergy: 3,
            turn: 1,
            isPlayerTurn: true,
            selectedCard: null,
            computerCard: null,
            isNight: true,
            gameOver: false,
            playerEffects: [],
            computerEffects: []
        };

        // Limpar mensagens
        clearMessages();
        addMessage('Bem-vindo ao FNAF Card Battle! Selecione uma carta para começar.', 'system');

        // Atualizar interface
        updateUI();
    }

    // Buscar cartas do servidor
    function fetchCards() {
        fetch('/get_cards')
            .then(response => response.json())
            .then(data => {
                // Renderizar cartas do jogador
                renderPlayerCards(data.player_cards);
                
                // Selecionar carta do computador aleatoriamente
                const computerCardIndex = Math.floor(Math.random() * data.computer_cards.length);
                gameState.computerCard = data.computer_cards[computerCardIndex];
                
                // Atualizar estatísticas baseadas nas cartas
                updateCardStats();
                
                // Renderizar carta do computador (virada para baixo inicialmente)
                renderComputerCard();
            })
            .catch(error => {
                console.error('Erro ao carregar cartas:', error);
                addMessage('Erro ao carregar cartas. Tente novamente.', 'system');
            });
    }

    // Renderizar cartas do jogador
    function renderPlayerCards(cards) {
        playerCardsContainer.innerHTML = '';
        
        cards.forEach(card => {
            const cardElement = createCardElement(card);
            cardElement.addEventListener('click', () => selectCard(card, cardElement));
            playerCardsContainer.appendChild(cardElement);
        });
    }

    // Renderizar carta do computador
    function renderComputerCard() {
        computerCardContainer.innerHTML = '';
        
        if (gameState.computerCard) {
            const cardBack = document.createElement('div');
            cardBack.className = 'card';
            cardBack.innerHTML = `
                <div class="card-header">
                    <h3 class="card-name">???</h3>
                    <div class="card-rarity">Desconhecido</div>
                </div>
                <img src="/static/images/card_back.jpg" alt="Carta do Computador" class="card-image">
                <div class="card-body">
                    <div class="card-stats">
                        <div class="card-stat">
                            <span class="card-stat-label">ATK</span>
                            <span class="card-stat-value">?</span>
                        </div>
                        <div class="card-stat">
                            <span class="card-stat-label">DEF</span>
                            <span class="card-stat-value">?</span>
                        </div>
                        <div class="card-stat">
                            <span class="card-stat-label">HP</span>
                            <span class="card-stat-value">?</span>
                        </div>
                    </div>
                    <div class="card-power">Poder: ???</div>
                    <div class="card-description">Esta carta está oculta.</div>
                </div>
            `;
            computerCardContainer.appendChild(cardBack);
        }
    }

    // Revelar carta do computador
    function revealComputerCard() {
        computerCardContainer.innerHTML = '';
        
        if (gameState.computerCard) {
            const cardElement = createCardElement(gameState.computerCard);
            computerCardContainer.appendChild(cardElement);
            computerCardNameDisplay.textContent = gameState.computerCard.name;
        }
    }

    // Criar elemento de carta
    function createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.rarity.toLowerCase()}`;
        cardElement.innerHTML = `
            <div class="card-header">
                <h3 class="card-name">${card.name}</h3>
                <div class="card-rarity">${card.rarity}</div>
            </div>
            <img src="/static/images/characters/${card.image}" alt="${card.name}" class="card-image" onerror="this.onerror=null; this.src='/static/images/characters/freddy.jpg'">
            <div class="card-body">
                <div class="card-stats">
                    <div class="card-stat">
                        <span class="card-stat-label">ATK</span>
                        <span class="card-stat-value">${card.attack}</span>
                    </div>
                    <div class="card-stat">
                        <span class="card-stat-label">DEF</span>
                        <span class="card-stat-value">${card.defense}</span>
                    </div>
                    <div class="card-stat">
                        <span class="card-stat-label">HP</span>
                        <span class="card-stat-value">${card.health}</span>
                    </div>
                </div>
                <div class="card-power">Poder: ${card.special_power.name}</div>
                <div class="card-description">${card.special_power.description}</div>
            </div>
        `;
        return cardElement;
    }

    // Selecionar carta
    function selectCard(card, cardElement) {
        // Remover seleção anterior
        const selectedCards = document.querySelectorAll('.card.selected');
        selectedCards.forEach(card => card.classList.remove('selected'));
        
        // Selecionar nova carta
        cardElement.classList.add('selected');
        gameState.selectedCard = card;
        
        // Atualizar estatísticas
        updateCardStats();
        
        // Habilitar botões
        enableGameButtons();
        
        addMessage(`Você selecionou ${card.name}!`, 'player');
    }

    // Atualizar estatísticas baseadas nas cartas
    function updateCardStats() {
        if (gameState.selectedCard) {
            gameState.playerMaxHealth = gameState.selectedCard.health;
            gameState.playerHealth = gameState.playerMaxHealth;
        }
        
        if (gameState.computerCard) {
            gameState.computerMaxHealth = gameState.computerCard.health;
            gameState.computerHealth = gameState.computerMaxHealth;
        }
        
        updateUI();
    }

    // Configurar eventos dos botões
    function setupButtonEvents() {
        // Botão de ataque
        attackButton.addEventListener('click', () => {
            if (gameState.isPlayerTurn && !gameState.gameOver) {
                playerAttack();
            }
        });
        
        // Botão de poder especial
        specialButton.addEventListener('click', () => {
            if (gameState.isPlayerTurn && !gameState.gameOver && gameState.playerEnergy >= 1) {
                playerSpecialAttack();
            }
        });
        
        // Botão de finalizar turno
        endTurnButton.addEventListener('click', () => {
            if (gameState.isPlayerTurn && !gameState.gameOver) {
                endPlayerTurn();
            }
        });
        
        // Botão de novo jogo
        newGameButton.addEventListener('click', () => {
            initGame();
        });
        
        // Botão de regras
        rulesButton.addEventListener('click', () => {
            rulesModal.style.display = 'flex';
        });
        
        // Botão de fechar regras
        closeRulesButton.addEventListener('click', () => {
            rulesModal.style.display = 'none';
        });
    }

    // Ataque normal do jogador
    function playerAttack() {
        if (!gameState.selectedCard) return;
        
        // Calcular dano baseado no ataque da carta e defesa do oponente
        const attackValue = calculateAttackValue(gameState.selectedCard.attack, gameState.isNight);
        const defenseValue = calculateDefenseValue(gameState.computerCard.defense, gameState.isNight);
        const damage = Math.max(1, attackValue - defenseValue / 2);
        
        // Aplicar dano
        gameState.computerHealth = Math.max(0, gameState.computerHealth - damage);
        
        // Adicionar mensagem
        addMessage(`${gameState.selectedCard.name} atacou e causou ${damage} de dano!`, 'player');
        
        // Verificar se o jogo acabou
        if (gameState.computerHealth <= 0) {
            endGame(true);
            return;
        }
        
        // Finalizar turno do jogador
        endPlayerTurn();
    }

    // Poder especial do jogador
    function playerSpecialAttack() {
        if (!gameState.selectedCard || gameState.playerEnergy < 1) return;
        
        // Consumir energia
        gameState.playerEnergy--;
        
        // Aplicar efeito do poder especial
        const specialPower = gameState.selectedCard.special_power;
        addMessage(`${gameState.selectedCard.name} usou ${specialPower.name}!`, 'player');
        
        // Simular efeito do poder especial (na versão completa, isso seria implementado de forma específica para cada poder)
        const damage = specialPower.damage || Math.round(gameState.selectedCard.attack * 1.5);
        gameState.computerHealth = Math.max(0, gameState.computerHealth - damage);
        
        addMessage(`O poder causou ${damage} de dano!`, 'system');
        
        // Verificar se o jogo acabou
        if (gameState.computerHealth <= 0) {
            endGame(true);
            return;
        }
        
        // Finalizar turno do jogador
        endPlayerTurn();
    }

    // Finalizar turno do jogador
    function endPlayerTurn() {
        gameState.isPlayerTurn = false;
        disableGameButtons();
        
        // Revelar carta do computador se for o primeiro turno
        if (gameState.turn === 1) {
            revealComputerCard();
        }
        
        // Processar efeitos ativos
        processEffects();
        
        // Atualizar interface
        updateUI();
        
        // Turno do computador após um pequeno delay
        setTimeout(computerTurn, 1500);
    }

    // Turno do computador
    function computerTurn() {
        addMessage(`Turno do oponente (${gameState.computerCard.name})...`, 'computer');
        
        // Decidir ação do computador
        if (gameState.computerEnergy >= 1 && Math.random() > 0.4) {
            // Usar poder especial
            computerSpecialAttack();
        } else {
            // Ataque normal
            computerAttack();
        }
        
        // Verificar se o jogo acabou
        if (gameState.playerHealth <= 0) {
            endGame(false);
            return;
        }
        
        // Finalizar turno do computador
        endComputerTurn();
    }

    // Ataque normal do computador
    function computerAttack() {
        // Calcular dano baseado no ataque da carta e defesa do jogador
        const attackValue = calculateAttackValue(gameState.computerCard.attack, gameState.isNight);
        const defenseValue = calculateDefenseValue(gameState.selectedCard.defense, gameState.isNight);
        const damage = Math.max(1, attackValue - defenseValue / 2);
        
        // Aplicar dano
        gameState.playerHealth = Math.max(0, gameState.playerHealth - damage);
        
        // Adicionar mensagem
        addMessage(`${gameState.computerCard.name} atacou e causou ${damage} de dano!`, 'computer');
        
        // Efeito visual de dano
        document.querySelector('.player-area').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.player-area').classList.remove('shake');
        }, 500);
    }

    // Poder especial do computador
    function computerSpecialAttack() {
        // Consumir energia
        gameState.computerEnergy--;
        
        // Aplicar efeito do poder especial
        const specialPower = gameState.computerCard.special_power;
        addMessage(`${gameState.computerCard.name} usou ${specialPower.name}!`, 'computer');
        
        // Simular efeito do poder especial
        const damage = specialPower.damage || Math.round(gameState.computerCard.attack * 1.5);
        gameState.playerHealth = Math.max(0, gameState.playerHealth - damage);
        
        addMessage(`O poder causou ${damage} de dano!`, 'system');
        
        // Efeito visual de dano especial
        document.querySelector('.player-area').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.player-area').classList.remove('shake');
        }, 500);
    }

    // Finalizar turno do computador
    function endComputerTurn() {
        gameState.isPlayerTurn = true;
        gameState.turn++;
        
        // Recarregar energia
        if (gameState.playerEnergy < gameState.playerMaxEnergy) {
            gameState.playerEnergy++;
        }
        if (gameState.computerEnergy < gameState.computerMaxEnergy) {
            gameState.computerEnergy++;
        }
        
        // Alternar entre dia e noite a cada 3 turnos
        if (gameState.turn % 3 === 0) {
            gameState.isNight = !gameState.isNight;
            updateDayNightIndicator();
            
            const timeOfDay = gameState.isNight ? 'noite' : 'dia';
            addMessage(`O ciclo mudou para ${timeOfDay}!`, 'system');
        }
        
        // Processar efeitos ativos
        processEffects();
        
        // Verificar condição de vitória por turnos
        if (gameState.turn > 10) {
            const playerWins = gameState.playerHealth > gameState.computerHealth;
            endGame(playerWins);
            return;
        }
        
        // Habilitar botões
        enableGameButtons();
        
        // Atualizar interface
        updateUI();
        
        addMessage(`Seu turno! (Turno ${gameState.turn})`, 'system');
    }

    // Processar efeitos ativos
    function processEffects() {
        // Implementação simplificada - na versão completa, processaria efeitos específicos
        
        // Remover efeitos expirados
        gameState.playerEffects = gameState.playerEffects.filter(effect => {
            effect.duration--;
            return effect.duration > 0;
        });
        
        gameState.computerEffects = gameState.computerEffects.filter(effect => {
            effect.duration--;
            return effect.duration > 0;
        });
    }

    // Calcular valor de ataque considerando bônus de dia/noite
    function calculateAttackValue(baseAttack, isNight) {
        if (isNight) {
            return Math.round(baseAttack * 1.1); // +10% à noite
        } else {
            return Math.round(baseAttack * 0.95); // -5% durante o dia
        }
    }

    // Calcular valor de defesa considerando bônus de dia/noite
    function calculateDefenseValue(baseDefense, isNight) {
        if (isNight) {
            return Math.round(baseDefense * 0.9); // -10% à noite
        } else {
            return Math.round(baseDefense * 1.05); // +5% durante o dia
        }
    }

    // Atualizar indicador de dia/noite
    function updateDayNightIndicator() {
        if (gameState.isNight) {
            dayNightIndicator.className = 'day-night-indicator night-indicator';
            dayNightIcon.textContent = '🌙';
            document.body.classList.add('night-mode');
            document.body.classList.remove('day-mode');
        } else {
            dayNightIndicator.className = 'day-night-indicator day-indicator';
            dayNightIcon.textContent = '☀️';
            document.body.classList.add('day-mode');
            document.body.classList.remove('night-mode');
        }
    }

    // Finalizar jogo
    function endGame(playerWins) {
        gameState.gameOver = true;
        disableGameButtons();
        
        if (playerWins) {
            addMessage("Você venceu! Os animatrônicos foram derrotados!", "system");
        } else {
            addMessage("Você perdeu! Os animatrônicos venceram!", "system");
            
            // Construir o caminho da imagem do jumpscare do oponente
            if (gameState.computerCard && gameState.computerCard.image) {
                // Extrai o nome base da imagem (ex: 'bonnie.png' -> 'bonnie')
                const baseName = gameState.computerCard.image.split('.')[0]; 
                // Constrói o caminho do jumpscare (ex: '/static/images/jumpscares/bonnie_jumpscare.jpg')
                // Assume que o nome do arquivo de jumpscare segue o padrão [nome_base]_jumpscare.jpg
                const jumpscareImagePath = `/static/images/jumpscares/${baseName}_jumpscare.jpg`;
                
                // Mostrar jumpscare do oponente após um pequeno delay
                setTimeout(() => showJumpscare(jumpscareImagePath), 1500);
            } else {
                console.error("Não foi possível determinar a carta do oponente para o jumpscare.");
                // Opcional: mostrar um jumpscare genérico ou nenhum
            }
        }
    }

    // Mostrar jumpscare (com imagem específica do oponente)
    function showJumpscare(jumpscareImagePath) {
        if (!jumpscareImagePath) {
            console.error('Caminho da imagem do jumpscare não fornecido.');
            return; // Não mostra jumpscare se o caminho não for válido
        }

        jumpscareImage.src = jumpscareImagePath;
        jumpscareModal.style.display = 'flex';

        // Tocar som de jumpscare
        // Garante que o som toque do início se já estiver tocando
        jumpscareSound.currentTime = 0;
        jumpscareSound.play().catch(error => console.error("Erro ao tocar som do jumpscare:", error)); // Adiciona tratamento de erro para play()

        // Esconder jumpscare após alguns segundos
        setTimeout(() => {
            jumpscareModal.style.display = 'none';
        }, 3000); // Duração do jumpscare
    }

    // Habilitar botões do jogo
    function enableGameButtons() {
        if (gameState.gameOver) return;
        
        attackButton.disabled = false;
        specialButton.disabled = gameState.playerEnergy < 1;
        endTurnButton.disabled = false;
    }

    // Desabilitar botões do jogo
    function disableGameButtons() {
        attackButton.disabled = true;
        specialButton.disabled = true;
        endTurnButton.disabled = true;
    }

    // Adicionar mensagem ao log
    function addMessage(text, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = text;
        
        gameMessages.appendChild(messageElement);
        gameMessages.scrollTop = gameMessages.scrollHeight;
        
        // Limitar número de mensagens
        while (gameMessages.children.length > 10) {
            gameMessages.removeChild(gameMessages.firstChild);
        }
    }

    // Limpar mensagens
    function clearMessages() {
        gameMessages.innerHTML = '';
    }

    // Atualizar interface
    function updateUI() {
        // Atualizar estatísticas do jogador
        playerHealthDisplay.textContent = gameState.playerHealth;
        playerEnergyDisplay.textContent = gameState.playerEnergy;
        playerHealthBar.style.width = `${(gameState.playerHealth / gameState.playerMaxHealth) * 100}%`;
        playerEnergyBar.style.width = `${(gameState.playerEnergy / gameState.playerMaxEnergy) * 100}%`;
        
        // Atualizar estatísticas do computador
        computerHealthDisplay.textContent = gameState.computerHealth;
        computerEnergyDisplay.textContent = gameState.computerEnergy;
        computerHealthBar.style.width = `${(gameState.computerHealth / gameState.computerMaxHealth) * 100}%`;
        computerEnergyBar.style.width = `${(gameState.computerEnergy / gameState.computerMaxEnergy) * 100}%`;
        
        // Atualizar contador de turno
        turnCounterDisplay.textContent = gameState.turn;
        
        // Atualizar indicador de dia/noite
        updateDayNightIndicator();
        
        // Atualizar estado dos botões
        if (gameState.isPlayerTurn && !gameState.gameOver) {
            enableGameButtons();
        } else {
            disableGameButtons();
        }
    }

    // Configurar o som de fundo
    const backgroundMusic = document.getElementById('background-music');
    backgroundMusic.volume = 0.5; // Volume a 50%
    
    // Garantir que o som continue tocando mesmo quando o usuário interage com a página
    document.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        }
    });
    
    // Iniciar o jogo
    initGame();
});
