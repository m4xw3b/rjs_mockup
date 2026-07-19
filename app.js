const OSETUBALENSE_RSS = 'https://osetubalense.com/feed/';
const WINTECH_RSS = 'https://wintech.pt/?format=feed&type=rss';
const SETUBAL_RSS = 'https://www.mun-setubal.pt/feed/';

// Lógica otimizada para captar imagens reais de portais dinâmicos
function extractImageFromContent(item) {
    if (item.thumbnail && item.thumbnail !== '') return item.thumbnail;
    if (item.enclosure && item.enclosure.link && item.enclosure.type.startsWith('image/')) return item.enclosure.link;
    
    const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/i;
    let match = imgRegex.exec(item.content) || imgRegex.exec(item.description);
    if (match && match[1]) return match[1];
    
    // Imagens de fundo caso a notícia não tenha imagem (estilo Dark Theme)
    if (item.link.includes('mun-setubal')) return 'https://images.unsplash.com/photo-1517009572053-93fb56df749a?auto=format&fit=crop&w=600&q=80';
    if (item.link.includes('osetubalense')) return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'; 
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
}

// 1. Construtor de Grelhas com Imagem de Fundo (Estilo Portal Principal)
async function fetchNewsGrid(feedUrl, containerId, limit) {
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
                const imageUrl = extractImageFromContent(item);
                
                const cardHTML = `
                    <a href="${item.link}" target="_blank" class="news-card-img">
                        <img src="${imageUrl}" alt="Imagem do Artigo" loading="lazy">
                        <div class="card-overlay">
                            <span class="date">${dateStr}</span>
                            <h4>${item.title}</h4>
                        </div>
                    </a>
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

// 2. Construtor de Lista Lateral (Estilo Sidebar)
async function fetchNewsSidebar(feedUrl, containerId, limit) {
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
                const imageUrl = extractImageFromContent(item);
                
                const listItemHTML = `
                    <div class="side-news-item">
                        <img src="${imageUrl}" class="side-thumb" alt="Thumb" loading="lazy">
                        <div class="side-content">
                            <h5><a href="${item.link}" target="_blank">${item.title}</a></h5>
                            <span class="date">${dateStr}</span>
                        </div>
                    </div>
                `;
                container.innerHTML += listItemHTML;
            });
        }
    } catch (error) {
        container.innerHTML = '<p>Erro de carregamento.</p>';
    }
}

// Controlo de Navegação (Tabs)
function showView(viewId, element) {
    // Esconder views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    // Atualizar classe ativa no menu
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Lógica do Player Rádio
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
        audio.load(); // Força o stream a estar em direto e não em cache
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

// Inicialização da recolha de notícias
document.addEventListener('DOMContentLoaded', () => {
    // Grelhas principais (4 itens grandes)
    fetchNewsGrid(OSETUBALENSE_RSS, 'regional-news', 4);
    fetchNewsGrid(WINTECH_RSS, 'wintech-news', 4);
    
    // Lista lateral (Município - 4 itens pequenos)
    fetchNewsSidebar(SETUBAL_RSS, 'setubal-news', 4);
});
