from flask import Flask, render_template, jsonify, request, url_for
import os
import json
import random

app = Flask(__name__)

# Carregar dados dos personagens
def load_characters():
    characters = [
        {
            "id": 1,
            "name": "Freddy Fazbear",
            "rarity": "Lendária",
            "health": 100,
            "attack": 25,
            "defense": 20,
            "image": "freddy.jpg",
            "special_power": {
                "name": "Melodia Assustadora",
                "description": "Reduz o ataque do oponente em 30% por 2 turnos e causa 15 de dano.",
                "damage": 15,
                "effects": [{"type": "attack_reduction", "value": 0.3, "duration": 2}]
            },
            "passive": "Líder do Grupo: Aumenta o ataque de todas as cartas animatrônicos em 10%."
        },
        {
            "id": 2,
            "name": "Bonnie",
            "rarity": "Épica",
            "health": 85,
            "attack": 30,
            "defense": 15,
            "image": "bonnie.png",
            "special_power": {
                "name": "Solo de Guitarra",
                "description": "Causa 35 de dano e tem 20% de chance de atordoar o oponente por 1 turno.",
                "damage": 35,
                "effects": [{"type": "stun", "chance": 0.2, "duration": 1}]
            },
            "passive": "Sombra Silenciosa: 15% de chance de esquivar de um ataque."
        },
        {
            "id": 3,
            "name": "Chica",
            "rarity": "Épica",
            "health": 80,
            "attack": 20,
            "defense": 25,
            "image": "chica.png",
            "special_power": {
                "name": "Cupcake Venenoso",
                "description": "Causa 20 de dano e envenena o oponente (5 de dano por turno por 3 turnos).",
                "damage": 20,
                "effects": [{"type": "poison", "value": 5, "duration": 3}]
            },
            "passive": "Cozinheira: Recupera 5 de vida a cada turno."
        },
        {
            "id": 4,
            "name": "Foxy",
            "rarity": "Épica",
            "health": 70,
            "attack": 40,
            "defense": 10,
            "image": "foxy.png",
            "special_power": {
                "name": "Investida Pirata",
                "description": "Causa 50 de dano, mas Foxy fica vulnerável no próximo turno (defesa reduzida em 50%).",
                "damage": 50,
                "effects": [{"type": "self_defense_reduction", "value": 0.5, "duration": 1}]
            },
            "passive": "Velocidade: 25% de chance de atacar duas vezes."
        },
        {
            "id": 5,
            "name": "Golden Freddy",
            "rarity": "Lendária",
            "health": 90,
            "attack": 35,
            "defense": 30,
            "image": "goldenfreddy.png",
            "special_power": {
                "name": "Alucinação",
                "description": "50% de chance de fazer o oponente perder o próximo turno.",
                "damage": 0,
                "effects": [{"type": "skip_turn", "chance": 0.5, "duration": 1}]
            },
            "passive": "Aparição Fantasmagórica: 20% de chance de refletir o dano recebido."
        },
        {
            "id": 6,
            "name": "Puppet",
            "rarity": "Lendária",
            "health": 75,
            "attack": 15,
            "defense": 40,
            "image": "puppet.png",
            "special_power": {
                "name": "Caixa de Música",
                "description": "Coloca o oponente para 'dormir' por 1 turno e recupera 20 de vida.",
                "damage": 0,
                "effects": [{"type": "sleep", "duration": 1}, {"type": "heal", "value": 20}]
            },
            "passive": "Protetor: Reduz o dano recebido em 20%."
        },
        {
            "id": 7,
            "name": "Springtrap",
            "rarity": "Lendária",
            "health": 95,
            "attack": 45,
            "defense": 15,
            "image": "springtrap.png",
            "special_power": {
                "name": "Armadilha Mortal",
                "description": "Causa 40 de dano e impede o uso de poderes especiais do oponente por 2 turnos.",
                "damage": 40,
                "effects": [{"type": "disable_special", "duration": 2}]
            },
            "passive": "Imortal: Ao ser derrotado, tem 30% de chance de reviver com 30% da vida."
        },
        {
            "id": 8,
            "name": "Balloon Boy",
            "rarity": "Rara",
            "health": 60,
            "attack": 10,
            "defense": 20,
            "image": "ballonboy.png",
            "special_power": {
                "name": "Roubo de Baterias",
                "description": "Reduz o ataque do oponente em 50% por 1 turno.",
                "damage": 0,
                "effects": [{"type": "attack_reduction", "value": 0.5, "duration": 1}]
            },
            "passive": "Risada Irritante: 10% de chance de confundir o oponente, fazendo-o atacar a si mesmo."
        },
        {
            "id": 9,
            "name": "Mangle",
            "rarity": "Épica",
            "health": 65,
            "attack": 35,
            "defense": 15,
            "image": "mangle.png",
            "special_power": {
                "name": "Interferência de Rádio",
                "description": "Causa confusão no oponente (50% de chance de errar o próximo ataque).",
                "damage": 0,
                "effects": [{"type": "confusion", "chance": 0.5, "duration": 1}]
            },
            "passive": "Corpo Desmontado: 25% de chance de reduzir o dano recebido para 0."
        },
        {
            "id": 10,
            "name": "Toy Freddy",
            "rarity": "Rara",
            "health": 75,
            "attack": 20,
            "defense": 25,
            "image": "toyfreddy.png",
            "special_power": {
                "name": "Luz Cegante",
                "description": "Reduz a precisão do oponente em 40% por 2 turnos.",
                "damage": 0,
                "effects": [{"type": "accuracy_reduction", "value": 0.4, "duration": 2}]
            },
            "passive": "Tecnologia Avançada: Aumenta a defesa em 5 a cada turno."
        },
        {
            "id": 11,
            "name": "Nightmare Freddy",
            "rarity": "Mítica",
            "health": 110,
            "attack": 40,
            "defense": 25,
            "image": "nightmarryfreddy.png",
            "special_power": {
                "name": "Pesadelo Coletivo",
                "description": "Invoca mini-Freddys que causam 10 de dano cada por 3 turnos.",
                "damage": 10,
                "effects": [{"type": "dot", "value": 10, "duration": 3}]
            },
            "passive": "Terror Noturno: Aumenta o dano causado em 20% durante turnos noturnos."
        },
        {
            "id": 12,
            "name": "Circus Baby",
            "rarity": "Mítica",
            "health": 85,
            "attack": 30,
            "defense": 30,
            "image": "circusbaby.png",
            "special_power": {
                "name": "Garra Mecânica",
                "description": "Captura o oponente, impedindo-o de atacar por 1 turno e causa 25 de dano.",
                "damage": 25,
                "effects": [{"type": "stun", "duration": 1}]
            },
            "passive": "Sorvete Tentador: 25% de chance de atrair o oponente, reduzindo sua defesa em 30%."
        }
    ]
    return characters

# Lista de imagens de jumpscare
JUMPSCARES = [
    "freddy_jumpscare.jpg",
    "bonnie_jumpscare.jpg",
    "chica_jumpscare.jpg",
    "foxy_jumpscare.jpg",
    "golden_freddy_jumpscare.jpg",
    "springtrap_jumpscare.jpg",
    "puppet_jumpscare.jpg",
    "nightmare_freddy_jumpscare.jpg"
]

# Criar diretórios para imagens se não existirem
def create_image_directories():
    os.makedirs('static/images/characters', exist_ok=True)
    os.makedirs('static/images/jumpscares', exist_ok=True)
    os.makedirs('static/images/backgrounds', exist_ok=True)
    os.makedirs('static/sounds', exist_ok=True)

# Criar arquivos de placeholder para imagens
def create_placeholder_images():
    # Criar placeholder para imagens de personagens
    characters = load_characters()
    for character in characters:
        placeholder_path = os.path.join('static/images/characters', character['image'])
        if not os.path.exists(placeholder_path):
            with open(placeholder_path, 'w') as f:
                f.write(f"Placeholder for {character['name']} image")
    
    # Criar placeholder para imagens de jumpscare
    for jumpscare in JUMPSCARES:
        placeholder_path = os.path.join('static/images/jumpscares', jumpscare)
        if not os.path.exists(placeholder_path):
            with open(placeholder_path, 'w') as f:
                f.write(f"Placeholder for {jumpscare}")
    
    # Criar placeholder para som de jumpscare
    sound_path = os.path.join('static/sounds', 'jumpscare.mp3')
    if not os.path.exists(sound_path):
        with open(sound_path, 'w') as f:
            f.write("Placeholder for jumpscare sound")

# Rota principal
@app.route('/')
def index():
    return render_template('index.html')

# Rota para obter cartas
@app.route('/get_cards')
def get_cards():
    characters = load_characters()
    
    # Selecionar 4 cartas aleatórias para o jogador
    player_cards = random.sample(characters, 4)
    
    # Selecionar cartas para o computador (excluindo as do jogador)
    remaining_cards = [c for c in characters if c not in player_cards]
    computer_cards = random.sample(remaining_cards, 4)
    
    return jsonify({
        'player_cards': player_cards,
        'computer_cards': computer_cards
    })

# Rota para obter jumpscare
@app.route('/get_jumpscare')
def get_jumpscare():
    jumpscare = random.choice(JUMPSCARES)
    return jsonify({
        'image_url': url_for('static', filename=f'images/jumpscares/{jumpscare}'),
        'sound_url': url_for('static', filename='sounds/jumpscare.mp3')
    })

# Rota para processar ação do jogador (para expansão futura)
@app.route('/player_action', methods=['POST'])
def player_action():
    data = request.json
    action_type = data.get('action_type')
    player_card = data.get('player_card')
    computer_card = data.get('computer_card')
    
    # Lógica para processar a ação do jogador
    result = {
        'success': True,
        'message': f'Ação {action_type} processada com sucesso',
        'damage': 0,
        'effects': []
    }
    
    # Exemplo de lógica para ataque normal
    if action_type == 'attack':
        damage = max(1, player_card['attack'] - computer_card['defense'] // 2)
        result['damage'] = damage
        result['message'] = f"{player_card['name']} atacou e causou {damage} de dano!"
    
    # Exemplo de lógica para poder especial
    elif action_type == 'special':
        special_power = player_card['special_power']
        damage = special_power['damage']
        result['damage'] = damage
        result['effects'] = special_power['effects']
        result['message'] = f"{player_card['name']} usou {special_power['name']} e causou {damage} de dano!"
    
    return jsonify(result)

# Inicialização
if __name__ == '__main__':
    create_image_directories()
    create_placeholder_images()
    app.run(host='0.0.0.0', port=5000, debug=True)
