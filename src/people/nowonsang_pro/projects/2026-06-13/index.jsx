// Hub 카드 진입점 — 루트 React/Vite 번들을 공유하는 실제 플레이 가능한 게임.
// (중첩 npm 프로젝트 금지 규칙에 따라 자체 package.json / node_modules / vite 설정 없이
//  루트 의존성만 사용한다. 엔진은 순수 .js 모듈, 셸은 .jsx 컴포넌트.)
import Game from './components/Game.jsx';

export default function VoxelRaycastGame() {
  return <Game />;
}
