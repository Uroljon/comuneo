import Hero from "../component/Hero";
import Aside from "../component/Aside";

function HomePage() {
  return (
    <div className="layout">
      <Aside />
      <main >
        <Hero />
      </main>
    </div>
  )
}

export default HomePage;