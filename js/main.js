// js/main.js

// Başlangıçta Keşfet sayfasını yükle
document.addEventListener('DOMContentLoaded', () => {
    loadPart('kesfet');
});

// Parçayı Yükle ve Göster
async function loadPart(pageId) {
    const container = document.getElementById(pageId + '-content');
    
    // Eğer içerik boşsa yükle (daha önce yüklenmemişse)
    if (!container.innerHTML.trim()) {
        try {
            const response = await fetch(`parts/cards-${pageId}.html`);
            if (response.ok) {
                const html = await response.text();
                container.innerHTML = html;
            } else {
                console.error('Sayfa yüklenemedi:', pageId);
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    }
}

// Sayfa Değiştirme
function showPage(pageId) {
    // Önce gerekli içeriği yükle
    loadPart(pageId);

    // 1. İçerikleri gizle/göster
    document.getElementById('kesfet-content').classList.add('hidden');
    document.getElementById('matematik-content').classList.add('hidden');
    document.getElementById('fizik-content').classList.add('hidden');
    
    document.getElementById(pageId + '-content').classList.remove('hidden');

    // 2. Buton stillerini sıfırla
    const buttons = ['kesfet', 'matematik', 'fizik'];
    buttons.forEach(id => {
        const btn = document.getElementById('btn-' + id);
        if(btn) {
            btn.className = "w-full sidebar-item flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-slate-600";
            if(id === 'kesfet') btn.classList.add('mb-4');
        }
    });

    // 3. Aktif butonu boya
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

// MODAL KONTROLLERİ & GERİ TUŞU
function openSim(url, title) {
    const modal = document.getElementById('simModal');
    const frame = document.getElementById('simFrame');
    const titleEl = document.getElementById('modalTitle');
    
    frame.src = url; 
    titleEl.innerText = title; 
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Geçmişe ekle
    history.pushState({modal: true}, null, ""); 
}

function closeSim() {
    history.back();
}

// Geri Tuşu Dinleme
window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('simModal');
    const frame = document.getElementById('simFrame');
    
    if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        frame.src = ""; 
        document.body.style.overflow = 'auto';
    }
});

// SIDEBAR KONTROLÜ
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// ARAMA SİSTEMİ (Basitleştirilmiş - Yüklü içerikte arar)
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    // Not: Arama sadece o an DOM'da yüklü olan kartlarda çalışır.
    const cards = document.querySelectorAll('.sim-card');
    
    if (searchTerm.length > 0) {
        // Eğer arama yapılıyorsa ve Matematik/Fizik gizliyse, onları açmak gerekebilir
        // Şimdilik sadece mevcut görünümde filtreleme yapar
    }

    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        card.style.display = name.includes(searchTerm) ? "block" : "none";
    });
});
