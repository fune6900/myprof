import { useMemo } from 'react';
import { TunnelStage, type StageSection } from './components/TunnelStage';
import { PlainStage } from './components/PlainStage';
import { SynthwaveSky } from './scene/SynthwaveSky';
import { GridFloor } from './scene/GridFloor';
import { CyberCity } from './city/CyberCity';
import { SectionIndicator } from './ui-component/SectionIndicator';
import { SiteHeader } from './ui-component/SiteHeader';
import { Opening } from './ui-component/Opening';
import { CursorFollower } from './ui-component/CursorFollower';
import { Equalizer } from './ui-component/Equalizer';
import ScrollComponent from './ui-component/ScrollComponent/ScrollComponent';
import { useSectionNavigator } from './hooks/useSectionNavigator';
import { NavigatorContext } from './hooks/navigatorContext';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Helo } from './components/helo';
import { About } from './components/about';
import { Prof } from './components/prof';
import { Stack } from './components/stack';
import { Projects } from './components/projects';
import { Blog } from './components/blog';
import { Contact } from './components/contact';

/** hash とアンカーリンクの対象。並び順がそのまま画面の並び順になる */
const SECTION_IDS = [
  'hero',
  'about',
  'profile',
  'stack',
  'projects',
  'blog',
  'contact',
] as const;

/**
 * 奥行き移動に切り替える下限。
 * スマホでスクロールを横取りすると慣性スクロールと競合して操作しづらいので、
 * 狭い画面では普通の縦スクロールに任せる。
 */
const TUNNEL_QUERY = '(min-width: 768px)';

function App() {
  const hijack = useMediaQuery(TUNNEL_QUERY);
  const navigator = useSectionNavigator(SECTION_IDS, hijack);
  const { goTo, activeIndex } = navigator;

  const sections = useMemo<StageSection[]>(
    () => [
      { id: 'hero', label: 'Home', content: <Helo onAdvance={() => goTo(1)} /> },
      { id: 'about', label: 'About', content: <About /> },
      { id: 'profile', label: 'Profile', content: <Prof /> },
      { id: 'stack', label: 'Stack', content: <Stack /> },
      { id: 'projects', label: 'Projects', content: <Projects /> },
      { id: 'blog', label: 'Blog', content: <Blog /> },
      { id: 'contact', label: 'Contact', content: <Contact /> },
    ],
    [goTo],
  );

  return (
    // 奥のセクションが ScrollScene で進行度を拾えるように配っておく
    <NavigatorContext.Provider value={navigator}>
      <div className="dotgothic16">
        {/* 地平線より上（ほぼ静止画） → 床（canvas） → 街（3D）の順に重ねる */}
        <SynthwaveSky />
        <GridFloor navigator={navigator} />
        <CyberCity navigator={navigator} sectionCount={SECTION_IDS.length} />
        <Equalizer navigator={navigator} />
        <SectionIndicator sections={sections} navigator={navigator} />
        <SiteHeader sections={sections} navigator={navigator} />
        <ScrollComponent onBackToTop={() => goTo(0)} atTop={activeIndex === 0} />
        <CursorFollower />
        <Opening />
        {hijack ? (
          <TunnelStage sections={sections} navigator={navigator} />
        ) : (
          <PlainStage sections={sections} navigator={navigator} />
        )}

        {/* すべての上に重ねる。下の内容をぼかして screen で足し戻すだけ */}
        <div className="scene-bloom" aria-hidden="true" />
      </div>
    </NavigatorContext.Provider>
  );
}

export default App;
