const TOTAL_QUESTOES = 40;
let bancoQuestoes = [];
let indiceAtual = 0;
let respostasUsuario = {};

function gerarBotoesAnos() {
    const container = document.getElementById('year-grid');
    if (!container) return;
    
    container.innerHTML = ''; 

    for (let ano = 2025; ano >= 2010; ano--) {
        const div = document.createElement('div');
        div.className = 'card-year';
        div.onclick = () => selecionarAno(ano);

        let statusHtml = '<span class="status available"></span>';
        if (ano >= 2024) {
            statusHtml = '<span class="status new"></span>';
        }

        div.innerHTML = `
            <span class="year-label">${ano}</span>
            ${statusHtml}
        `;
        
        container.appendChild(div);
    }
}

function gerarBancoDeDados() {
    bancoQuestoes = [];
    for (let i = 1; i <= TOTAL_QUESTOES; i++) {
        bancoQuestoes.push({
            id: i,
            enunciado: `Questão ${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Analise as alternativas abaixo e assinale a correta referente ao padrão SAEP.`,
            alternativas: [
                "Alternativa A: Lorem ipsum dolor sit amet.",
                "Alternativa B: Consectetur adipiscing elit.",
                "Alternativa C: Sed do eiusmod tempor incididunt.",
                "Alternativa D: Ut labore et dolore magna aliqua.",
                "Alternativa E: Excepteur sint occaecat cupidatat." 
            ],
            respostaCorreta: "A" 
        });
    }
}

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

function carregarQuestao(indice) {
    if (indice < 0 || indice >= TOTAL_QUESTOES) return;
    
    indiceAtual = indice;
    const questao = bancoQuestoes[indice];

    document.getElementById('q-numero').innerText = `Questão ${indice + 1}`;
    document.getElementById('q-enunciado').innerText = questao.enunciado;

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
        
        div.innerHTML = `
            <span class="opt-letter">${letra}</span>
            <span class="opt-text">${texto}</span>
        `;
        
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
    
    if(opcoes[indiceDiv]) {
        opcoes[indiceDiv].classList.add('selected');
    }

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
    if (novoIndice >= 0 && novoIndice < TOTAL_QUESTOES) {
        carregarQuestao(novoIndice);
    }
}

function finalizarProva() {
    const respondidas = Object.keys(respostasUsuario).length;
    
    if (respondidas < TOTAL_QUESTOES) {
        if(!confirm(`Você respondeu apenas ${respondidas} de ${TOTAL_QUESTOES} questões. Deseja realmente finalizar?`)) {
            return;
        }
    } else {
        if(!confirm("Tem certeza que deseja finalizar a prova?")) return;
    }

    alert(`Prova enviada com sucesso!\nRespostas salvas: ${respondidas}`);
    location.reload();
}

gerarBotoesAnos();