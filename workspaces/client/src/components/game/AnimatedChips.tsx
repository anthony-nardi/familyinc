
import { useRecoilValue } from "recoil";
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

export default function Game() {
  const { chipsHeld, currentPlayer, clients } = useRecoilValue(CurrentLobbyState)!;
  const lastChipsHeld = useRef(chipsHeld)
  const lastPlayer = useRef(currentPlayer)
  const nodeRef = useRef()

  useEffect(() => {
    // console.log(lastChipsHeld.current !== chipsHeld)
    // console.log(chipsHeld)
    if (currentPlayer !== lastPlayer.current && clients[currentPlayer]) {
      console.log(`Player changed: ${currentPlayer}. Old player is: ${lastPlayer.current}`)


      console.log(`chips-${clients[currentPlayer].userName}`)

      console.log(document.getElementsByClassName(`chips-${clients[currentPlayer].userName}`))
      console.log(document.getElementsByClassName(`chips-${clients[lastPlayer.current].userName}`))

      const currentPlayerChipElements = document.querySelectorAll(`.chips-${clients[currentPlayer].userName} > span`)
      const lastPlayerChipElements = document.querySelectorAll(`.chips-${clients[currentPlayer].userName} > span`)

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
