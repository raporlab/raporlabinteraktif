// js/main.js

// ==========================================
// 1. SAYFA YÜKLENME VE NAVİGASYON YÖNETİMİ
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Sayfa ilk açıldığında URL'deki #hash değerini kontrol et
    const hash = window.location.hash.replace('#', '');
    
    if (hash && (hash === 'matematik' || hash === 'fizik')) {
        showPage(hash, false); 
    } else {
        showPage('kesfet', false);
    }
});

// Parçayı Yükle (Cache Önlemli)
async function loadPart(pageId) {
    const container = document.getElementById(pageId + '-content');
    
    if (!container.innerHTML.trim()) {
        try {
            const response = await fetch(`parts/cards-${pageId}.html?v=${Math.random()}`);
            if (response.ok) {
                container.innerHTML = await response.text();
            } else {
                console.error('Sayfa yüklenemedi:', pageId);
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    }
}

// Sayfa Değiştirme Fonksiyonu
function showPage(pageId, updateUrl = true) {
    loadPart(pageId);

    ['kesfet', 'matematik', 'fizik'].forEach(id => {
        document.getElementById(id + '-content').classList.add('hidden');
    });
    
    document.getElementById(pageId + '-content').classList.remove('hidden');

    if (updateUrl) {
        window.location.hash = pageId;
    }

    ['kesfet', 'matematik', 'fizik'].forEach(id => {
        const btn = document.getElementById('btn-' + id);
        if(btn) {
            btn.className = "w-full sidebar-item flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-slate-600";
            if(id === 'kesfet') btn.classList.add('mb-4');
        }
    });

    const activeBtn = document.getElementById('btn-' + pageId);
    if(activeBtn) {
        activeBtn.classList.remove('text-slate-600');
        activeBtn.classList.add('active-nav');
    }

    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }
}

// ==========================================
// 2. MODAL VE IFRAME YÖNETİMİ (KESİN ÇÖZÜM)
// ==========================================

function openSim(url, title) {
    const modal = document.getElementById('simModal');
    const container = document.getElementById('simContainer');
    const titleEl = document.getElementById('modalTitle');
    
    titleEl.innerText = title; 
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // 1. Geçmişe sadece modal için TEK bir kayıt ekle
    history.pushState({modalOpen: true}, null, window.location.hash); 

    // 2. Iframe'i sıfırdan oluştur ve içeri at
    // Bu sayede tarayıcı iframe'in içindeki yönlenmeleri ana geçmişe yazamaz
    container.innerHTML = `<iframe id="simFrame" src="${url}" class="absolute inset-0 w-full h-full border-none" allowfullscreen></iframe>`;
}

function closeSim() {
    // Sadece geri git komutu veriyoruz
    history.back();
}

// Tarayıcı Geri Tuşu veya closeSim tetiklendiğinde
window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('simModal');
    const container = document.getElementById('simContainer');
    
    if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // IFRAME'İ TAMAMEN SİL
        // Beyaz ekran sorununun çözümü burasıdır. 
        // Iframe yok edildiği için geçmişteki hayaleti de gider.
        container.innerHTML = ""; 
    }
});

// shareSim fonksiyonu için küçük bir düzeltme (frame artık dinamik)
function shareSim() {
    const frame = document.getElementById('simFrame');
    if (!frame) return;

    const currentUrl = frame.src; // Dinamik yapıda doğrudan src güvenilirdir

    if (!currentUrl || currentUrl === "") {
        alert("Lütfen önce listeden bir simülasyon başlatın.");
        return;
    }

    const embedCode = `<iframe src="${currentUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
    window.prompt("Bu simülasyonu sitene eklemek için kodu kopyala (CTRL+C):", embedCode);
}

// ==========================================
// 3. DİĞER FONKSİYONLAR
// ==========================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

const searchInput = document.getElementById('searchInput');
if(searchInput) {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.sim-card');
        
        cards.forEach(card => {
            const name = card.getAttribute('data-name').toLowerCase();
            card.style.display = name.includes(searchTerm) ? "block" : "none";
        });
    });
}

function shareSim() {
    const frame = document.getElementById('simFrame');
    if (!frame) return;

    // replace kullandığımız için src attribute'u güncellenmeyebilir, contentWindow'dan alıyoruz
    let currentUrl = "";
    try {
        currentUrl = frame.contentWindow.location.href;
    } catch(e) {
        // Cross-origin hatası olursa (ki senin projede olmaz ama) yedek:
        currentUrl = frame.src; 
    }

    if (!currentUrl || currentUrl === "about:blank" || currentUrl === "") {
        alert("Lütfen önce listeden bir simülasyon başlatın.");
        return;
    }

    try {
        const embedCode = `<iframe src="${currentUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
        window.prompt("Bu simülasyonu sitene eklemek için kodu kopyala (CTRL+C):", embedCode);
    } catch (error) {
        console.error("Embed hatası:", error);
    }
}

window.showPage = showPage;
window.openSim = openSim;
window.closeSim = closeSim;
window.toggleSidebar = toggleSidebar;
window.shareSim = shareSim;
