const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=1080";
const TYPE_API_URL = "https://pokeapi.co/api/v2/type/";
const container = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search");
const typeFilterContainer = document.getElementById("type-filter");

let pokemonList = [];
let filteredPokemon = [];
let selectedTypes = []; // Lista para almacenar los tipos seleccionados

// Obtener tipos de Pokémon y mostrarlos en la barra de navegación
async function fetchPokemonTypes() {
    try {
        const res = await fetch(TYPE_API_URL);
        const data = await res.json();
        typeFilterContainer.innerHTML = `<img src="img/pokeball.png" class="type-icon" onclick="clearFilters()">`; // Botón para mostrar todos
        const filteredTypes = data.results.filter(type => type.name !== 'stellar' && type.name !== 'unknown');

        data.results.forEach(type => {
            const typeName = type.name;
            const typeImage = `img/${typeName}.png`; // Ruta de imágenes de tipos (debes agregar estos íconos en la carpeta "img")

            const img = document.createElement("img");
            img.src = typeImage;
            img.classList.add("type-icon");
            img.alt = typeName;
            img.onclick = () => toggleTypeFilter(typeName, img);
            typeFilterContainer.appendChild(img);
        });
    } catch (error) {
        console.error("Error al obtener los tipos de Pokémon:", error);
    }
}

// Obtener lista de Pokémon
async function fetchPokemonList() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        pokemonList = data.results;

        // Mostrar rápidamente los nombres y luego cargar imágenes y detalles
        renderLoadingPokemon();

        // Cargar detalles de forma progresiva para evitar ralentización
        loadPokemonDetails();
    } catch (error) {
        console.error("Error al cargar Pokémon", error);
    }
}

// Mostrar nombres mientras se cargan detalles
function renderLoadingPokemon() {
    container.innerHTML = pokemonList
        .map(pokemon => `
            <div class="card loading">
                <h3>${pokemon.name}</h3>
                <p>Cargando...</p>
            </div>
        `)
        .join("");
}


// Obtener detalles de cada Pokémon (incluyendo tipos)
async function loadPokemonDetails() {
    const promises = pokemonList.map(async (pokemon) => {
        const res = await fetch(pokemon.url);
        return await res.json();
    });

    pokemonList = await Promise.all(promises);
    filteredPokemon = pokemonList; // Inicialmente, mostrar todos los Pokémon
    renderPokemon();
}

// Mostrar Pokémon en la página
function renderPokemon() {
    container.innerHTML = "";
    
    filteredPokemon.forEach(pokemon => {
        const types = pokemon.types.map(t => t.type.name);
        const typeText = types.join(", ");

        container.innerHTML += `
            <div class="card" onclick="goToDetail('${pokemon.name}')">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <h3>${pokemon.name}</h3>
                <p>#${pokemon.id}</p>
                <p>Tipo: ${typeText}</p>
            </div>
        `;
    });
}
//filtrar pokemon por tipo
function filterByType(type = null) {
    if (type) {
        // Si se selecciona un tipo específico
        if (selectedTypes.includes(type)) {
            selectedTypes = selectedTypes.filter(t => t !== type);
        } else {
            if (selectedTypes.length < 2) {
                selectedTypes.push(type);
            }
        }
    }

    filteredPokemon = pokemonList.filter(pokemon => {
        return selectedTypes.every(selectedType =>
            pokemon.types.some(t => t.type.name === selectedType)
        );
    });

    renderPokemon();
}

// Alternar selección de tipos en el filtro
function toggleTypeFilter(type, imgElement) {
    if (selectedTypes.includes(type)) {
        // Si el tipo ya está seleccionado, lo quitamos
        selectedTypes = selectedTypes.filter(t => t !== type);
        imgElement.classList.remove("selected");
    } else {
        if (selectedTypes.length < 2) {
            // Agregar el tipo si no hay ya dos seleccionados
            selectedTypes.push(type);
            imgElement.classList.add("selected");
        }
    }
    filterByType();
}

// Buscar Pokémon por nombre y aplicar filtros
searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === "") {
        // Si no hay texto en la búsqueda, mostrar los Pokémon filtrados por tipo
        filterByType();
    } else {
        // Filtrar por nombre dentro de los Pokémon ya filtrados por tipo
        filteredPokemon = pokemonList.filter(poke => 
            poke.name.includes(searchTerm) &&
            (selectedTypes.length === 0 || selectedTypes.every(selectedType =>
                poke.types.some(t => t.type.name === selectedType)
            ))
        );
    }
    renderPokemon();
});


// Limpiar filtros de tipos
function clearFilters() {
    selectedTypes = [];
    document.querySelectorAll(".type-icon").forEach(img => img.classList.remove("selected"));
    filterByType();
}

// Buscar Pokémon por nombre
let searchTimeout;

searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout); // Cancelar cualquier búsqueda anterior
    
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm === "") {
            filteredPokemon = pokemonList; // Restaurar la lista completa si el campo está vacío
        } else {
            filteredPokemon = pokemonList.filter(pokemon => 
                pokemon.name.toLowerCase().includes(searchTerm)
            );
        }

        requestAnimationFrame(renderPokemon); // Renderizar sin bloquear la página
    }, 300); // Esperar 300ms antes de filtrar
});


// Ir a la página de detalles
function goToDetail(name) {
    window.location.href = `detalle.html?pokemon=${name}`;
}

// Cargar datos iniciales
fetchPokemonTypes();
fetchPokemonList();
