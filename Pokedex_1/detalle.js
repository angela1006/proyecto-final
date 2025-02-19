const detailContainer = document.getElementById("pokemon-detail");
const urlParams = new URLSearchParams(window.location.search);
const pokemonName = urlParams.get("pokemon");

// Obtener datos detallados
async function fetchPokemonDetail(pokemonName) {
    try {
        // Obtener detalles del Pokémon
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const data = await res.json();

        // Obtener descripción del Pokémon
        const description = await fetchPokemonDescription(data.id);
        
        // Obtener habilidades del Pokémon
        const abilities = getPokemonAbilities(data);

        // Obtener la cadena de evolución
        const evolutionChainId = await fetchEvolutionChainId(data.species.url);
        const evolutions = await fetchEvolutionChain(evolutionChainId);

        // Mostrar los detalles en el contenedor
        detailContainer.innerHTML = `
            <h1>${data.name}</h1>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p>ID: #${data.id}</p>
            <h2>Descripción</h2>
            <p>${description}</p>
            <h2>Habilidades</h2>
            <ul>
                ${abilities.map(ability => `<li>${ability}</li>`).join('')}
            </ul>
            <h2>Evoluciones</h2>
            <ul>
                ${evolutions.map(evo => `<li>${evo}</li>`).join('')}
            </ul>
            <h2>Estadísticas</h2>
            <ul>
                ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
        `;
    } catch (error) {
        detailContainer.innerHTML = "<p>Error al cargar los detalles.</p>";
    }
}

async function fetchPokemonDescription(pokemonId) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const data = await res.json();
        return data.flavor_text_entries.find(entry => entry.language.name === 'es').flavor_text; // Descripción en español
    } catch (error) {
        return "Descripción no disponible.";
    }
}

function getPokemonAbilities(pokemon) {
    return pokemon.abilities.map(ability => ability.ability.name); // Devuelve un array con los nombres de las habilidades
}

async function fetchEvolutionChainId(speciesUrl) {
    try {
        const res = await fetch(speciesUrl);
        const data = await res.json();
        return data.evolution_chain.url.split('/').slice(-2, -1)[0]; // Extraer el ID de la cadena de evolución
    } catch (error) {
        return null;
    }
}

async function fetchEvolutionChain(chainId) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${chainId}`);
        const data = await res.json();
        return extractEvolutions(data.chain); // Extraer evoluciones
    } catch (error) {
        return ["Evoluciones no disponibles."];
    }
}

function extractEvolutions(chain) {
    const evolutions = [];
    let current = chain;

    while (current) {
        evolutions.push(current.species.name);
        current = current.evolves_to[0]; // Solo toma la primera evolución
    }

    return evolutions;
}

// Llamar a la función con el nombre del Pokémon que deseas mostrar
fetchPokemonDetail(); // Cambia 'pikachu' por el nombre o ID del Pokémon que desees
