import ScrollComponent from './ui-component/ScrollComponent/ScrollComponent';
import fune from './assets/fune.png'; 
import SocialLinks from './ui-component/SocialLinks/SocialLinks';

function App() {

  return (
    <div>
      {/* Hero Section */}
      <ScrollComponent />
      <section className="py-16 text-center border-neon-b border-neon-green">
        <img src={fune} 
          alt="Riku Funagayama Icon"
          className="mx-auto w-32 h-32 rounded-full mb-4 border-4 border-neon-pink"
        />
        <h1 className="text-4xl font-bold text-neon-white neon-glow-soft">
          Riku Funagayama
        </h1>
        <h1 className="text-3xl mt-4 text-neon-white">
          Stand Out Fit In （はみ出して、なじめ）
        </h1>
        <SocialLinks />
      </section>
    </div>
  )
}

export default App
