const OSETUBALENSE_RSS = 'https://osetubalense.com/feed/';
const WINTECH_RSS = 'https://wintech.pt/?format=feed&type=rss';
const SETUBAL_RSS = 'https://www.mun-setubal.pt/feed/';

// Extrator de imagens otimizado
function extractImageFromContent(item) {
    if (item.thumbnail && item.thumbnail !== '') return item.thumbnail;
    if (item.enclosure && item.enclosure.link && item.enclosure.type.startsWith('image/')) return item.enclosure.link;
    
    const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/i;
    let match = imgRegex.exec(item.content) || imgRegex.exec(item.description);
    if (match && match[1]) return match[1];
    
    // Imagens de substituição caso falhe
    if (item.link.includes('mun-setubal')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Pra%C3%A7a_de_Bocage_%28Set%C3%BAbal%29.jpg/800px-Pra%C3%A7a_de_Bocage_%28Set%C3%BAbal%29.jpg';
    if (item.link.includes('osetubalense')) return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=300&q=80'; 
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=300&q=80';
}

// Carregar RSS em formato de Lista (Como na imagem de referência)
async function fetchRSS(feedUrl, containerId, limit = 4) {
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
                
                // Texto cortado e limpo
                let desc = item.description.replace(/<[^>]*>?/gm, ''); 
                desc = desc.substring(0, 90) + '...';
                
                const imageUrl = extractImageFromContent(item);
                
                // Estrutura HTML de lista simples com imagem pequena à esquerda
                const articleHTML = `
                    <div class="news-item">
                        <img src="${imageUrl}" alt="Thumbnail" class="news-thumb" loading="lazy">
                        <div class="news-text">
                            <span class="news-date">${dateStr}</span>
                            <h4><a href="${item.link}" target="_blank">${item.title}</a></h4>
                            <p>${desc}</p>
                            <a href="${item.link}" target="_blank" class="btn-read-more">> read more</a>
                        </div>
                    </div>
                `;
                container.innerHTML += articleHTML;
            });
        } else {
            container.innerHTML = '<p>Não foi possível carregar as notícias.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Erro de ligação ao servidor.</p>';
    }
}

// Navegação entre abas
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Lógica do Player embutido na barra laranja
const audio = document.getElementById('audioStream');
const playIcon = document.getElementById('playIcon');
let isPlaying = false;

function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play" id="playIcon"></i> OUVIR EM DIRETO';
    } else {
        audio.load();
        audio.play();
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-pause" id="playIcon"></i> EM EMISSÃO';
    }
    isPlaying = !isPlaying;
}

// Inicializar scripts
document.addEventListener('DOMContentLoaded', () => {
    // Carrega 3 notícias para as colunas regionais e tecnologia
    fetchRSS(OSETUBALENSE_RSS, 'regional-news', 3);
    fetchRSS(WINTECH_RSS, 'wintech-news', 3);
    // Carrega 2 notícias para a área do Município
    fetchRSS(SETUBAL_RSS, 'setubal-news', 2);
});
