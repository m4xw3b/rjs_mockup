// Configurações dos Feeds RSS
const WINTECH_RSS = 'https://wintech.pt/?format=feed&type=rss';
const SETUBAL_RSS = 'https://www.mun-setubal.pt/feed/'; // Feed genérico WordPress da CMS

// Função para buscar e processar os feeds usando rss2json
async function fetchRSS(feedUrl, containerId) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const container = document.getElementById(containerId);
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            container.innerHTML = ''; // Limpa o loading
            
            // Pega os 5 artigos mais recentes
            const articles = data.items.slice(0, 5);
            
            articles.forEach(item => {
                // Formatação simples de data
                const dateObj = new Date(item.pubDate);
                const dateStr = dateObj.toLocaleDateString('pt-PT');
                
                // Limpeza do texto para não estourar o layout
                let desc = item.description.replace(/<[^>]*>?/gm, ''); 
                desc = desc.substring(0, 120) + '...';
                
                const articleHTML = `
                    <article class="news-item">
                        <span class="date"><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                        <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
                        <p>${desc}</p>
                    </article>
                `;
                container.innerHTML += articleHTML;
            });
        } else {
            container.innerHTML = '<div class="news-item"><p>Não foi possível carregar as notícias.</p></div>';
        }
    } catch (error) {
        console.error('Erro ao carregar RSS:', error);
        container.innerHTML = '<div class="news-item"><p>Erro de ligação ao servidor de notícias.</p></div>';
    }
}

// Lógica de Navegação (Single Page)
function showView(viewId) {
    // Esconde todas as vistas
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    // Mostra a vista selecionada
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    // Fecha o menu mobile se estiver aberto
    document.getElementById('main-nav').classList.remove('show');
    
    // Faz scroll para o topo suavemente
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

// Configuração inicial do volume
audio.volume = volumeSlider.value;

function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    } else {
        // Recarrega o stream para garantir que está em "direto" e não no buffer
        audio.load();
        audio.play();
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    }
    isPlaying = !isPlaying;
}

// Evento do Slider de Volume
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Inicializar carregamento de dados quando a página arranca
document.addEventListener('DOMContentLoaded', () => {
    fetchRSS(SETUBAL_RSS, 'setubal-news');
    fetchRSS(WINTECH_RSS, 'wintech-news');
});
