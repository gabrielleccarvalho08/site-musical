let audio = document.getElementById('global-audio');
const miniPlayer = document.getElementById('mini-player');
const miniPlayBtn = document.getElementById('mini-play-btn');
const miniTitle = document.getElementById('mini-title');
const miniArtist = document.getElementById('mini-artist');
const miniProgress = document.getElementById('mini-progress');
const progressContainer = document.getElementById('progress-container');
const ambientGlow = document.getElementById('ambient-glow');

const btnPrev = document.getElementById('player-prev-btn');
const btnNext = document.getElementById('player-next-btn');
const volumeSlider = document.getElementById('volume-slider');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');

const bandaCards = document.querySelectorAll('.banda-card');
let musicasCards = document.querySelectorAll('.musica-card'); 
const btnClearFilter = document.getElementById('btn-clear-filter');
const trackCounter = document.getElementById('track-counter');

let indiceAtual = 0;
let cardAtivo = null;

if (audio) audio.volume = 0.8;

let db;
const dbRequest = indexedDB.open("PlayerMusicalDB", 1);

dbRequest.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("musicas")) {
        db.createObjectStore("musicas", { keyPath: "id", autoIncrement: true });
    }
};

dbRequest.onsuccess = (e) => {
    db = e.target.result;
    carregarMusicasDoBanco();
};

dbRequest.onerror = () => {
    console.error("Erro ao conectar ao banco de dados IndexedDB.");
};

function configurarCliqueMusicas() {
    musicasCards = document.querySelectorAll('.musica-card');
    musicasCards.forEach((card, index) => {
        card.setAttribute('data-index', index);

        const novoCard = card.cloneNode(true);
        card.parentNode.replaceChild(novoCard, card);
    });

    musicasCards = document.querySelectorAll('.musica-card');
    musicasCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) return;
            tocarMusicaPorIndice(index);
        });
    });

    if (trackCounter) trackCounter.textContent = `°❀⋆.ೃ࿔*:･°❀⋆.ೃ࿔*:･`;
    configurarFiltrosEspeciaisArtistas();
}

function tocarMusicaPorIndice(index) {
    const card = document.querySelector(`.musica-card[data-index="${index}"]`);
    if (!card) return;

    indiceAtual = index;

    if (cardAtivo === card) {
        togglePlay();
        return;
    }

    if (cardAtivo) cardAtivo.classList.remove('active');
    cardAtivo = card;
    card.classList.add('active');

    audio.src = card.getAttribute('data-src');
    miniTitle.textContent = card.querySelector('h3').textContent;
    miniArtist.textContent = card.querySelector('p').textContent;

    if (miniPlayer) miniPlayer.classList.add('show');
    audio.play();
    atualizarIconesPlayer(true);
}

if (btnNext) {
    btnNext.addEventListener('click', () => {
        if (musicasCards.length === 0) return;
        let prox = indiceAtual + 1;
        if (prox >= musicasCards.length) prox = 0;
        tocarMusicaPorIndice(prox);
    });
}

if (btnPrev) {
    btnPrev.addEventListener('click', () => {
        if (musicasCards.length === 0) return;
        let ant = indiceAtual - 1;
        if (ant < 0) ant = musicasCards.length - 1;
        tocarMusicaPorIndice(ant);
    });
}

if (miniPlayBtn) miniPlayBtn.addEventListener('click', togglePlay);

function togglePlay() {
    if (!audio.src) return;
    if (audio.paused) {
        audio.play();
        atualizarIconesPlayer(true);
    } else {
        audio.pause();
        atualizarIconesPlayer(false);
    }
}

function atualizarIconesPlayer(tocando) {
    if (miniPlayBtn && miniPlayBtn.querySelector('i')) {
        miniPlayBtn.querySelector('i').className = tocando ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    musicasCards.forEach(c => {
        const icone = c.querySelector('.play-card-btn i');
        if (icone) icone.className = 'fa-solid fa-play';
    });
    if (cardAtivo && tocando) {
        const iconeAtivo = cardAtivo.querySelector('.play-card-btn i');
        if (iconeAtivo) iconeAtivo.className = 'fa-solid fa-pause';
    }
}

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        if (miniProgress) miniProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        if (timeCurrent) timeCurrent.textContent = formatarTempo(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    if (timeTotal) timeTotal.textContent = formatarTempo(audio.duration);
});

function formatarTempo(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
        if (audio.duration) audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration;
    });
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => { audio.volume = e.target.value; });
}

audio.addEventListener('ended', () => { if (btnNext) btnNext.click(); });

function ativarEventosCurtir() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            btn.classList.toggle('liked');
            const icone = btn.querySelector('i');
            if (icone) {
                icone.className = btn.classList.contains('liked') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            }
        });
    });
}

function configurarFiltrosEspeciaisArtistas() {
    const todosBotoesBandas = document.querySelectorAll('.banda-card');
    todosBotoesBandas.forEach(banda => {
        banda.replaceWith(banda.cloneNode(true));
    });

    document.querySelectorAll('.banda-card').forEach(banda => {
        banda.addEventListener('click', () => {
            document.querySelectorAll('.banda-card').forEach(b => b.classList.remove('selected'));
            banda.classList.add('selected');
            const artista = banda.getAttribute('data-artist');
            let cont = 0;

            musicasCards.forEach(card => {
                if (card.getAttribute('data-artist') === artista) {
                    card.style.display = 'flex';
                    cont++;
                } else {
                    card.style.display = 'none';
                }
            });
            if (trackCounter) trackCounter.textContent = `°❀⋆.ೃ࿔*:･°❀⋆.ೃ࿔*:･`;
        });
    });
    ativarEventosCurtir();
}

if (btnClearFilter) {
    btnClearFilter.addEventListener('click', () => {
        document.querySelectorAll('.banda-card').forEach(b => b.classList.remove('selected'));
        musicasCards.forEach(card => card.style.display = 'flex');
        if (trackCounter) trackCounter.textContent = `°❀⋆.ೃ࿔*:･°❀⋆.ೃ࿔*:･`;
    });
}

// Registro correto do Service Worker para rodar em subpastas do GitHub
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js'); });
}

// ==========================================================================
// DOM CONTENT LOADED - LIMPO E SEM BOTÃO DE INSTALAÇÃO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.app-container');
    if (!container) return;

    const playerSuperior = document.querySelector('.player-layout-superior');
    if (playerSuperior) {
        const vinilWrapper = document.createElement('div');
        vinilWrapper.className = 'vinil-wrapper';
        vinilWrapper.innerHTML = '<div id="vinil-interativo" class="disco-vinil"><div class="disco-centro"></div></div>';
        playerSuperior.insertBefore(vinilWrapper, playerSuperior.firstChild);
    }

    const vinil = document.getElementById('vinil-interativo');

    if (audio && vinil) {
        const atualizarEstadoVinil = () => {
            if (!audio.paused && !audio.ended) {
                vinil.classList.add('rodando');
            } else {
                vinil.classList.remove('rodando');
            }
        };

        audio.addEventListener('play', atualizarEstadoVinil);
        audio.addEventListener('pause', atualizarEstadoVinil);
        audio.addEventListener('ended', atualizarEstadoVinil);
    }

    const secaoVipHTML = document.createElement('section');
    secaoVipHTML.className = 'secao-vip';
    secaoVipHTML.innerHTML = `
        <div class="game-box">
            <h3><i class="fa-solid fa-bolt animated-icon"></i> Desafio de Memória Musical</h3>
            <p id="game-status">Clique em começar para testar seus ouvidos!</p>
            
            <div class="genius-grid">
                <button class="genius-btn g-roxo" data-pad="0"></button>
                <button class="genius-btn g-azul" data-pad="1"></button>
                <button class="genius-btn g-verde" data-pad="2"></button>
                <button class="genius-btn g-rosa" data-pad="3"></button>
            </div>
            
            <div class="game-score-board">
                <span>Rodada: <strong id="score-atual">0</strong></span>
                <span>Recorde: <strong id="score-maximo">0</strong></span>
            </div>
            
            <button id="start-game-btn" class="btn-start-game">Começar Jogo</button>
        </div>
    `;
    container.appendChild(secaoVipHTML);

    let sequenciaComputador = [];
    let sequenciaJogador = [];
    let jogando = false;
    let rodadaAtual = 0;
    let recordeSalvo = localStorage.getItem('genius_recorde') || 0;

    const pads = document.querySelectorAll('.genius-btn');
    const btnStart = document.getElementById('start-game-btn');
    const gameStatus = document.getElementById('game-status');
    const elScoreAtual = document.getElementById('score-atual');
    const elScoreMaximo = document.getElementById('score-maximo');

    elScoreMaximo.textContent = recordeSalvo;

    const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    function emitirSomNota(frequencia) {
        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        osc.connect(gain);
        gain.connect(ctxAudio.destination);
        osc.frequency.value = frequencia;
        gain.gain.setValueAtTime(0.1, ctxAudio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.3);
        osc.start();
        osc.stop(ctxAudio.currentTime + 0.3);
    }

    const frequenciasNotas = [261.63, 329.63, 392.00, 523.25];

    function acenderPad(index) {
        const pad = pads[index];
        if (!pad) return;
        pad.classList.add('aceso');
        emitirSomNota(frequenciasNotas[index]);
        setTimeout(() => pad.classList.remove('aceso'), 300);
    }

    function tocarSequencia() {
        jogando = false;
        let i = 0;
        const velocidade = Math.max(250, 600 - (rodadaAtual * 30)); 
        
        gameStatus.textContent = "Preste atenção na sequência...";
        
        const intervalo = setInterval(() => {
            acenderPad(sequenciaComputador[i]);
            i++;
            if (i >= sequenciaComputador.length) {
                clearInterval(intervalo);
                setTimeout(() => {
                    jogando = true;
                    gameStatus.textContent = "Sua vez! Repita os passos:";
                }, 400);
            }
        }, velocidade);
    }

    function proximaRodada() {
        sequenciaJogador = [];
        rodadaAtual++;
        elScoreAtual.textContent = rodadaAtual;

        sequenciaComputador.push(Math.floor(Math.random() * 4));
        setTimeout(tocarSequencia, 800);
    }

    function finalizarJogo() {
        gameStatus.textContent = `Fim de jogo! Você chegou à rodada ${rodadaAtual}.`;
        jogando = false;
        btnStart.textContent = "Jogar Novamente";

        if (rodadaAtual > recordeSalvo) {
            recordeSalvo = rodadaAtual;
            localStorage.setItem('genius_recorde', recordeSalvo);
            elScoreMaximo.textContent = recordeSalvo;
            gameStatus.textContent = `NOVO RECORDE! Você atingiu a rodada ${rodadaAtual}!`;
        }
    }

    btnStart.addEventListener('click', () => {
        sequenciaComputador = [];
        rodadaAtual = 0;
        elScoreAtual.textContent = "0";
        btnStart.textContent = "Reiniciar";
        proximaRodada();
    });

    pads.forEach(pad => {
        pad.addEventListener('click', () => {
            if (!jogando) return;
            const idPad = parseInt(pad.getAttribute('data-pad'));
            acenderPad(idPad);
            sequenciaJogador.push(idPad);

            const indexVerificacao = sequenciaJogador.length - 1;

            if (sequenciaJogador[indexVerificacao] !== sequenciaComputador[indexVerificacao]) {
                finalizarJogo();
                return;
            }

            if (sequenciaJogador.length === sequenciaComputador.length) {
                gameStatus.textContent = "Muito bem! Próxima nota...";
                proximaRodada();
            }
        });
    });

    const botaoAdd = document.createElement('button');
    botaoAdd.className = 'btn-flutuante-add';
    botaoAdd.innerHTML = '<i class="fa-solid fa-plus"></i>';
    document.body.appendChild(botaoAdd);

    const modalAdd = document.createElement('div');
    modalAdd.className = 'modal-cadastro';
    modalAdd.id = 'modal-cadastro-musica';
    modalAdd.innerHTML = `
        <div class="modal-conteudo">
            <h3>Adicionar Músicas</h3>
            <div class="form-grupo">
                <label>Nome da Música</label>
                <input type="text" id="form-titulo" placeholder="" required>
            </div>
            <div class="form-grupo">
                <label>Nome da Banda / Artista</label>
                <input type="text" id="form-artista" placeholder="" required>
            </div>
            <div class="form-grupo">
                <label>Link do Áudio (.mp3)</label>
                <input type="text" id="form-src" placeholder="" required>
            </div>
            <div class="form-grupo">
                <label>Link da Imagem da Capa</label>
                <input type="text" id="form-capa" placeholder="">
            </div>
            <div class="modal-botoes">
                <button type="button" class="btn-form btn-cancelar" id="btn-fechar-modal">Cancelar</button>
                <button type="button" class="btn-form btn-salvar" id="btn-salvar-musica">Salvar Entrada</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalAdd);

    botaoAdd.addEventListener('click', () => modalAdd.classList.add('aberto'));
    document.getElementById('btn-fechar-modal').addEventListener('click', () => modalAdd.classList.remove('aberto'));

    document.getElementById('btn-salvar-musica').addEventListener('click', () => {
        const titulo = document.getElementById('form-titulo').value.trim();
        const artista = document.getElementById('form-artista').value.trim();
        const src = document.getElementById('form-src').value.trim();
        let capa = document.getElementById('form-capa').value.trim();

        if (!titulo || !artista || !src) {
            alert("Preencha os campos obrigatórios!");
            return;
        }

        if (!capa) capa = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150";

        const novaMusica = { titulo, artista, src, capa };
        
        const transacao = db.transaction(["musicas"], "readwrite");
        const armazem = transacao.objectStore("musicas");
        const requisicao = armazem.add(novaMusica);

        requisicao.onsuccess = () => {
            renderizarNovoCardMusica(novaMusica);
            verificarECriarCardArtistaHorizontal(novaMusica.artista, novaMusica.capa);
            configurarCliqueMusicas();

            document.getElementById('form-titulo').value = '';
            document.getElementById('form-artista').value = '';
            document.getElementById('form-src').value = '';
            document.getElementById('form-capa').value = '';
            modalAdd.classList.remove('aberto');
        };
    });

    configurarCliqueMusicas();
});

function carregarMusicasDoBanco() {
    const transacao = db.transaction(["musicas"], "readonly");
    const armazem = transacao.objectStore("musicas");
    const cursorReq = armazem.openCursor();

    cursorReq.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            renderizarNovoCardMusica(cursor.value);
            verificarECriarCardArtistaHorizontal(cursor.value.artista, cursor.value.capa);
            cursor.continue();
        } else {
            configurarCliqueMusicas();
        }
    };
}

function renderizarNovoCardMusica(musica) {
    const grid = document.querySelector('.musicas-grid');
    if (!grid) return;

    const card = document.createElement('div');
    card.className = 'musica-card';
    card.setAttribute('data-artist', musica.artista);
    card.setAttribute('data-src', musica.src);
    card.innerHTML = `
        <div class="capa-container">
            <img src="${musica.capa}" class="musica-capa-img" alt="Capa">
            <button class="play-card-btn"><i class="fa-solid fa-play"></i></button>
        </div>
        <div class="musica-detalhes">
            <h3>${musica.titulo}</h3>
            <p>${musica.artista}</p>
        </div>
        <button class="like-btn"><i class="fa-regular fa-heart"></i></button>
    `;
    grid.appendChild(card);
}

function verificarECriarCardArtistaHorizontal(nomeArtista, fotoCapa) {
    const scrollBanda = document.querySelector('.bandas-scroll');
    if (!scrollBanda) return;

    const artistaExiste = Array.from(scrollBanda.querySelectorAll('.banda-card'))
        .some(card => card.getAttribute('data-artist') === nomeArtista);

    if (!artistaExiste) {
        const novoCardArtista = document.createElement('div');
        novoCardArtista.className = 'banda-card';
        novoCardArtista.setAttribute('data-artist', nomeArtista);
        novoCardArtista.innerHTML = `
            <img src="${fotoCapa}" class="banda-img-circle" alt="${nomeArtista}">
            <span>${nomeArtista}</span>
        `;
        scrollBanda.appendChild(novoCardArtista);
    }
}