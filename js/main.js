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
// 2. MODAL VE GERİ TUŞU YÖNETİMİ (DÜZELTİLDİ)
// ==========================================

function openSim(url, title) {
    const modal = document.getElementById('simModal');
    const frame = document.getElementById('simFrame');
    const titleEl = document.getElementById('modalTitle');
    
    titleEl.innerText = title; 
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // 1. Önce geçmişe "Modal Açık" bilgisini ekliyoruz.
    history.pushState({modalOpen: true}, null, window.location.hash); 

    // 2. KRİTİK DÜZELTME BURADA:
    // frame.src = url yaparsak tarayıcı bunu yeni sayfa sanıp geçmişe ekliyor.
    // replace() kullanırsak geçmişe eklemeden mevcut boş sayfayı değiştirir.
    if (frame.contentWindow) {
        frame.contentWindow.location.replace(url);
    } else {
        frame.src = url;
    }
}

function closeSim() {
    // Geri tuşunu tetikle (popstate çalışacak ve kapatacak)
    history.back();
}

// Tarayıcının Geri Tuşunu Dinleyen Olay
window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('simModal');
    const frame = document.getElementById('simFrame');
    
    // Eğer modal açıksa kapat
    if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        // Iframe'i temizlerken de replace kullanıyoruz ki geçmiş kirlenmesin
        if (frame.contentWindow) {
            frame.contentWindow.location.replace('about:blank');
        } else {
            frame.src = ""; 
        }
        document.body.style.overflow = 'auto';
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
