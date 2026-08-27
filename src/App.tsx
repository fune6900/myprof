import { useMemo } from 'react';
import { DiagonalStage, type StageSection } from './components/DiagonalStage';
import { PlainStage } from './components/PlainStage';
import { NeonGrid } from './components/NeonGrid';
import { SectionIndicator } from './ui-component/SectionIndicator';
import { SiteHeader } from './ui-component/SiteHeader';
import { Opening } from './ui-component/Opening';
import { CursorFollower } from './ui-component/CursorFollower';
import ScrollComponent from './ui-component/ScrollComponent/ScrollComponent';
import { useSectionNavigator } from './hooks/useSectionNavigator';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Helo } from './components/helo';
import { About } from './components/about';
import { Prof } from './components/prof';
import { Skill } from './components/skill';
import { Projects } from './components/projects';

/** hash とアンカーリンクの対象。並び順がそのまま画面の並び順になる */
const SECTION_IDS = ['hero', 'about', 'profile', 'skills', 'projects'] as const;

/**
 * 斜め展開に切り替える下限。
 * スマホでスクロールを横取りすると慣性スクロールと競合して操作しづらいので、
 * 狭い画面では普通の縦スクロールに任せる。
 */
const DIAGONAL_QUERY = '(min-width: 768px)';

function App() {
  const hijack = useMediaQuery(DIAGONAL_QUERY);
  const navigator = useSectionNavigator(SECTION_IDS, hijack);
  const { goTo, activeIndex } = navigator;

  const sections = useMemo<StageSection[]>(
    () => [
      { id: 'hero', label: 'Home', content: <Helo onAdvance={() => goTo(1)} /> },
      { id: 'about', label: 'About', content: <About /> },
      { id: 'profile', label: 'Profile', content: <Prof /> },
      { id: 'skills', label: 'Skills', content: <Skill /> },
      { id: 'projects', label: 'Projects', content: <Projects /> },
    ],
    [goTo],
  );

  return (
    <div className="dotgothic16">
      <NeonGrid navigator={navigator} />
      <SectionIndicator sections={sections} navigator={navigator} />
      <SiteHeader sections={sections} navigator={navigator} />
      <ScrollComponent onBackToTop={() => goTo(0)} atTop={activeIndex === 0} />
      <CursorFollower />
      <Opening />
      {hijack ? (
        <DiagonalStage sections={sections} navigator={navigator} />
      ) : (
        <PlainStage sections={sections} navigator={navigator} />
      )}
    </div>
  );
}

export default App;
