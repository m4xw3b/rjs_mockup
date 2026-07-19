// Configurações dos Feeds RSS
const WINTECH_RSS = 'https://wintech.pt/?format=feed&type=rss';
const SETUBAL_RSS = 'https://www.mun-setubal.pt/feed/';

// Função inteligente para extrair imagens do Feed RSS
function extractImageFromContent(item) {
    if (item.thumbnail && item.thumbnail !== '') return item.thumbnail;
    if (item.enclosure && item.enclosure.link) return item.enclosure.link;
    
    // Procura por tags <img> dentro do conteúdo ou descrição
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match = imgRegex.exec(item.content);
    if (!match) match = imgRegex.exec(item.description);
    
    if (match && match[1]) return match[1];
    
    // Imagem genérica de substituição caso o artigo não tenha imagem
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
}

// Função para buscar e processar os feeds para os CARROSSEIS
async function fetchRSS(feedUrl, containerId) {
    // Adicionar cache buster (timestamp) na URL para forçar o bypass do cache antigo
    const cacheBuster = new Date().getTime();
    const finalFeedUrl = `${feedUrl}?cb=${cacheBuster}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(finalFeedUrl)}`;
    
    const container = document.getElementById(containerId);
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            container.innerHTML = '';
            
            // Vai buscar os últimos 6 artigos para o scroll horizontal
            const articles = data.items.slice(0, 6);
            
            articles.forEach(item => {
                const dateObj = new Date(item.pubDate);
                const dateStr = dateObj.toLocaleDateString('pt-PT');
                
                let desc = item.description.replace(/<[^>]*>?/gm, ''); 
                desc = desc.substring(0, 100) + '...';
                
                const imageUrl = extractImageFromContent(item);
                
                const articleHTML = `
                    <article class="news-card">
                        <div class="news-img-container">
                            <img src="${imageUrl}" alt="Imagem da notícia" loading="lazy">
                        </div>
                        <div class="news-content">
                            <span class="news-date">${dateStr}</span>
                            <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
                            <p>${desc}</p>
                            <a href="${item.link}" target="_blank" class="read-more">Ler Artigo <i class="fas fa-angle-right"></i></a>
                        </div>
                    </article>
                `;
                container.innerHTML += articleHTML;
            });
        } else {
            container.innerHTML = '<div class="news-card"><div class="news-content"><p>Não foi possível carregar as notícias mais recentes.</p></div></div>';
        }
    } catch (error) {
        console.error('Erro ao carregar RSS:', error);
        container.innerHTML = '<div class="news-card"><div class="news-content"><p>Erro de ligação ao servidor.</p></div></div>';
    }
}

// Função para popular o TICKER superior com as últimas notícias de Setúbal
async function populateTicker() {
    const cacheBuster = new Date().getTime();
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(SETUBAL_RSS + '?cb=' + cacheBuster)}`;
    const tickerContainer = document.getElementById('news-ticker');
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            let tickerHTML = '';
            // Coloca os 8 títulos mais recentes no ticker
            data.items.slice(0, 8).forEach(item => {
                tickerHTML += `<div class="ticker-item"><i class="fas fa-bolt" style="color:var(--secondary); margin-right:5px;"></i> <a href="${item.link}" target="_blank">${item.title}</a></div>`;
            });
            // Duplica o conteúdo para criar o efeito infinito contínuo no CSS
            tickerContainer.innerHTML = tickerHTML + tickerHTML;
        }
    } catch (error) {
        console.error('Erro no Ticker:', error);
        tickerContainer.innerHTML = 'Bem-vindo à Rádio Jornal de Setúbal.';
    }
}

// Lógica de Navegação (Single Page)
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    document.getElementById('main-nav').classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Menu Mobile
function toggleMenu() {
    document.getElementById('main-nav').classList.toggle('show');
}

// Lógica do Leitor de Rádio
const audio = document.getElementById('audioStream');
const playIcon = document.getElementById('playIcon');
const volumeSlider = document.getElementById('volumeSlider');
let isPlaying = false;

audio.volume = volumeSlider.value;

function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    } else {
        audio.load();
        audio.play();
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    }
    isPlaying = !isPlaying;
}

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Arrancar scripts iniciais
document.addEventListener('DOMContentLoaded', () => {
    fetchRSS(SETUBAL_RSS, 'setubal-news');
    fetchRSS(WINTECH_RSS, 'wintech-news');
    populateTicker();
});
