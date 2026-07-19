// URLs das Fontes RSS
const RTP_RSS = 'https://www.rtp.pt/noticias/rss';
const WINTECH_RSS = 'https://wintech.pt/?format=feed&type=rss';
const SETUBAL_RSS = 'https://www.mun-setubal.pt/feed/';

// 1. Construtor de Blocos de Notícias Limpos (Sem Imagens)
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
                const dateStr = dateObj.toLocaleDateString('pt-PT');
                
                // Limpeza rigorosa de tags HTML para garantir que não aparecem imagens na descrição
                let desc = item.description.replace(/<[^>]*>?/gm, '').trim(); 
                desc = desc.substring(0, 110) + (desc.length > 110 ? '...' : '');
                
                const cardHTML = `
                    <div class="text-news-item">
                        <span class="news-date">${dateStr}</span>
                        <h4><a href="${item.link}" target="_blank">${item.title}</a></h4>
                        <p>${desc}</p>
                        <a href="${item.link}" target="_blank" class="btn-read-more">> Ler Artigo</a>
                    </div>
                `;
                container.innerHTML += cardHTML;
            });
        } else {
            container.innerHTML = '<p class="text-muted">Sem notícias disponíveis no momento.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="text-muted">Falha ao carregar a fonte de notícias.</p>';
    }
}

// 2. Construtor da Lista Lateral (Sem Imagens)
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
                
                const listItemHTML = `
                    <div class="side-news-item">
                        <span class="date">${dateStr}</span>
                        <h5><a href="${item.link}" target="_blank">${item.title}</a></h5>
                        <p>${desc}</p>
                        <a href="${item.link}" target="_blank" class="btn-read-more" style="font-size: 0.75rem; margin-top: 5px; display: inline-block;">> Ler mais</a>
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
                tickerHTML += `<div class="ticker-item"><i class="fas fa-caret-right" style="color:var(--accent-blue); margin-right:5px;"></i> <a href="${item.link}" target="_blank">${item.title}</a></div>`;
            });
            // Duplica para garantir a continuidade perfeita do CSS Scroll
            tickerContainer.innerHTML = tickerHTML + tickerHTML;
        }
    } catch (error) {
        tickerContainer.innerHTML = 'Bem-vindo ao Portal Rádio Jornal de Setúbal.';
    }
}

// Controlo de Navegação (Tabs da SPA)
function showView(viewId, element) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Lógica do Player Rádio Persistente
const audio = document.getElementById('audioStream');
const playIcon = document.getElementById('playIcon');
const volumeSlider = document.getElementById('volumeSlider');
let isPlaying = false;

audio.volume = volumeSlider.value;

function togglePlay() {
    const btnTextNode = document.getElementById('playBtn');
    
    if (isPlaying) {
        audio.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        btnTextNode.innerHTML = '<i class="fas fa-play" id="playIcon"></i> OUVIR AGORA';
    } else {
        audio.load(); 
        audio.play();
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        btnTextNode.innerHTML = '<i class="fas fa-pause" id="playIcon"></i> EM EMISSÃO';
    }
    isPlaying = !isPlaying;
}

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Inicialização da recolha de dados ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Ticker Superior Wintech
    populateWintechTicker();
    
    // Grelhas em Blocos (RTP e Wintech - 4 notícias cada)
    fetchTextNews(RTP_RSS, 'rtp-news', 4);
    fetchTextNews(WINTECH_RSS, 'wintech-news', 4);
    
    // Lista Lateral (Município - 3 notícias)
    fetchSidebarNews(SETUBAL_RSS, 'setubal-news', 3);
}); 
