let gameState = 'intro'; // 'intro', 'question', 'feedback', 'summary'
let questions = []; // Array de objetos de pergunta
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = -1; // -1 = nenhuma selecionada, 0, 1, 2...
let showingFeedback = false;
let feedbackCorrect = false;

// Variáveis para desenhar o terreno e plantas
let terrenoX, terrenoY, terrenoLargura, terrenoAltura;
let plantasStatus = []; // Array para controlar o visual das plantas no terreno ('murcha', 'cresceu')

// Variáveis para animações de acerto
let celebrationStartTime = 0;
const CELEBRATION_DURATION = 1500; // Duração da animação de celebração em milissegundos
let particles = []; // Para as partículas de brilho

// --- Sons (necessário carregar no preload ou setup) ---
let soundCorrect; // Variável para o som de acerto
let soundWrong;   // Variável para o som de erro

function preload() {
  // Carregue seus sons aqui. Certifique-se de ter os arquivos (ex: .mp3, .wav) na pasta do seu projeto.
  // soundFormats('mp3', 'ogg'); // Definir formatos de som (descomente se estiver usando p5.sound)
  // soundCorrect = loadSound('assets/correct.mp3'); // Descomente e coloque o caminho correto do seu som de acerto
  // soundWrong = loadSound('assets/wrong.mp3');   // Descomente e coloque o caminho correto do seu som de erro
}

function setup() {
  createCanvas(900, 650); // Aumentei o canvas para mais espaço
  terrenoX = width / 4;
  terrenoY = height / 2 + 50; // Desloquei o terreno para baixo para ter espaço para as perguntas
  terrenoLargura = width / 2;
  terrenoAltura = height / 3;

  // --- Definição das Perguntas do Jogo (Mais perguntas e explicações detalhadas) ---
  questions = [
    {
      pergunta: "Para um terreno em declive e evitar a erosão do solo, qual a melhor técnica de plantio?",
      opcoes: ["Plantio em linhas retas no sentido do declive", "Plantio em Curvas de Nível", "Plantio em covas profundas"],
      respostaCorretaIndex: 1,
      explicacaoCerta: "As **Curvas de Nível** seguem o contorno do terreno, diminuindo a velocidade da água da chuva e, assim, controlando a erosão do solo de forma eficaz. Isso ajuda a reter nutrientes e água para as plantas.",
      explicacaoErrada: "Plantar em linhas retas no sentido do declive ou em covas profundas pode **acelerar a erosão**, pois a água da chuva desceria com mais força, levando consigo o solo fértil. A técnica correta para declives é o plantio em **Curvas de Nível**."
    },
    {
      pergunta: "Sua região tem pouca água e você quer economizar. Qual sistema de irrigação é mais eficiente?",
      opcoes: ["Irrigação por Aspersão (chuveirinho)", "Irrigação por Inundação (encharcamento)", "Irrigação por Gotejamento"],
      respostaCorretaIndex: 2,
      explicacaoCerta: "A **Irrigação por Gotejamento** é extremamente eficiente, entregando a água diretamente na raiz da planta, minimizando perdas por evaporação ou escoamento. Isso economiza água e nutrientes.",
      explicacaoErrada: "A irrigação por aspersão ou inundação pode **desperdiçar muita água** por evaporação ou escoamento. A **Irrigação por Gotejamento** é a mais indicada para a economia de água, focando a entrega onde a planta realmente precisa."
    },
    {
      pergunta: "Para manter a umidade do solo, controlar ervas daninhas e enriquecer o solo sem arar, qual técnica é ideal?",
      opcoes: ["Plantio Convencional (arado e grade)", "Queimada de Palha", "Plantio Direto"],
      respostaCorretaIndex: 2,
      explicacaoCerta: "O **Plantio Direto** é uma técnica conservacionista que não revolve o solo, mantendo a cobertura vegetal (palhada) sobre ele. Isso protege o solo da erosão, mantém a umidade e aumenta a matéria orgânica.",
      explicacaoErrada: "O Plantio Convencional com arado e grade **expõe o solo**, tornando-o vulnerável à erosão e à perda de matéria orgânica. A queimada da palha é **prejudicial** ao solo e ao meio ambiente. A melhor opção é o **Plantio Direto**."
    },
    {
      pergunta: "Para melhorar a fertilidade do solo e controlar pragas de forma natural, qual estratégia envolve a alternância de culturas?",
      opcoes: ["Monocultura Intensiva", "Rotação de Culturas", "Adubação Química Constante"],
      respostaCorretaIndex: 1,
      explicacaoCerta: "A **Rotação de Culturas** consiste em alternar diferentes tipos de plantas em uma mesma área ao longo do tempo. Isso ajuda a equilibrar os nutrientes do solo, quebrar o ciclo de pragas e doenças e melhorar a estrutura do solo.",
      explicacaoErrada: "A **Monocultura Intensiva** (plantar sempre a mesma cultura) esgota os nutrientes do solo e favorece o surgimento de pragas e doenças específicas. A adubação química constante, sem rotação, pode prejudicar a saúde do solo a longo prazo. A **Rotação de Culturas** é a abordagem mais sustentável."
    },
    {
      pergunta: "Em um pequeno espaço, como um quintal urbano ou varanda, qual método permite cultivar uma boa variedade de plantas?",
      opcoes: ["Grandes Plantios em Campo Aberto", "Plantio em Contêineres/Vasos", "Cultivo em Estufa Industrial"],
      respostaCorretaIndex: 1,
      explicacaoCerta: "O **Plantio em Contêineres ou Vasos** é perfeito para pequenos espaços, permitindo que você cultive uma variedade de vegetais, ervas e flores em varandas, quintais e até dentro de casa. É versátil e controlável.",
      explicacaoErrada: "Grandes plantios em campo aberto ou estufas industriais são para **escala comercial**, não para pequenos espaços. Para quintais e varandas, a melhor solução é o **Plantio em Contêineres/Vasos**."
    }
  ];

  // Inicializa o status das plantas (todas murchas no início)
  for (let i = 0; i < questions.length; i++) {
    plantasStatus.push('murcha'); // 'murcha' ou 'cresceu'
  }
}

function draw() {
  background(240); // Cor de fundo clara

  if (gameState === 'intro') {
    drawIntroScreen();
  } else if (gameState === 'question') {
    drawQuestionScreen();
  } else if (gameState === 'feedback') {
    drawFeedbackScreen();
    // Se a resposta estiver correta e ainda estiver dentro do tempo de celebração, desenha as partículas
    if (feedbackCorrect && millis() - celebrationStartTime < CELEBRATION_DURATION) {
      drawCelebrationParticles();
    }
  } else if (gameState === 'summary') {
    drawSummaryScreen();
  }
}

function mousePressed() {
  if (gameState === 'intro') {
    gameState = 'question';
  } else if (gameState === 'question') {
    // Verificar qual opção foi clicada
    let currentQuestion = questions[currentQuestionIndex];
    let optionHeight = 50;
    let startY = height / 2 + 50; // Ajustado para não sobrepor o terreno

    for (let i = 0; i < currentQuestion.opcoes.length; i++) {
      let optionX = width / 2 - 150;
      let optionY = startY + i * (optionHeight + 15); // Espaçamento maior entre as opções
      let optionWidth = 300;

      if (mouseX > optionX && mouseX < optionX + optionWidth &&
          mouseY > optionY && mouseY < optionY + optionHeight) {
        selectedOption = i;
        checkAnswer(); // Chama a função para verificar a resposta
        break; // Sai do loop após encontrar a opção clicada
      }
    }
  } else if (gameState === 'feedback') {
    // Avançar para a próxima pergunta ou tela de resumo
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      gameState = 'question';
      showingFeedback = false;
      selectedOption = -1;
    } else {
      gameState = 'summary'; // Se todas as perguntas foram respondidas, vai para o resumo
    }
  } else if (gameState === 'summary') {
    // Lógica para o botão "Jogar Novamente"
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
        mouseY > height - 100 && mouseY < height - 50) {
      resetGame(); // Reseta o jogo para começar de novo
    }
  }
}

function checkAnswer() {
  let currentQuestion = questions[currentQuestionIndex];
  showingFeedback = true; // Ativa a exibição do feedback

  if (selectedOption === currentQuestion.respostaCorretaIndex) {
    feedbackCorrect = true; // Define que a resposta foi correta
    score++; // Incrementa a pontuação
    plantasStatus[currentQuestionIndex] = 'cresceu'; // Marca a planta como 'cresceu' para esta pergunta
    celebrationStartTime = millis(); // Inicia o temporizador da celebração
    generateCelebrationParticles(currentQuestionIndex); // Gera partículas para a celebração
    // if (soundCorrect) soundCorrect.play(); // Toca o som de acerto (descomente após carregar o som)
  } else {
    feedbackCorrect = false; // Define que a resposta foi incorreta
    plantasStatus[currentQuestionIndex] = 'murcha'; // Marca a planta como 'murcha'
    // if (soundWrong) soundWrong.play(); // Toca o som de erro (descomente após carregar o som)
  }
  // Mudar para o estado de feedback imediatamente
  gameState = 'feedback';
}

function drawIntroScreen() {
  // Estilo para o título
  textAlign(CENTER, CENTER);
  textSize(55);
  fill(34, 139, 34); // Verde Floresta
  text("Mestre do Plantio", width / 2, height / 3);

  // Estilo para a instrução
  textSize(24);
  fill(70, 70, 70); // Cinza escuro
  text("Clique para começar e aprender sobre o plantio!", width / 2, height / 2);

  // Desenhar um pequeno terreno estilizado no centro da tela de introdução
  fill(139, 69, 19); // Marrom
  rect(terrenoX, terrenoY + 50, terrenoLargura, terrenoAltura, 15); // Um pouco mais abaixo
  fill(50, 150, 50); // Verde vibrante para a planta
  // Tronco
  rect(terrenoX + terrenoLargura/2 - 5, terrenoY + terrenoAltura + 50 - 40, 10, 40);
  // Folhas
  ellipse(terrenoX + terrenoLargura/2, terrenoY + terrenoAltura + 50 - 60, 40, 40);
  ellipse(terrenoX + terrenoLargura/2 - 20, terrenoY + terrenoAltura + 50 - 50, 30, 30);
  ellipse(terrenoX + terrenoLargura/2 + 20, terrenoY + terrenoAltura + 50 - 50, 30, 30);

  // Adicionar um efeito de sombra leve ao terreno na intro
  drawingContext.shadowOffsetX = 5;
  drawingContext.shadowOffsetY = 5;
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
  fill(139, 69, 19); // Marrom novamente para a sombra
  rect(terrenoX, terrenoY + 50, terrenoLargura, terrenoAltura, 15);
  drawingContext.shadowOffsetX = 0; // Resetar sombra
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = 0;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0)';
}

function drawQuestionScreen() {
  drawTerrain(); // Desenha o terreno base
  drawPlantsOnTerrain(); // Desenha o estado atual das plantas

  let currentQuestion = questions[currentQuestionIndex];
  textAlign(CENTER, CENTER);
  textSize(28);
  fill(50);
  // Define a largura máxima para o texto da pergunta e centraliza-o
  text(currentQuestion.pergunta, width / 2, height / 4 - 30, width * 0.8); // Ajuste de posição e largura

  let optionHeight = 50;
  let startY = height / 2 - 50; // Posição inicial das opções (acima do terreno)

  for (let i = 0; i < currentQuestion.opcoes.length; i++) {
    let optionX = width / 2 - 150;
    let optionY = startY + i * (optionHeight + 15); // Espaçamento maior entre as opções
    let optionWidth = 300;

    // Desenha o botão da opção
    fill(200, 220, 180); // Cor mais suave para o botão
    stroke(100); // Borda
    strokeWeight(1);
    rect(optionX, optionY, optionWidth, optionHeight, 10); // Cantos arredondados

    fill(50); // Cor do texto
    textSize(20);
    noStroke();
    text(currentQuestion.opcoes[i], optionX + optionWidth / 2, optionY + optionHeight / 2);
  }
}

function drawFeedbackScreen() {
  drawTerrain(); // Desenha o terreno base
  drawPlantsOnTerrain(); // Desenha o estado atual das plantas

  let currentQuestion = questions[currentQuestionIndex];
  textAlign(CENTER, CENTER);

  // Exibe a mensagem de acerto ou erro
  textSize(36);
  if (feedbackCorrect) {
    fill(34, 139, 34); // Verde para acerto
    text("Correto! 🎉 Parabéns!", width / 2, height / 4 - 60);
  } else {
    fill(178, 34, 34); // Vermelho para erro
    text("Ops, não foi dessa vez. 😞", width / 2, height / 4 - 60);
  }

  // Exibe a explicação detalhada
  textSize(18);
  fill(50);
  // Escolhe a explicação correta baseada no feedbackCorrect
  let explanationText = feedbackCorrect ? currentQuestion.explicacaoCerta : currentQuestion.explicacaoErrada;
  text(explanationText, width / 2, height / 4 + 20, width * 0.8, height * 0.3); // Largura e altura para quebrar linha

  textSize(20);
  fill(70);
  text("Clique para continuar...", width / 2, height - 50); // Mensagem para avançar
}

function drawSummaryScreen() {
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(50);
  text("Fim de Jogo!", width / 2, height / 4);

  textSize(32);
  fill(70);
  text(`Você acertou ${score} de ${questions.length} perguntas.`, width / 2, height / 2.5);

  // Desenhar o terreno final, mostrando o sucesso geral
  drawTerrain();
  drawPlantsOnTerrain(); // Desenha as plantas como cresceram ou murcharam ao longo do jogo

  // Botão Jogar Novamente
  fill(0, 100, 200); // Azul
  rect(width/2 - 100, height - 100, 200, 50, 10); // Cantos arredondados
  fill(255); // Texto branco
  textSize(22);
  text("Jogar Novamente", width/2, height - 75);
}

// Desenha o terreno base
function drawTerrain() {
  fill(139, 69, 19); // Marrom
  rect(terrenoX, terrenoY, terrenoLargura, terrenoAltura, 15); // Cantos arredondados
  // Adicionar contornos para dar mais profundidade
  stroke(100, 50, 10);
  strokeWeight(2);
  noFill();
  rect(terrenoX, terrenoY, terrenoLargura, terrenoAltura, 15);
  noStroke(); // Resetar stroke
}

// Desenha as plantas no terreno com base no seu status (cresceu/murcha)
function drawPlantsOnTerrain() {
  let numPlants = questions.length; // Uma planta por pergunta
  let plantSpacing = terrenoLargura / (numPlants + 1); // Distribui as plantas uniformemente

  for (let i = 0; i < numPlants; i++) {
    let plantX = terrenoX + (i + 1) * plantSpacing;
    let plantY = terrenoY + terrenoAltura - 20;

    if (plantasStatus[i] === 'cresceu') {
      // Planta crescida e saudável (verde vibrante)
      fill(50, 200, 50);
      // Tronco
      rect(plantX - 4, plantY - 30, 8, 30);
      // Folhas
      ellipse(plantX, plantY - 40, 25, 40);
      ellipse(plantX - 15, plantY - 30, 20, 20);
      ellipse(plantX + 15, plantY - 30, 20, 20);
    } else {
      // Planta murcha (tons de marrom/cinza, menor)
      fill(150, 120, 80); // Marrom mais desbotado
      rect(plantX - 3, plantY - 15, 6, 15); // Tronco menor
      fill(100, 100, 100); // Cinza para folhas murchas
      ellipse(plantX, plantY - 20, 15, 20);
    }
  }
}

// --- Animação de Celebração (Partículas) ---
function generateCelebrationParticles(questionIndex) {
  // Gera partículas ao redor da planta que cresceu
  let numPlants = questions.length;
  let plantSpacing = terrenoLargura / (numPlants + 1);
  let plantX = terrenoX + (questionIndex + 1) * plantSpacing;
  let plantY = terrenoY + terrenoAltura - 40; // Ajuste para sair da planta

  for (let i = 0; i < 30; i++) {
    particles.push(new Particle(plantX, plantY));
  }
}

function drawCelebrationParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    if (p.isFinished()) {
      particles.splice(i, 1);
    }
  }
}

// Classe Particle para a animação de celebração
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-5, -1);
    this.alpha = 255;
    this.color = color(random(200, 255), random(200, 255), random(0, 100), this.alpha); // Cores vibrantes
    this.size = random(5, 10);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // Gravidade
    this.alpha -= 5; // Desaparece gradualmente
  }

  display() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    ellipse(this.x, this.y, this.size);
  }

  isFinished() {
    return this.alpha < 0;
  }
}

// Reseta o estado do jogo para começar novamente
function resetGame() {
  currentQuestionIndex = 0;
  score = 0;
  selectedOption = -1;
  showingFeedback = false;
  feedbackCorrect = false;
  // Resetar o status das plantas para murchas
  for (let i = 0; i < plantasStatus.length; i++) {
    plantasStatus[i] = 'murcha';
  }
  particles = []; // Limpa as partículas de celebração
  gameState = 'intro'; // Volta para a tela de introdução
}
