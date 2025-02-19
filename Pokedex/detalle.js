const detailContainer = document.getElementById("pokemon-detail");
const urlParams = new URLSearchParams(window.location.search);
const pokemonName = urlParams.get("pokemon");

// Obtener datos detallados
async function fetchPokemonDetail() {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const data = await res.json();

        detailContainer.innerHTML = `
            <h1>${data.name}</h1>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p>ID: #${data.id}</p>
            <h2>Estadísticas</h2>
            <ul>
                ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
        `;
    } catch (error) {
        detailContainer.innerHTML = "<p>Error al cargar los detalles.</p>";
    }
}

fetchPokemonDetail();
