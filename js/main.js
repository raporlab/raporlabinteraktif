// js/main.js

// Başlangıçta Keşfet sayfasını yükle
document.addEventListener('DOMContentLoaded', () => {
    loadPart('kesfet');
});

// Parçayı Yükle ve Göster (CACHE ÇÖZÜMÜ EKLENDİ)
async function loadPart(pageId) {
    const container = document.getElementById(pageId + '-content');
    
    // Eğer içerik boşsa yükle (daha önce yüklenmemişse)
    if (!container.innerHTML.trim()) {
        try {
            // ?v=... ekleyerek tarayıcının en güncel hali çekmesini sağlıyoruz
            const response = await fetch(`parts/cards-${pageId}.html?v=${Math.random()}`);
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

    // 1. İçerikleri gizle
    document.getElementById('kesfet-content').classList.add('hidden');
    document.getElementById('matematik-content').classList.add('hidden');
    document.getElementById('fizik-content').classList.add('hidden');
    
    // 2. Seçili olanı göster
    document.getElementById(pageId + '-content').classList.remove('hidden');

    // 3. Buton stillerini sıfırla
    const buttons = ['kesfet', 'matematik', 'fizik'];
    buttons.forEach(id => {
        const btn = document.getElementById('btn-' + id);
        if(btn) {
            btn.className = "w-full sidebar-item flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-slate-600";
            if(id === 'kesfet') btn.classList.add('mb-4');
        }
    });

    // 4. Aktif butonu boya
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

// ARAMA SİSTEMİ
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.sim-card');
    
    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        card.style.display = name.includes(searchTerm) ? "block" : "none";
    });
});

// ==========================================
// EMBED (SİTEYE GÖMME) ÖZELLİĞİ - GÜNCELLENDİ
// ==========================================
function shareSim() {
    const frame = document.getElementById('simFrame');
    const src = frame.getAttribute('src');

    // Eğer simülasyon açık değilse veya boşsa işlem yapma
    if (!src || src === "") {
        alert("Lütfen önce bir simülasyon açın.");
        return;
    }

    // Tam URL oluştur
    const fullUrl = new URL(src, window.location.href).href;

    // Standart Iframe Kodu Oluştur
    const embedCode = `<iframe src="${fullUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;

    // Kullanıcıya kodu göster ve kopyalamasını sağla
    // setTimeout ile biraz gecikme ekliyoruz ki tarayıcı render etsin
    setTimeout(() => {
        prompt("Bu simülasyonu kendi sitene eklemek için aşağıdaki kodu kopyala (CTRL+C):", embedCode);
    }, 100);
}
