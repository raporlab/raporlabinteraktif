document.addEventListener('DOMContentLoaded', () => {
    // Sayfa ilk açıldığında veya yenilendiğinde URL'deki #hash değerini al
    const hash = window.location.hash.replace('#', '');
    
    // Geçerli sayfalar listesi
    const validPages = ['kesfet', 'matematik', 'fizik', 'kimya'];
    
    // Hash varsa o sayfayı aç, yoksa keşfet'i aç
    if (hash && validPages.includes(hash)) {
        showPage(hash, false); 
    } else {
        showPage('kesfet', false);
    }
});

// Parçalı HTML Yükleme (Lazy Load)
async function loadPart(pageId) {
    const container = document.getElementById(pageId + '-content');
    
    // Eğer içerik daha önce yüklenmediyse fetch et
    if (container && !container.innerHTML.trim()) {
        try {
            // Cache önlemek için v=random ekledik
            const response = await fetch(`parts/cards-${pageId}.html?v=${Math.random()}`);
            if (response.ok) {
                container.innerHTML = await response.text();
            } else {
                console.error('Sayfa parçası bulunamadı:', pageId);
                container.innerHTML = '<div class="text-center text-slate-400 py-10">İçerik yüklenirken bir hata oluştu.</div>';
            }
        } catch (error) { 
            console.error('Yükleme hatası:', error); 
        }
    }
}

function showPage(pageId, updateUrl = true) {
    // 1. İlgili içeriği yükle
    loadPart(pageId);

    // 2. Tüm içerik alanlarını gizle
    ['kesfet', 'matematik', 'fizik', 'kimya'].forEach(id => {
        const el = document.getElementById(id + '-content');
        if(el) el.classList.add('hidden');
    });
    
    // 3. Hedef içeriği göster
    const target = document.getElementById(pageId + '-content');
    if(target) target.classList.remove('hidden');

    // 4. URL Hash güncelle
    if (updateUrl) window.location.hash = pageId;

    // 5. Menü Butonlarının Stilini Sıfırla
    ['kesfet', 'matematik', 'fizik', 'kimya'].forEach(id => {
        const btn = document.getElementById('btn-' + id);
        if(btn) {
            // Varsayılan buton stili
            btn.className = "w-full sidebar-item flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700";
            // Keşfet butonu için alt boşluk ekle
            if(id === 'kesfet') btn.classList.add('mb-6');
        }
    });

    // 6. Aktif Menü Butonunu İşaretle
    const activeBtn = document.getElementById('btn-' + pageId);
    if(activeBtn) {
        activeBtn.classList.remove('text-slate-500', 'hover:bg-slate-50');
        activeBtn.classList.add('active-nav', 'text-slate-900', 'shadow-sm'); // active-nav style.css veya head içinde tanımlı
    }

    // 7. ARAMA ÇUBUĞU YÖNETİMİ (Search Box Visibility)
    const searchWrapper = document.getElementById('searchWrapper');
    if (searchWrapper) {
        if (pageId === 'kesfet') {
            // Keşfet sayfasında gizle
            searchWrapper.classList.add('hidden'); 
        } else {
            // Diğer sayfalarda göster
            searchWrapper.classList.remove('hidden');
        }
    }

    // 8. Mobilde Sidebar'ı Kapat (Eğer açıksa)
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        // Eğer sidebar ekranda ise (yani -translate-x-full yoksa) kapat
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }
}

// --- MODAL, IFRAME VE SEARCH İŞLEMLERİ ---

function openSim(url, title) {
    const modal = document.getElementById('simModal');
    const container = document.getElementById('simContainer');
    const titleEl = document.getElementById('modalTitle');
    
    titleEl.innerText = title; 
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Arka plan scroll kilit

    // Geri tuşu ile modal kapatabilmek için history state ekle
    history.pushState({modalOpen: true}, null, window.location.hash); 

    // Iframe oluştur
    container.innerHTML = `<iframe id="simFrame" src="${url}" class="absolute inset-0 w-full h-full border-none" allowfullscreen></iframe>`;
}

function closeSim() {
    // History back, popstate eventini tetikler ve modalı kapatır
    if (history.state && history.state.modalOpen) {
        history.back();
    } else {
        // Fallback: Manuel kapatma
        const modal = document.getElementById('simModal');
        const container = document.getElementById('simContainer');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        container.innerHTML = "";
    }
}

// Tarayıcı Geri Tuşu Kontrolü
window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('simModal');
    const container = document.getElementById('simContainer');
    
    // Eğer modal açıksa kapat
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
    
    // Modern kopyalama veya prompt fallback
    if (navigator.clipboard) {
        navigator.clipboard.writeText(embedCode).then(() => {
            alert("Embed kodu panoya kopyalandı!");
        }).catch(() => {
            window.prompt("Kodu kopyala (CTRL+C):", embedCode);
        });
    } else {
        window.prompt("Kodu kopyala (CTRL+C):", embedCode);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }
}

// Arama Input İşleyicisi
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    // Sadece görünür olan content alanındaki kartları filtrele
    // Not: Tüm kartlar .sim-card sınıfına ve data-name özelliğine sahip olmalı
    document.querySelectorAll('.sim-card').forEach(card => {
        // Kartın görünür bir container içinde olup olmadığına bakabiliriz
        // veya global arama yapıyorsak hepsini açıp kapatabiliriz.
        // Şimdilik sadece style.display toggle yapıyoruz.
        
        const name = card.getAttribute('data-name')?.toLowerCase() || "";
        if (name.includes(searchTerm)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});

// Global Erişim İçin Window'a Ata
window.showPage = showPage;
window.openSim = openSim;
window.closeSim = closeSim;
window.toggleSidebar = toggleSidebar;
window.shareSim = shareSim;
