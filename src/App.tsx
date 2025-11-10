import ScrollComponent from './ui-component/ScrollComponent/ScrollComponent';
import {Helo} from './components/helo';
import { Skill } from './components/skill';
import {Works} from './components/works';
import { Prof } from './components/prof';
import { ScrollProgressBar } from './ui-component/ScrollProgressBarComponent';
import './index.css';

function App() {

  return (
    <div className="dotgothic16">
      <ScrollProgressBar />
      <ScrollComponent />
      <Helo />
      <Prof />
      <Skill />
      <Works />
    </div>
  )
}

export default App
