import '../style/hero.css'
import hero_image from "../assets/hero_image.svg";


function Hero() {
  return (
    <section className='hero'>
      <div className="container">
        <div className="hero__content">
          <div className="hero__subtitle">Saturday, September 13, 2025, 12:55</div>
          <div className="hero__title">Hello <span className="highlight">Uroljon Khidirboev</span> , welcome back! Impact is created by your actions!</div>
          <div className="hero__text">This page is your personal workspace. Here you can see your tasks and personal notes, as well as all your favorites.</div>
        </div>
        <div className="hero__image">
          <img className="header__logo" src={hero_image} alt="" />
        </div>
      </div>
    </section>
  )
}

export default Hero
