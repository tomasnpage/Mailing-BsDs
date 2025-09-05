let allProducts = [];
let mainGridProducts = []; // <-- NUEVO: Lista solo para la grilla principal filtrable

const categoryBanners = {
   // 'Almacen': ['banners-promocionales/almacen_banner.jpg'],
   // 'Bebidas': ['banners-promocionales/bebidas_banner.jpg'],
   // 'Frescos': ['banners-promocionales/frescos_banner.jpg'],
    'Limpieza': ['banners-promocionales/limpieza_banner.jpg']
};


function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
}

// --- NUEVA FUNCIÓN PARA EL SLIDER ---
function setupSlider() {
    const track = document.querySelector('.slider-track');
    if (!track) return; // Si no hay slider, no hacer nada

    const slides = Array.from(track.children);
    const dotsContainer = document.querySelector('.slider-dots');
    let currentIndex = 0;
    let slideInterval;

    // Crear los puntos de navegación
    slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
            resetInterval();
        });
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    // Función para actualizar la posición del slider y los puntos
    function updateSlider() {
        track.style.transform = 'translateX(' + (-currentIndex * 100) + '%)';
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    }
    
    // Función para avanzar al siguiente slide
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }
    
    // Función para reiniciar el intervalo de auto-play
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000); // Cambia de slide cada 5 segundos
    }
    
    // Iniciar el auto-play
    slideInterval = setInterval(nextSlide, 5000);
}


function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines.shift().split(',').map(header => header.trim());
    return lines.map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
        });
        return obj;
    });
}

function createProductCardHTML(product) {
    const formattedPrice = parseFloat(product.price).toLocaleString('es-AR');
    const isFeatured = product.featured === 'true';
    const featuredClass = isFeatured ? 'featured' : '';

    return `
        <div class="product-card ${featuredClass}">
            ${/* <div class="product-category">${product.category}</div>*/''}
            <img src="fotos-productos/arroz.jpg" alt="${product.name}">
            <div class="price">$${formattedPrice}</div>
            <div class="description">${product.description}</div>
        </div>
    `;
}

function displayDailyDeals(products) {
    const dealsContainer = document.getElementById('daily-deals-container');
    dealsContainer.innerHTML = '';

    const dealsConfig = [
        { title: "Sólo por jueves 23 de junio", dayKey: "jueves" },
        { title: "Sólo por viernes 27 de junio", dayKey: "viernes" },
        { title: "Sólo por sábado 28 de junio", dayKey: "sabado" }
    ];

    dealsConfig.forEach(deal => {
        const productsForDay = products.filter(p => p.deal_day === deal.dayKey);

        if (productsForDay.length > 0) {
            let productsHTML = productsForDay.map(createProductCardHTML).join('');
            dealsContainer.innerHTML += `
                <div class="deal-row">
                    <h3>${deal.title}</h3>
                    <div class="product-grid deal-grid">${productsHTML}</div>
                </div>
            `;
        }
    });
}

function displayProducts(productsToShow) {
    const gridContainer = document.getElementById('product-grid-container');
    gridContainer.innerHTML = productsToShow.length === 0
        ? '<p>No hay productos que coincidan con su búsqueda.</p>'
        : productsToShow.map(createProductCardHTML).join('');
}

function displayCategoryBanner(category) {
    const bannerContainer = document.getElementById('category-banner-container');
    const bannersForCategory = categoryBanners[category];

    if (bannersForCategory && bannersForCategory.length > 0) {
        const bannersHTML = bannersForCategory.map(bannerFile => 
            `<img src="${bannerFile}" alt="Banner de ${category}">`
        ).join('');
        bannerContainer.innerHTML = bannersHTML;
    } else {
        bannerContainer.innerHTML = '';
    }
}

async function loadProducts() {
    try {
        const response = await fetch('products.csv');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        allProducts = parseCSV(csvText);
        
        mainGridProducts = allProducts.filter(p => p.deal_day === 'todos');

        displayDailyDeals(allProducts); 
        displayProducts(mainGridProducts); 

    } catch (error) {
        console.error("Error al cargar los productos:", error);
        document.getElementById('product-grid-container').innerHTML = '<p>Lo sentimos, no pudimos cargar las ofertas.</p>';
    }
}

function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.dataset.category;
            let filteredProducts;
            
            if (category === 'all') {
                filteredProducts = mainGridProducts;
            } else if (category === 'featured') {
                filteredProducts = mainGridProducts.filter(p => p.featured === 'true');
            } else {
                filteredProducts = mainGridProducts.filter(p => p.category === category);
            }
            
            displayProducts(filteredProducts);
            displayCategoryBanner(category);
        });
    });
}

// --- LISTENER ACTUALIZADO ---
document.addEventListener('DOMContentLoaded', () => {
    setupSlider(); // <-- LLAMADA A LA NUEVA FUNCIÓN DEL SLIDER
    loadProducts();
    setupCategoryFilters();
});