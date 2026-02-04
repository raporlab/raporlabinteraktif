// js/main.js

// ==========================================
// 1. SAYFA YÜKLENME VE NAVİGASYON
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && (hash === 'matematik' || hash === 'fizik')) {
        showPage(hash, false); 
    } else {
        showPage('kesfet', false);
    }
});

async function loadPart(pageId) {
    const container = document.getElementById(pageId + '-content');
    if (!container.innerHTML.trim()) {
        try {
            const response = await fetch(`parts/cards-${pageId}.html?v=${Math.random()}`);
            if (response.ok) {
                container.innerHTML = await response.text();
            }
        } catch (error) { console.error('Hata:', error); }
    }
}

function showPage(pageId, updateUrl = true) {
    loadPart(pageId);
    ['kesfet', 'matematik', 'fizik'].forEach(id => {
        document.getElementById(id + '-content').classList.add('hidden');
    });
    document.getElementById(pageId + '-content').classList.remove('hidden');

    if (updateUrl) window.location.hash = pageId;

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
        if (!sidebar.classList.contains('-translate-x-full')) toggleSidebar();
    }
}

// ==========================================
// 2. MODAL VE IFRAME YÖNETİMİ (KÖKTEN ÇÖZÜM)
// ==========================================

function openSim(url, title) {
    const modal = document.getElementById('simModal');
    const container = document.getElementById('simContainer'); // HTML'de değiştirdiğimiz div
    const titleEl = document.getElementById('modalTitle');
    
    titleEl.innerText = title; 
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // GEÇMİŞE TEK BİR KAYIT EKLE (Modal açıldı diye)
    history.pushState({modalOpen: true}, null, window.location.hash); 

    // IFRAME'İ SIFIRDAN OLUŞTUR (Tarihçe sorununu çözen kısım)
    // Mevcut içeriği temizle ve yeni iframe ekle
    container.innerHTML = `
        <iframe id="simFrame" 
                src="${url}" 
                class="absolute inset-0 w-full h-full border-none" 
                allowfullscreen>
        </iframe>`;
}

function closeSim() {
    // Geri tuşunu tetikle
    history.back();
}

// Tarayıcı Geri Tuşu Olayı
window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('simModal');
    const container = document.getElementById('simContainer');
    
    // Modal açıksa kapat
    if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // IFRAME'İ TAMAMEN YOK ET
        // Bu sayede tarayıcı hafızasında ve geçmişinde iframe kalmaz
        if(container) {
            container.innerHTML = ''; 
        }
    }
});

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
    // Iframe artık dinamik olduğu için o an DOM'da var mı diye bakıyoruz
    const frame = document.getElementById('simFrame');
    
    if (!frame) {
        alert("Lütfen önce simülasyonu başlatın.");
        return;
    }

    const src = frame.getAttribute('src');
    try {
        const fullUrl = new URL(src, window.location.href).href;
        const embedCode = `<iframe src="${fullUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
        window.prompt("Kodu kopyala (CTRL+C):", embedCode);
    } catch (error) {
        console.error("Embed hatası:", error);
    }
}

// Global Erişim
window.showPage = showPage;
window.openSim = openSim;
window.closeSim = closeSim;
window.toggleSidebar = toggleSidebar;
window.shareSim = shareSim;
