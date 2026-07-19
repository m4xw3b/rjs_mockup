// URLs das Fontes RSS
const NAM_RSS = 'https://www.noticiasaominuto.com/rss/ultima-hora';
const SPORTS_RSS = 'https://www.rtp.pt/noticias/rss/desporto';
const WINTECH_RSS = 'https://wintech.pt/?format=feed&type=rss';
const SETUBAL_RSS = 'https://www.mun-setubal.pt/feed/';

// Galeria de Imagens do Dia
const dailyImages = [
    {
        url: "https://media.istockphoto.com/id/2169261722/photo/tourist-photographing-the-arr%C3%A1bida-landscape.jpg?b=1&s=612x612&w=0&k=20&c=u71a1lghEsJhkkiPTMzNdaGaU6oj4Kxdmnu-yAbPJrw=",
        source: "iStock",
        caption: "Serra da Arrábida, Setúbal"
    },
    {
        url: "https://media.istockphoto.com/id/2216642401/photo/panoramic-aerial-view-of-arrabida-beach-rocky-seascape-creiro-beach-setubal-region-atlantic.jpg?b=1&s=612x612&w=0&k=20&c=N3gdhLH4jCy33dlFZd_gdRV1-g_NBqS-Qp05q-4tT-w=",
        source: "iStock",
        caption: "Praias da Arrábida"
    },
    {
        url: "https://images.pexels.com/photos/33725147/pexels-photo-33725147.jpeg",
        source: "Pexels",
        caption: "Parque Natural da Arrábida"
    }
];

// Sorteia e aplica a Imagem do Dia
function loadRandomImageOfDay() {
    const randomIndex = Math.floor(Math.random() * dailyImages.length);
    const selected = dailyImages[randomIndex];
    
    document.getElementById('iodImage').src = selected.url;
    document.getElementById('iodSource').innerText = "por " + selected.source;
    document.getElementById('iodCaption').innerText = selected.caption;
}

// Proteção de strings para o Popup HTML
function escapeHtml(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/[\r\n]+/g, ' ');
}

// 1. Construtor de Blocos de Notícias Limpos (Usado para NAM e Desporto)
async function fetchTextNews(feedUrl, containerId, limit) {
    const cacheBuster = new Date().getTime();
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl + '?cb=' + cacheBuster)}`;
    const container = document.getElementById(containerId);
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            container.innerHTML = '';
            const articles = data.items.slice(0, limit);
            
            articles.forEach(item => {
                const dateObj = new Date(item.pubDate);
                
                // Formatação da data (Se for NAM, mostra a hora, senão mostra a data)
                let dateStr = '';
                if(feedUrl.includes('noticiasaominuto')) {
                    const timeStr = dateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    dateStr = `<i class="far fa-clock"></i> Hoje às ${timeStr}`;
                } else {
                    dateStr = dateObj.toLocaleDateString('pt-PT');
                }
                
                let desc = item.description.replace(/<[^>]*>?/gm, '').trim(); 
                desc = desc.substring(0, 150) + (desc.length > 150 ? '...' : '');
                
                const safeTitle = escapeHtml(item.title);
                const safeDesc = escapeHtml(desc);
                
                // Remove tags HTML do modalDate para evitar conflitos visuais
                const plainDate = dateStr.replace(/<[^>]*>?/gm, '');
                
                const cardHTML = `
                    <div class="text-news-item">
                        <span class="news-date">${dateStr}</span>
                        <h4><a href="javascript:void(0)" onclick="openModal('${safeTitle}', '${plainDate}', '${safeDesc}', '${item.link}')">${item.title}</a></h4>
                        <p>${desc}</p>
                        <a href="javascript:void(0)" onclick="openModal('${safeTitle}', '${plainDate}', '${safeDesc}', '${item.link}')" class="btn-read-more">> Ler Resumo</a>
                    </div>
                `;
                container.innerHTML += cardHTML;
            });
        }
    } catch (error) {
        container.innerHTML = '<p class="text-muted">Falha ao carregar a fonte de notícias.</p>';
    }
}

// 2. Construtor da Lista Lateral (Município)
async function fetchSidebarNews(feedUrl, containerId, limit) {
    const cacheBuster = new Date().getTime();
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl + '?cb=' + cacheBuster)}`;
    const container = document.getElementById(containerId);
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            container.innerHTML = '';
            const articles = data.items.slice(0, limit);
            
            articles.forEach(item => {
                const dateObj = new Date(item.pubDate);
                const dateStr = dateObj.toLocaleDateString('pt-PT');
                
                let desc = item.description.replace(/<[^>]*>?/gm, '').trim(); 
                desc = desc.substring(0, 80) + '...';
                
                const safeTitle = escapeHtml(item.title);
                const safeDesc = escapeHtml(desc);
                
                const listItemHTML = `
                    <div class="side-news-item">
                        <span class="date">${dateStr}</span>
                        <h5><a href="javascript:void(0)" onclick="openModal('${safeTitle}', '${dateStr}', '${safeDesc}', '${item.link}')">${item.title}</a></h5>
                        <p>${desc}</p>
                    </div>
                `;
                container.innerHTML += listItemHTML;
            });
        }
    } catch (error) {
        container.innerHTML = '<p>Erro de carregamento.</p>';
    }
}

// 3. Ticker Superior Animado (Exclusivo Wintech)
async function populateWintechTicker() {
    const cacheBuster = new Date().getTime();
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(WINTECH_RSS + '?cb=' + cacheBuster)}`;
    const tickerContainer = document.getElementById('wintech-ticker');
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            let tickerHTML = '';
            data.items.slice(0, 10).forEach(item => {
                const safeTitle = escapeHtml(item.title);
                const safeDesc = escapeHtml(item.description.replace(/<[^>]*>?/gm, '').trim().substring(0, 100));
                tickerHTML += `<div class="ticker-item"><i class="fas fa-caret-right" style="color:var(--accent-blue); margin-right:5px;"></i> <a href="javascript:void(0)" onclick="openModal('${safeTitle}', 'Wintech', '${safeDesc}', '${item.link}')">${item.title}</a></div>`;
            });
            tickerContainer.innerHTML = tickerHTML + tickerHTML;
        }
    } catch (error) {
        tickerContainer.innerHTML = 'Bem-vindo ao Portal Rádio Jornal de Setúbal.';
    }
}

// --- LÓGICA DO POPUP (MODAL) ---
function openModal(title, date, desc, link) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDate').innerText = date;
    document.getElementById('modalBody').innerHTML = `<p>${desc}</p>`;
    document.getElementById('modalLink').href = link;
    document.getElementById('newsModal').classList.add('active');
}

function closeModal() {
    document.getElementById('newsModal').classList.remove('active');
}

document.getElementById('newsModal').addEventListener('click', function(e) {
    if(e.target === this) {
        closeModal();
    }
});

// Controlo de Navegação (Tabs da SPA)
function showView(viewId, element) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Lógica do Player Rádio Persistente e Animação de Ondas
const audio = document.getElementById('audioStream');
const playIcon = document.getElementById('playIcon');
const volumeSlider = document.getElementById('volumeSlider');
const soundWaves = document.getElementById('soundWaves');
let isPlaying = false;

audio.volume = volumeSlider.value;

function togglePlay() {
    const btnTextNode = document.getElementById('playBtn');
    if (isPlaying) {
        audio.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        btnTextNode.innerHTML = '<i class="fas fa-play" id="playIcon"></i> OUVIR AGORA';
        soundWaves.classList.remove('playing');
    } else {
        audio.load(); 
        audio.play();
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        btnTextNode.innerHTML = '<i class="fas fa-pause" id="playIcon"></i> EM EMISSÃO';
        soundWaves.classList.add('playing');
    }
    isPlaying = !isPlaying;
}

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Sorteia a Imagem do Dia
    loadRandomImageOfDay();
    
    populateWintechTicker();
    
    // Notícias ao Minuto e Desporto (4 itens cada)
    fetchTextNews(NAM_RSS, 'nam-news', 4);
    fetchTextNews(SPORTS_RSS, 'sports-news', 4);
    
    // Município Lateral (3 itens)
    fetchSidebarNews(SETUBAL_RSS, 'setubal-news', 3);
});