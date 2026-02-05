// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // Sayfa ilk açıldığında veya yenilendiğinde URL'deki #hash değerini al
    const hash = window.location.hash.replace('#', '');
    
    // Geçerli sayfalar listesine 'kimya'yı ekliyoruz
    const validPages = ['kesfet', 'matematik', 'fizik', 'kimya'];
    
    if (hash && validPages.includes(hash)) {
        showPage(hash, false); 
    } else {
        // Eğer hash yoksa veya geçersizse keşfetten başla
        showPage('kesfet', false);
    }
});

async function loadPart(pageId) {
    const container = document.getElementById(pageId + '-content');
    if (container && !container.innerHTML.trim()) {
        try {
            const response = await fetch(`parts/cards-${pageId}.html?v=${Math.random()}`);
            if (response.ok) {
                container.innerHTML = await response.text();
            }
        } catch (error) { console.error('Yükleme hatası:', error); }
    }
}

function showPage(pageId, updateUrl = true) {
    loadPart(pageId);

    // 1. İçerikleri Yönet (Kimya eklendi)
    ['kesfet', 'matematik', 'fizik', 'kimya'].forEach(id => {
        const el = document.getElementById(id + '-content');
        if(el) el.classList.add('hidden');
    });
    
    const target = document.getElementById(pageId + '-content');
    if(target) target.classList.remove('hidden');

    if (updateUrl) window.location.hash = pageId;

    // 2. Menü Butonlarını Güncelle (Kimya eklendi)
    ['kesfet', 'matematik', 'fizik', 'kimya'].forEach(id => {
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

    // 3. Arama Çubuğunu Gizle/Göster (Fix edildi)
    const searchWrapper = document.getElementById('searchWrapper');
    if (searchWrapper) {
        if (pageId === 'kesfet') {
            searchWrapper.classList.add('hidden');
        } else {
            searchWrapper.classList.remove('hidden');
        }
    }

    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) toggleSidebar();
    }
}

// MODAL VE IFRAME YÖNETİMİ
function openSim(url, title) {
    const modal = document.getElementById('simModal');
    const container = document.getElementById('simContainer');
    const titleEl = document.getElementById('modalTitle');
    
    titleEl.innerText = title; 
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    history.pushState({modalOpen: true}, null, window.location.hash); 

    container.innerHTML = `<iframe id="simFrame" src="${url}" class="absolute inset-0 w-full h-full border-none" allowfullscreen></iframe>`;
}

function closeSim() {
    history.back();
}

window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('simModal');
    const container = document.getElementById('simContainer');
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        if(container) container.innerHTML = ""; 
    }
});

function shareSim() {
    const frame = document.getElementById('simFrame');
    if (!frame) return;
    const currentUrl = frame.src;
    if (!currentUrl || currentUrl === "" || currentUrl.includes("about:blank")) {
        alert("Lütfen önce bir simülasyon başlatın.");
        return;
    }
    const embedCode = `<iframe src="${currentUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
    window.prompt("Kodu kopyala (CTRL+C):", embedCode);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// Arama İşlemi
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.sim-card').forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        card.style.display = name.includes(searchTerm) ? "block" : "none";
    });
});

window.showPage = showPage;
window.openSim = openSim;
window.closeSim = closeSim;
window.toggleSidebar = toggleSidebar;
window.shareSim = shareSim;
