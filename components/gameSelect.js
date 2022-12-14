import PriceDisplay from './priceDisplay';
import { currencies } from '../data/currencies';
import { useRef } from 'react';
import ExchangeRate from './exchangeRate';

export default function GameSelect({
  hltbOptions,
  steamOptions,
  price,
  getPrice,
  setSteamImage,
  setHltbSelected,
  currency,
}) {
  function updateCatalogue() {
    fetch(`/api/steam/allGames`);
  }

  const steamGame = useRef();
  return (
    <div className="p-2 bg-neutral-800 text-neutral-400 flex flex-col-reverse gap-3">
      <label className="flex flex-col font-mono text-sm">
        Currency ({currencies.length})
        <select
          ref={currency}
          onChange={(event) => {
            getPrice(
              steamOptions[steamGame.current.value].appid,
              event.target.value.slice(0, 2),
            );
          }}
          className="bg-transparent border-b-2 border-neutral-400 text-neutral-50 font-sans text-base"
          defaultValue="USD"
        >
          {currencies.map((currency, index) => (
            <option className="bg-neutral-900" key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col font-mono text-sm">
        How long to beat{hltbOptions ? ` (${hltbOptions.length})` : null}:
        <select
          onChange={(event) => {
            setHltbSelected(hltbOptions[event.target.value]);
          }}
          className="bg-transparent border-b-2 border-neutral-400 text-neutral-50 font-sans text-base"
        >
          {hltbOptions
            ? hltbOptions.map((game, index) => (
                <option className="bg-neutral-900" key={game.id} value={index}>
                  {game.name} ({game.id})
                </option>
              ))
            : null}
        </select>
      </label>
      <div className="flex justify-end">
        <button
          onClick={updateCatalogue}
          className="bg-neutral-600 rounded-lg text-neutral-300 p-1 px-3 w-fit"
        >
          update steam games catalogue
        </button>
      </div>
      <label className="flex flex-col font-mono text-sm">
        Steam{steamOptions ? ` (${steamOptions.length})` : null}:
        <select
          ref={steamGame}
          onChange={(event) => {
            getPrice(
              steamOptions[event.target.value].appid,
              currency.current.value.slice(0, 2),
            );
            setSteamImage(steamOptions[event.target.value].appid);
          }}
          className="bg-transparent border-b-2 border-neutral-400 text-neutral-50 font-sans text-base"
        >
          {steamOptions
            ? steamOptions.map((game, index) => (
                <option
                  className="bg-neutral-900"
                  key={game.appid}
                  value={index}
                >
                  {game.name} ({game.appid})
                </option>
              ))
            : null}
        </select>
      </label>
      <ExchangeRate price={price} exchangeCurr={currency} />
      <PriceDisplay price={price} />
    </div>
  );
}
