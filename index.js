import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://pokeapi.co/api/v2";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/team", async (req, res) => {
    console.log(req.body);

    const name = req.body.name;
    const type = req.body.type;
    const shiny = req.body.shiny;

    // builds the pokemon team based on what type the user chose
    try {
        let pokemonList;

        // gets the pokemon list
        if (type === "random") {
            const response = await axios.get(API_URL + "/pokemon?limit=100000&offset=0");
            pokemonList = response.data.results;
        } else {
            const response = await axios.get(API_URL + "/type/" + type);
            pokemonList = response.data.pokemon;
        }

        const team = [];

        // keeps picking until there are 6 pokemon
        while (team.length < 6) {
            const randomIndex = Math.floor(Math.random() * pokemonList.length);

            let pokemonName;

            if (type === "random") {
                pokemonName = pokemonList[randomIndex].name;
            } else {
                pokemonName = pokemonList[randomIndex].pokemon.name;
            }

            pokemonList.splice(randomIndex, 1);

            const response = await axios.get(API_URL + "/pokemon/" + pokemonName);

            const pokemon = response.data;

            // only adds regular pokemon that have a picture
            if (pokemon.id <= 1025 && pokemon.sprites.front_default !== null) {
                team.push(pokemon);
            }
        }

        // randomly chooses a shiny pokemon if the user wants
        let shinyPokemon;

        if (shiny === "yes") {
            const shinyIndex = Math.floor(Math.random() * team.length);
            shinyPokemon = team[shinyIndex].name;
        }

        res.render("index.ejs", {
            team: team,
            name: name,
            shinyPokemon: shinyPokemon,
        });
    } catch (error) {
        console.error("Failed to make request:", error.message);

        res.render("index.ejs", {
            error: "Could not build your team. Please try again.",
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});