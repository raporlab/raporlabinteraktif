// js/main.js

// ==========================================
// 1. SAYFA YÜKLENME VE NAVİGASYON YÖNETİMİ
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Sayfa ilk açıldığında URL'deki #hash değerini kontrol et
    const hash = window.location.hash.replace('#', '');
    
    if (hash && (hash === 'matematik' || hash === 'fizik')) {
        // Eğer linkte #matematik veya #fizik varsa o sayfayı aç
        showPage(hash, false); // false: Tekrar hash eklemeye gerek yok
    } else {
        // Yoksa varsayılan olarak Keşfet'i aç
        showPage('kesfet', false);
    }
});

// Parçayı Yükle (Cache Önlemli)
async function loadPart(pageId) {
    const container = document.getElementById(pageId + '-content');
    
    // İçerik boşsa yükle
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

    // 1. İçerikleri Gizle
    ['kesfet', 'matematik', 'fizik'].forEach(id => {
        document.getElementById(id + '-content').classList.add('hidden');
    });
    
    // 2. Seçili Olanı Göster
    document.getElementById(pageId + '-content').classList.remove('hidden');

    // 3. URL'i Güncelle (Sayfa yenilenince kalması için)
    if (updateUrl) {
        window.location.hash = pageId;
    }

    // 4. Menü Butonlarını Güncelle
    ['kesfet', 'matematik', 'fizik'].forEach(id => {
        const btn = document.getElementById('btn-' + id);
        if(btn) {
            // Hepsini pasif yap
            btn.className = "w-full sidebar-item flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-slate-600";
            if(id === 'kesfet') btn.classList.add('mb-4');
        }
    });

    // Aktif butonu boya
    const activeBtn = document.getElementById('btn-' + pageId);
    if(activeBtn) {
        activeBtn.classList.remove('text-slate-600');
        activeBtn.classList.add('active-nav');
    }

    // Mobilde menüyü kapat
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }
}

// ==========================================
// 2. MODAL (PENCERE) VE GERİ TUŞU YÖNETİMİ
// ==========================================

function openSim(url, title) {
    const modal = document.getElementById('simModal');
    const frame = document.getElementById('simFrame');
    const titleEl = document.getElementById('modalTitle');
    
    frame.src = url; 
    titleEl.innerText = title; 
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // **ÖNEMLİ:** Tarayıcı geçmişine sanal bir adım ekliyoruz.
    // Böylece kullanıcı "Geri" tuşuna bastığında siteden çıkmaz, 
    // sadece bu sanal adımı geri alır (yani modalı kapatır).
    history.pushState({modalOpen: true}, null, window.location.hash); 
}

// Kapat butonuna basınca çalışır
function closeSim() {
    // Butona basıldığında manuel kapatmak yerine,
    // tarayıcıya "Geri Git" komutu veriyoruz.
    // Bu, aşağıdaki 'popstate' olayını tetikler ve pencereyi kapatır.
    history.back();
}

// Tarayıcının Geri Tuşunu Dinleyen Olay
window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('simModal');
    const frame = document.getElementById('simFrame');
    
    // Eğer modal açıksa kapat
    if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        frame.src = ""; // Simülasyonu durdur
        document.body.style.overflow = 'auto';
    }
});

// ==========================================
// 3. DİĞER FONKSİYONLAR (Sidebar, Arama, Embed)
// ==========================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// Arama Sistemi
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

// Embed (Siteye Gömme) Özelliği
function shareSim() {
    const frame = document.getElementById('simFrame');
    if (!frame) return;

    const src = frame.getAttribute('src');
    if (!src || src === "") {
        alert("Lütfen önce listeden bir simülasyon başlatın.");
        return;
    }

    try {
        const fullUrl = new URL(src, window.location.href).href;
        const embedCode = `<iframe src="${fullUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
        window.prompt("Bu simülasyonu sitene eklemek için kodu kopyala (CTRL+C):", embedCode);
    } catch (error) {
        console.error("Embed hatası:", error);
    }
}

// Fonksiyonları global erişime aç
window.showPage = showPage;
window.openSim = openSim;
window.closeSim = closeSim;
window.toggleSidebar = toggleSidebar;
window.shareSim = shareSim;
