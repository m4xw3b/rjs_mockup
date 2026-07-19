// Configurações dos Feeds RSS (Adicionado 'O Setubalense')
const OSETUBALENSE_RSS = 'https://osetubalense.com/feed/';
const WINTECH_RSS = 'https://wintech.pt/?format=feed&type=rss';
const SETUBAL_RSS = 'https://www.mun-setubal.pt/feed/';

// Função inteligente para forçar a extração de imagens
function extractImageFromContent(item) {
    // 1. Tenta a thumbnail padrão
    if (item.thumbnail && item.thumbnail !== '') return item.thumbnail;
    
    // 2. Tenta nos ficheiros de media associados (enclosure)
    if (item.enclosure && item.enclosure.link && item.enclosure.type.startsWith('image/')) return item.enclosure.link;
    
    // 3. Procura ativamente por tags <img> dentro do código HTML do conteúdo ou descrição
    const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/i;
    let match = imgRegex.exec(item.content);
    if (!match) match = imgRegex.exec(item.description);
    
    if (match && match[1]) return match[1];
    
    // 4. Imagens locais de emergência (Fallback) consoante a fonte da notícia
    if (item.link.includes('mun-setubal')) {
        // Se a Câmara não mandar imagem, usamos uma foto de Setúbal
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Pra%C3%A7a_de_Bocage_%28Set%C3%BAbal%29.jpg/800px-Pra%C3%A7a_de_Bocage_%28Set%C3%BAbal%29.jpg';
    } else if (item.link.includes('osetubalense')) {
        // Imagem genérica para notícias jornalísticas
        return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'; 
    }
    
    // Imagem genérica final de reserva
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80';
}

// Função para buscar e processar os feeds
async function fetchRSS(feedUrl, containerId) {
    const cacheBuster = new Date().getTime();
    const finalFeedUrl = `${feedUrl}?cb=${cacheBuster}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(finalFeedUrl)}`;
    
    const container = document.getElementById(containerId);
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            container.innerHTML = '';
            
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
            container.innerHTML = '<div class="news-card"><div class="news-content"><p>Não foi possível carregar as notícias.</p></div></div>';
        }
    } catch (error) {
        console.error('Erro ao carregar RSS:', error);
        container.innerHTML = '<div class="news-card"><div class="news-content"><p>Erro de ligação ao servidor.</p></div></div>';
    }
}

// Ticker do topo (Usa as notícias do Jornal O Setubalense por serem mais regulares)
async function populateTicker() {
    const cacheBuster = new Date().getTime();
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(OSETUBALENSE_RSS + '?cb=' + cacheBuster)}`;
    const tickerContainer = document.getElementById('news-ticker');
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            let tickerHTML = '';
            data.items.slice(0, 8).forEach(item => {
                tickerHTML += `<div class="ticker-item"><i class="fas fa-bolt" style="color:var(--secondary); margin-right:5px;"></i> <a href="${item.link}" target="_blank">${item.title}</a></div>`;
            });
            tickerContainer.innerHTML = tickerHTML + tickerHTML;
        }
    } catch (error) {
        console.error('Erro no Ticker:', error);
        tickerContainer.innerHTML = 'Bem-vindo à Rádio Jornal de Setúbal.';
    }
}

function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    document.getElementById('main-nav').classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
    document.getElementById('main-nav').classList.toggle('show');
}

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

// Inicia as chamadas na ordem correta
document.addEventListener('DOMContentLoaded', () => {
    fetchRSS(OSETUBALENSE_RSS, 'regional-news');
    fetchRSS(SETUBAL_RSS, 'setubal-news');
    fetchRSS(WINTECH_RSS, 'wintech-news');
    populateTicker();
});
