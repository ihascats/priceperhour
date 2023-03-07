import { useEffect, useRef, useState } from 'react';
import GameSelect from '../components/gameSelect';
import Icons from '../components/icons';
import Platforms from '../components/platforms';
import TimesToBeat from '../components/timesToBeat';
import Head from 'next/head';

export default function Steam() {
  async function getPrice(appid, currency) {
    // Try to fetch the price data from the Steam API
    try {
      // Set loading to true
      setIsLoading(true);

      // Fetch the price data, passing the app ID and currency to the API
      const response = await fetch(
        `/api/steam/${appid}?currency=${
          currency === 'EU' || currency === 'eu' ? 'eur' : currency
        }`,
      );

      // Convert the response to JSON
      const json = await response.json();

      // Set the state for the price data
      setPrice(json);

      // Set loading to false
      setIsLoading(false);
    } catch (error) {
      // If an error occurs, set the price data to default values and set loading to false
      const obj = {
        currency: 'EUR',
        initial: 0,
        final: 0,
        discount_percent: 0,
        initial_formatted: '',
        final_formatted: 'Free',
      };
      setPrice(obj);
      setIsLoading(false);
    }
  }

  async function getTitles(currency) {
    // If the length of the search term is less than 3 characters, exit the function
    if (gameTitle.current.value.length < 3) return;

    // Set loading to true
    setIsLoading(true);

    // Fetch game data from the HLTB API using the search term
    const hltbFetch = await fetch(`/api/hltb/${gameTitle.current.value}`);

    // Filter the Steam games array to find matches for the search term
    const steamGameFilter = listSteamGames.filter((obj) => {
      return obj.name
        .toLowerCase()
        .includes(gameTitle.current.value.toLowerCase());
    });

    // If no matches are found, exit the function
    if (steamGameFilter.length === 0) {
      setIsLoading(false);
      return;
    }

    // Convert the HLTB data to JSON
    const hltbJson = await hltbFetch.json();

    // Sort the HLTB data alphabetically by game title
    hltbJson.response.sort((a, b) => a.name.length - b.name.length);

    // Set the state for the HLTB options and selected game
    setHltbOptions(hltbJson.response);
    setHltbSelected(hltbJson.response[0]);

    // Sort the filtered Steam games alphabetically by game title
    steamGameFilter.sort((a, b) => a.name.length - b.name.length);

    // Set the state for the Steam options, fetch the price data, and set the image for the selected game
    setSteamOptions(steamGameFilter);
    setSteamImage(steamGameFilter[0].appid);
    getPrice(steamGameFilter[0].appid, currency);

    // Set loading to false
    setIsLoading(false);
  }

  const [price, setPrice] = useState();
  const [hltbOptions, setHltbOptions] = useState();
  const [hltbSelected, setHltbSelected] = useState();
  const [steamOptions, setSteamOptions] = useState();
  const [steamImage, setSteamImage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [listSteamGames, setListSteamGames] = useState();
  const gameTitle = useRef();
  const icons = Icons();
  const currency = useRef();

  async function updateCatalogue() {
    // Get list of steam games
    const response = await fetch(`/api/steam/allGames`);
    const json = await response.json();
    return json;
  }

  useEffect(() => {
    setIsLoading(true);

    updateCatalogue().then((response) => {
      setListSteamGames(response);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="flex justify-center">
      <Head>
        <title>Price Per Hour</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {isLoading ? (
        <div className="max-w-[500px] top-0 min-h-screen w-full bg-neutral-600/20 backdrop-blur-md border-x-2 border-neutral-900 flex flex-col text-neutral-400 justify-center items-center fixed">
          {icons.loading}
          <p className="font-mono">Loading game data..</p>
        </div>
      ) : null}
      <div className="flex flex-col-reverse w-full max-w-[500px] min-h-screen bg-neutral-800 border-x-2 border-neutral-900">
        <div className="flex bg-neutral-900 p-2 gap-2 items-center justify-center sticky bottom-0">
          <input
            ref={gameTitle}
            placeholder="At least 3 letters"
            className="border-b-2 border-neutral-400 text-neutral-400 bg-transparent outline-offset-4 px-1 w-full"
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                if (isLoading) return;
                event.preventDefault();
                getTitles(currency.current.value.slice(0, 2));
              }
            }}
          ></input>
          <button
            onClick={() => {
              if (isLoading) return;
              getTitles(currency.current.value.slice(0, 2));
            }}
            className="text-neutral-400"
          >
            {icons.find}
          </button>
        </div>
        <GameSelect
          hltbOptions={hltbOptions}
          steamOptions={steamOptions}
          price={price}
          getPrice={getPrice}
          setSteamImage={setSteamImage}
          setHltbSelected={setHltbSelected}
          currency={currency}
        />
        {hltbSelected && price ? (
          <TimesToBeat hltbSelected={hltbSelected} price={price} />
        ) : null}
        <Platforms hltbSelected={hltbSelected} />
        {steamImage ? (
          <div className="bg-neutral-800 font-mono text-neutral-50 p-2">
            <p>Steam Image:</p>
            <div className="max-h-[230px] grid justify-center bg-neutral-800">
              <img
                alt=""
                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${steamImage}/header.jpg`}
                className=" bg-zinc-800 w-full"
              ></img>
            </div>
          </div>
        ) : null}
        {hltbSelected ? (
          <div className="bg-neutral-800 font-mono text-neutral-50 p-2">
            <p>How Long To Beat Image:</p>
            <div className="max-h-[230px] grid justify-center bg-neutral-800">
              <img
                alt=""
                src={hltbSelected.imageUrl}
                className="bg-zinc-800 max-h-[230px]"
              ></img>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
