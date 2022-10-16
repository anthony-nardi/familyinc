import type { NextPage } from 'next';
import GameManager from '@components/game/GameManager';


const Page: NextPage = () => {
  return (
    <div className="container mt-4">
      <GameManager/>
    </div>
  );
};

export default Page;
