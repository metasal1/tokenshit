/* eslint-disable jsx-a11y/heading-has-content */
import React, { useState } from 'react'
// import TinderCard from '../react-tinder-card/index'
import TinderCard from 'react-tinder-card'

const db = [
  {
    "chainId": 101,
    "address": "3SghkPdBSrpF9bzdAy5LwR4nGgFbqNcC6ZSq8vtZdj91",
    "symbol": "EV1",
    "name": "EveryOne Coin",
    "decimals": 9,
    "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3SghkPdBSrpF9bzdAy5LwR4nGgFbqNcC6ZSq8vtZdj91/logo.png",
    "tags": [
      "currency"
    ],
    "extensions": {
      "facebook": "https://facebook.com/everyonecoin",
      "twitter": "https://twitter.com/everyonecoin",
      "website": "https://everyonecoin.com/"
    }
  },
  {
    "chainId": 101,
    "address": "NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s",
    "symbol": "YAKU",
    "name": "Yaku",
    "decimals": 0,
    "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EK58dp4mxsKwwuySWQW826i3fwcvUK69jPph22VUcd2H/logo.png",
    "tags": [
      "utility-token"
    ]
  },
  {
    "chainId": 101,
    "address": "CbNYA9n3927uXUukee2Hf4tm3xxkffJPPZvGazc2EAH1",
    "symbol": "agEUR",
    "name": "agEUR (Portal)",
    "decimals": 8,
    "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/CbNYA9n3927uXUukee2Hf4tm3xxkffJPPZvGazc2EAH1/logo.png",
    "tags": [
      "ethereum",
      "wrapped",
      "wormhole"
    ],
    "extensions": {
      "address": "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",
      "assetContract": "https://etherscan.io/address/0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",
      "bridgeContract": "https://etherscan.io/address/0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      "coingeckoId": "ageur",
      "description": "Angle is the first decentralized, capital efficient and over-collateralized stablecoin protocol",
      "discord": "https://discord.gg/z3kCpTaKMh",
      "twitter": "https://twitter.com/AngleProtocol",
      "website": "https://www.angle.money"
    }
  },
  {
    "chainId": 101,
    "address": "31GpPxe1SW8pn7GXimM73paD8PZyCsmVSGTLkwUAJvZ8",
    "symbol": "ANGLE",
    "name": "ANGLE (Portal)",
    "decimals": 8,
    "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/31GpPxe1SW8pn7GXimM73paD8PZyCsmVSGTLkwUAJvZ8/logo.svg",
    "tags": [
      "ethereum",
      "wrapped",
      "wormhole"
    ],
    "extensions": {
      "address": "0x31429d1856ad1377a8a0079410b297e1a9e214c2",
      "assetContract": "https://etherscan.io/address/0x31429d1856ad1377a8a0079410b297e1a9e214c2",
      "bridgeContract": "https://etherscan.io/address/0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      "coingeckoId": "angle-protocol",
      "description": "Angle is the first decentralized, capital efficient and over-collateralized stablecoin protocol",
      "discord": "https://discord.gg/z3kCpTaKMh",
      "twitter": "https://twitter.com/AngleProtocol",
      "website": "https://www.angle.money"
    }
  },
  {
    "chainId": 101,
    "address": "G6nZYEvhwFxxnp1KZr1v9igXtipuB5zL6oDGNMRZqF3q",
    "symbol": "BAD",
    "name": "EA Bad",
    "decimals": 9,
    "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/G6nZYEvhwFxxnp1KZr1v9igXtipuB5zL6oDGNMRZqF3q/EABadlogo.PNG",
    "tags": [
      "utility-token",
      "community-token",
      "meme-token"
    ],
    "extensions": {
      "twitter": "https://twitter.com/EABadtoken"
    }
  }
]

function Simple () {
  const characters = db
  const [lastDirection, setLastDirection] = useState()

  const swiped = (direction, nameToDelete) => {
    console.log('removing: ' + nameToDelete)
    setLastDirection(direction)
  }

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!')
  }

  return (
    <div>
      <link href='https://fonts.googleapis.com/css?family=Damion&display=swap' rel='stylesheet' />
      <link href='https://fonts.googleapis.com/css?family=Alatsi&display=swap' rel='stylesheet' />
      <h1>Token Shit.xyz</h1>
      <div className='cardContainer'>
        {characters.map((character) =>
          <TinderCard className='swipe' key={character.name} onSwipe={(dir) => swiped(dir, character.name)} onCardLeftScreen={() => outOfFrame(character.name)}>
            <div style={{ backgroundImage: 'url(' + character.url + ')' }} className='card'>
              <h3>{character.name}</h3>
            </div>
          </TinderCard>
        )}
      </div>
      {lastDirection ? <h2 className='infoText'>You swiped {lastDirection}</h2> : <h2 className='infoText' />}
    </div>
  )
}

export default Simple
