import { useMemo } from 'react';
import { DiagonalStage, type StageSection } from './components/DiagonalStage';
import { SectionIndicator } from './ui-component/SectionIndicator';
import ScrollComponent from './ui-component/ScrollComponent/ScrollComponent';
import { useDiagonalNavigator } from './hooks/useDiagonalNavigator';
import { Helo } from './components/helo';
import { Prof } from './components/prof';
import { Skill } from './components/skill';
import { Works } from './components/works';

/** hash とアンカーリンクの対象。並び順がそのまま画面の並び順になる */
const SECTION_IDS = ['hero', 'profile', 'skills', 'works'] as const;

function App() {
  const navigator = useDiagonalNavigator(SECTION_IDS);
  const { goTo, activeIndex } = navigator;

  const sections = useMemo<StageSection[]>(
    () => [
      { id: 'hero', label: 'Home', content: <Helo onAdvance={() => goTo(1)} /> },
      { id: 'profile', label: 'Profile', content: <Prof /> },
      { id: 'skills', label: 'Skills', content: <Skill /> },
      { id: 'works', label: 'Works', content: <Works /> },
    ],
    [goTo],
  );

  return (
    <div className="dotgothic16">
      <SectionIndicator sections={sections} navigator={navigator} />
      <ScrollComponent onBackToTop={() => goTo(0)} disabled={activeIndex === 0} />
      <DiagonalStage sections={sections} navigator={navigator} />
    </div>
  );
}

export default App;
