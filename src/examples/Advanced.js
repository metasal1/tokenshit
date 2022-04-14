import React, { useState, useMemo, useRef } from 'react'
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
  },
]

function Advanced () {
  const [currentIndex, setCurrentIndex] = useState(db.length - 1)
  const [lastDirection, setLastDirection] = useState()
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex)

  const childRefs = useMemo(
    () =>
      Array(db.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  )

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val)
    currentIndexRef.current = val
  }

  const canGoBack = currentIndex < db.length - 1

  const canSwipe = currentIndex >= 0

  // set last direction and decrease current index
  const swiped = (direction, nameToDelete, index) => {
    setLastDirection(direction)
    updateCurrentIndex(index - 1)
  }

  const outOfFrame = (name, idx) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current)
    // handle the case in which go back is pressed before card goes outOfFrame
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard()
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  }

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < db.length) {
      await childRefs[currentIndex].current.swipe(dir) // Swipe the card!
    }
  }

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return
    const newIndex = currentIndex + 1
    updateCurrentIndex(newIndex)
    await childRefs[newIndex].current.restoreCard()
  }

  return (
    <div>
      <link
        href='https://fonts.googleapis.com/css?family=Damion&display=swap'
        rel='stylesheet'
      />
      <link
        href='https://fonts.googleapis.com/css?family=Alatsi&display=swap'
        rel='stylesheet'
      />
      <h1>TokenShit.xyz</h1>
      <h2>Is this token <span role="img" aria-label="Hit">🎯</span> or <span role="img" aria-label="Shit">💩</span></h2>
      <div className='cardContainer'>
        {db.map((character, index) => (
          <TinderCard
            ref={childRefs[index]}
            className='swipe'
            key={character.name}
            onSwipe={(dir) => swiped(dir, character.name, index)}
            onCardLeftScreen={() => outOfFrame(character.name, index)}
          >
            <div
              style={{ backgroundImage: 'url(' + character.logoURI + ')' }}
              className='card'
            >
              <h3>{character.name} | {character.symbol}</h3>
            </div>
            {character.description}
          </TinderCard>
        ))}
      </div>
      <div className='buttons'>
        <button style={{ backgroundColor: !canSwipe && '#c3c4d3' }} onClick={() => swipe('left')}>Swipe left!</button>
        <button style={{ backgroundColor: !canGoBack && '#c3c4d3' }} onClick={() => goBack()}>Undo swipe!</button>
        <button style={{ backgroundColor: !canSwipe && '#c3c4d3' }} onClick={() => swipe('right')}>Swipe right!</button>
      </div>
      {lastDirection ? (
        <h2 key={lastDirection} className='infoText'>
          You swiped {lastDirection}
        </h2>
      ) : (
        <h2 className='infoText'>
          Swipe a card or press a button to get Restore Card button visible!
        </h2>
      )}
    </div>
  )
}

export default Advanced
