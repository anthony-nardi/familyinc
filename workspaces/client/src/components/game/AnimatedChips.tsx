
import { constSelector, useRecoilValue } from "recoil";
import { CurrentLobbyState } from "@components/game/states";
import { useState, useEffect, useRef } from "react";
import Chip from "./Chip";
import styled from 'styled-components'
import { CSSTransition } from 'react-transition-group';

const AnimatedChip = styled.div`
  position: absolute !important;
  @keyframes slidein {
    from {transform: translateX(480px)} 
    to{transform: translateX(40px)} 
  }
  animation:slidein 10s;
`

function getStolenChips(lastPlayer, allChips, clients) {


  const chipsToSteal: any[] = []

  for (let player in allChips) {
    if (player !== lastPlayer) {
      for (let chipValue in allChips[player]) {
        if (allChips[lastPlayer] && allChips[lastPlayer][chipValue]) {

          const userNameOfPlayerToStealFrom = clients[player].userName;
          console.log(`.chips-${userNameOfPlayerToStealFrom} .chip-image-${chipValue}`)
          debugger
          const chipImagesToSteal = document.querySelectorAll(`.chips-${userNameOfPlayerToStealFrom} .chip-image-${chipValue}`)
          console.log(chipImagesToSteal)

          chipImagesToSteal.forEach(chipImageElement => {
            const boundingClientRect = chipImageElement.getBoundingClientRect()
            chipsToSteal.push({
              x: boundingClientRect.x,
              y: boundingClientRect.y,
              element: chipImageElement
            })
          })
        }
      }
    }
  }

  return chipsToSteal

}

export default function Game() {
  const { chipsHeld, currentPlayer, clients } = useRecoilValue(CurrentLobbyState)!;
  const lastChipsHeld = useRef(chipsHeld)
  const lastPlayer = useRef(currentPlayer)
  const nodeRef = useRef()


  useEffect(() => {
    debugger
    // console.log(lastChipsHeld.current !== chipsHeld)
    // console.log(chipsHeld)
    if (!lastPlayer.current) {
      lastPlayer.current = currentPlayer
    }

    if (currentPlayer !== lastPlayer.current && currentPlayer && lastPlayer.current) {

      console.log(`Current Player: ${currentPlayer}. Last Player: ${lastPlayer.current}`)
      // const currentPlayerChipElements = document.querySelectorAll(`.chips-${clients[currentPlayer].userName} > span`)
      // const lastPlayerChipElements = document.querySelectorAll(`.chips-${clients[lastPlayer.current].userName} > span`)
      // console.log(lastPlayerChipElements)
      console.log('m')
      const stolenChips = getStolenChips(lastPlayer.current, chipsHeld, clients)
      console.log(stolenChips)
      lastPlayer.current = currentPlayer

    }
  }, [chipsHeld, currentPlayer])


  return (

    <CSSTransition ref={nodeRef} in={true} timeout={5000}>
      <AnimatedChip ref={nodeRef}>
        <Chip chipCount={1} chipValue={'1'} />
      </AnimatedChip>
    </CSSTransition>
  );
}
