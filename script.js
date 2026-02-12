/* --- config báisca --- */
const TOTAL_QUESTOES = 40;
let bancoQuestoes = [];
let indiceAtual = 0;
let respostasUsuario = {};
let graficoInstance = null; 

/* --- gerador dos anos --- */
function gerarBotoesAnos() {
    const container = document.getElementById('year-grid');
    if (!container) return;
    container.innerHTML = ''; 

    for (let ano = 2025; ano >= 2010; ano--) {
        const div = document.createElement('div');
        div.className = 'card-year';
        div.onclick = () => selecionarAno(ano);
        let statusHtml = (ano >= 2024) ? '<span class="status new"></span>' : '<span class="status available"></span>';
        div.innerHTML = `<span class="year-label">${ano}</span>${statusHtml}`;
        container.appendChild(div);
    }
}

function gerarBancoDeDados() {
    bancoQuestoes = [];
    const letrasPossiveis = ['A', 'B', 'C', 'D', 'E'];

    for (let i = 1; i <= TOTAL_QUESTOES; i++) {
        // Sorteia uma questão certa
        const respostaRandom = letrasPossiveis[Math.floor(Math.random() * letrasPossiveis.length)];
        
        // Config padrão da pergunta
        let textoQuestao = `Questão ${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Analise as alternativas e selecione a correta de acordo com seus conhecimentos.`;
        let imagemUrl = null;

        // eu fiz essa aqui de exemplo pra quando tem imagem, e pra colocar uma foto do carequinha também
        if (i === 5) {
            textoQuestao = `Questão ${i}: Observe a imagem abaixo e assinale a alternativa que melhor descreve essa carequinha perfeita`;
            //imagem placeholder do gru macaco pardal
            imagemUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFr9JARZmh1boDlGkX7Nc472barwzseq3pjQ&s';
        }

        bancoQuestoes.push({
            id: i,
            enunciado: textoQuestao,
            imagem: imagemUrl, 
            alternativas: [
                "Alternativa A: Lorem ipsum dolor sit amet.",
                "Alternativa B: Consectetur adipiscing elit.",
                "Alternativa C: Sed do eiusmod tempor incididunt.",
                "Alternativa D: Ut labore et dolore magna aliqua.",
                "Alternativa E: Excepteur sint occaecat cupidatat." 
            ],
            respostaCorreta: respostaRandom 
        });
    }
}

/* --- dunção de navegação sinistra ai mo dificilkk --- */
function irPara(idTela) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    const tela = document.getElementById(idTela);
    if (tela) {
        tela.classList.remove('hidden');
        tela.classList.add('active');
    }
}

function selecionarAno(ano) {
    const display = document.getElementById('display-ano-selecionado');
    if(display) display.innerText = ano;
    irPara('screen-exams-list');
}

function iniciarProva(numCaderno) {
    const cadernoTitle = document.getElementById('caderno-ativo');
    if(cadernoTitle) cadernoTitle.innerText = 'Prova 0' + numCaderno;
    
    gerarBancoDeDados();
    indiceAtual = 0;
    respostasUsuario = {}; 
    renderizarSidebar();
    carregarQuestao(0);
    irPara('screen-taking-exam');
}

/* --- logica da prova pra exibir tudo, as questões etc --- */
function carregarQuestao(indice) {
    if (indice < 0 || indice >= TOTAL_QUESTOES) return;
    indiceAtual = indice;
    const questao = bancoQuestoes[indice];

    document.getElementById('q-numero').innerText = `Questão ${indice + 1}`;
    document.getElementById('q-enunciado').innerText = questao.enunciado;

    // Lógica pra puxar a foto quando tiver e esconder quando não tiver
    const imgElement = document.getElementById('q-imagem-preview');
    if (questao.imagem) {
        imgElement.src = questao.imagem;
        imgElement.classList.remove('hidden-img');
    } else {
        imgElement.src = '';
        imgElement.classList.add('hidden-img');
    }

    const containerOpcoes = document.getElementById('q-opcoes');
    containerOpcoes.innerHTML = ''; 

    const letras = ['A', 'B', 'C', 'D', 'E'];
    questao.alternativas.forEach((texto, i) => {
        if (i >= letras.length) return;
        const letra = letras[i];
        const isSelected = respostasUsuario[indice] === letra;
        const cssClass = isSelected ? 'selected' : '';

        const div = document.createElement('div');
        div.className = `option-item ${cssClass}`;
        div.onclick = () => selecionarAlternativa(indice, letra, i);
        div.innerHTML = `<span class="opt-letter">${letra}</span><span class="opt-text">${texto}</span>`;
        containerOpcoes.appendChild(div);
    });

    document.getElementById('btn-prev').disabled = (indice === 0);
    document.getElementById('btn-next').innerText = (indice === TOTAL_QUESTOES - 1) ? 'Revisar' : 'Próxima';
    renderizarSidebar();
}

function selecionarAlternativa(indiceQuestao, letraResposta, indiceDiv) {
    respostasUsuario[indiceQuestao] = letraResposta;
    const opcoes = document.querySelectorAll('#q-opcoes .option-item');
    opcoes.forEach(op => op.classList.remove('selected'));
    if(opcoes[indiceDiv]) opcoes[indiceDiv].classList.add('selected');
    renderizarSidebar();
}

function renderizarSidebar() {
    const grid = document.getElementById('nav-grid');
    if(!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < TOTAL_QUESTOES; i++) {
        const btn = document.createElement('div');
        let classes = 'q-dot';
        if (i === indiceAtual) classes += ' active';
        if (respostasUsuario[i]) classes += ' answered';
        btn.className = classes;
        btn.innerText = i + 1;
        btn.onclick = () => carregarQuestao(i);
        grid.appendChild(btn);
    }
}

function navegar(direcao) {
    const novoIndice = indiceAtual + direcao;
    if (novoIndice >= 0 && novoIndice < TOTAL_QUESTOES) carregarQuestao(novoIndice);
}

/* --- finalizar prova e faz o gráfico --- */
function finalizarProva() {
    const respondidas = Object.keys(respostasUsuario).length;
    
    if (respondidas < TOTAL_QUESTOES) {
        if(!confirm(`Atenção: Você respondeu apenas ${respondidas} de ${TOTAL_QUESTOES} questões. Deseja finalizar mesmo assim?`)) return;
    } else {
        if(!confirm("Tem certeza que deseja finalizar a prova?")) return;
    }

    // Calcula acertos pra fazer o graph
    let acertos = 0;
    for (let i = 0; i < TOTAL_QUESTOES; i++) {
        const respostaDada = respostasUsuario[i];
        const respostaCerta = bancoQuestoes[i].respostaCorreta;
        if (respostaDada === respostaCerta) {
            acertos++;
        }
    }

    document.getElementById('txt-acertos').innerText = acertos;
    gerarGrafico(acertos, TOTAL_QUESTOES - acertos);
    irPara('screen-result');
}

function gerarGrafico(acertos, erros) {
    const ctx = document.getElementById('graficoResultado').getContext('2d');
    
    if (graficoInstance) {
        graficoInstance.destroy();
    }

    graficoInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Acertos', 'Erros'],
            datasets: [{
                data: [acertos, erros],
                backgroundColor: ['#10b981', '#ef4444'], 
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Inicializa
gerarBotoesAnos();