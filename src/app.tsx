import { useEffect, useState } from 'preact/hooks'
import { StarBackground } from './StarBackground'
import {
  fetchGamesFromSupabase,
  fetchNewsFromSupabase,
  saveNewsletterSubscriber,
  saveOrder,
  isSupabaseConfigured
} from './lib/supabase'
import './app.css'

interface Game {
  id: string
  title: string
  genre: string
  category: string
  platforms: string[]
  rating: number
  price: number
  originalPrice: number
  discount: number
  image: string
}

interface NewsItem {
  id: string
  title: string
  category: string
  date: string
  excerpt: string
  image: string
}

const DEFAULT_GAMES: Game[] = [
  {
    id: 'g1',
    title: 'Elden Ring: Shadow of the Erdtree',
    genre: 'Acción / RPG',
    category: 'RPG',
    platforms: ['PC', 'PS5', 'XSX'],
    rating: 4.9,
    price: 39.99,
    originalPrice: 49.99,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'g2',
    title: 'Cyberpunk 2077: Phantom Liberty',
    genre: 'Mundo Abierto / Sci-Fi',
    category: 'Sci-Fi',
    platforms: ['PC', 'PS5', 'XSX'],
    rating: 4.8,
    price: 29.99,
    originalPrice: 59.99,
    discount: 50,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'g3',
    title: 'Helldivers 2 - Galactic Edition',
    genre: 'Shooter Cooperativo',
    category: 'Shooter',
    platforms: ['PC', 'PS5'],
    rating: 4.7,
    price: 31.99,
    originalPrice: 39.99,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'g4',
    title: 'Hollow Knight: Silksong',
    genre: 'Metroidvania / Aventura',
    category: 'Aventura',
    platforms: ['PC', 'Switch', 'PS5', 'XSX'],
    rating: 5.0,
    price: 19.99,
    originalPrice: 24.99,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'g5',
    title: 'Final Fantasy VII Rebirth',
    genre: 'JRPG / Fantasía',
    category: 'RPG',
    platforms: ['PS5', 'PC'],
    rating: 4.9,
    price: 48.99,
    originalPrice: 69.99,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'g6',
    title: 'Star Wars Jedi: Survivor',
    genre: 'Acción / Aventura Espacial',
    category: 'Sci-Fi',
    platforms: ['PC', 'PS5', 'XSX'],
    rating: 4.6,
    price: 27.99,
    originalPrice: 69.99,
    discount: 60,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'g7',
    title: 'DOOM: The Dark Ages',
    genre: 'Fast-Paced FPS',
    category: 'Shooter',
    platforms: ['PC', 'PS5', 'XSX'],
    rating: 4.9,
    price: 59.99,
    originalPrice: 69.99,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'g8',
    title: 'Black Myth: Wukong',
    genre: 'Acción / Mitología',
    category: 'Acción',
    platforms: ['PC', 'PS5'],
    rating: 4.8,
    price: 49.99,
    originalPrice: 59.99,
    discount: 17,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=700&q=80'
  }
]

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Nueva actualización masiva de Unreal Engine 5.5 llega con trazado de luces en tiempo real ultraoptimizado',
    category: 'Tecnología',
    date: '17 Noviembre 2026',
    excerpt: 'Los desarrolladores celebran el nuevo rendimiento en consolas y PC que promete 60 FPS estables con máxima fidelidad visual y mundos expansivos.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'n2',
    title: 'PlayStation y Xbox confirman los grandes títulos exclusivos que llegarán a inicios del próximo año',
    category: 'Industria',
    date: '15 Noviembre 2026',
    excerpt: 'Desde nuevas sagas galácticas hasta secuelas esperadas, ambas compañías adelantan fechas de lanzamiento y compatibilidad cruzada.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'n3',
    title: 'Torneo Mundial de Esports reparte bolsa histórica de 15 millones de dólares en la gran final',
    category: 'Esports',
    date: '12 Noviembre 2026',
    excerpt: 'Más de 3.2 millones de espectadores simultáneos siguieron la intensa final que coronó a los campeones mundiales de shooters tácticos.',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=700&q=80'
  }
]

const CATEGORIES = ['Todos', 'RPG', 'Sci-Fi', 'Shooter', 'Aventura', 'Acción']

export function App() {
  const [games, setGames] = useState<Game[]>(DEFAULT_GAMES)
  const [news, setNews] = useState<NewsItem[]>(DEFAULT_NEWS)
  const [isLiveConnected, setIsLiveConnected] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [cart, setCart] = useState<Game[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [emailSubscribed, setEmailSubscribed] = useState(false)
  const [emailInput, setEmailInput] = useState('')

  // Cargar datos desde Supabase
  useEffect(() => {
    async function loadRemoteData() {
      if (!isSupabaseConfigured) return

      try {
        const [remoteGames, remoteNews] = await Promise.all([
          fetchGamesFromSupabase(),
          fetchNewsFromSupabase()
        ])

        if (remoteGames && remoteGames.length > 0) {
          setGames(
            remoteGames.map((g) => ({
              id: g.id,
              title: g.title,
              genre: g.genre,
              category: g.category,
              platforms: g.platforms || [],
              rating: Number(g.rating),
              price: Number(g.price),
              originalPrice: Number(g.original_price),
              discount: Number(g.discount),
              image: g.image_url
            }))
          )
          setIsLiveConnected(true)
        }

        if (remoteNews && remoteNews.length > 0) {
          setNews(
            remoteNews.map((n) => ({
              id: n.id,
              title: n.title,
              category: n.category,
              date: n.published_date,
              excerpt: n.excerpt,
              image: n.image_url
            }))
          )
        }
      } catch (err) {
        console.error('Error al sincronizar con Supabase:', err)
      }
    }

    loadRemoteData()
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => {
      setToast(null)
    }, 3200)
  }

  const addToCart = (game: Game) => {
    if (cart.some((item) => item.id === game.id)) {
      showToast(`"${game.title}" ya está en tu carrito`)
      return
    }
    setCart([...cart, game])
    showToast(`¡"${game.title}" agregado al carrito!`)
  }

  const removeFromCart = (gameId: string) => {
    setCart(cart.filter((item) => item.id !== gameId))
  }

  const handleCheckout = async () => {
    const currentCart = [...cart]
    setCart([])
    setIsCartOpen(false)
    showToast('¡Compra realizada con éxito! Disfruta tus juegos.')

    if (isSupabaseConfigured) {
      await saveOrder({
        total: cartTotal,
        items: currentCart.map((c) => ({ id: c.id, title: c.title, price: c.price }))
      })
    }
  }

  const handleNewsletterSubmit = async (e: Event) => {
    e.preventDefault()
    if (emailInput.trim()) {
      const email = emailInput.trim()
      setEmailSubscribed(true)
      showToast('¡Te has suscrito al Club VIP!')

      if (isSupabaseConfigured) {
        await saveNewsletterSubscriber(email)
      }
    }
  }

  const filteredGames =
    selectedCategory === 'Todos'
      ? games
      : games.filter((g) => g.category === selectedCategory)

  const cartTotal = cart.reduce((acc, curr) => acc + curr.price, 0)

  return (
    <>
      {/* Fondo de estrellas infinito fijo */}
      <StarBackground />

      {/* Barra de navegación superior */}
      <header className="navbar">
        <a href="#" className="nav-brand">
          <div className="brand-icon">🎮</div>
          <div className="brand-name">
            NEXUS<span>GAMES</span>
            <span className="brand-badge">Store & News</span>
          </div>
        </a>

        <nav>
          <ul className="nav-menu">
            <li><a href="#catalogo" className="active">Tienda</a></li>
            <li><a href="#destacado">Destacados</a></li>
            <li><a href="#noticias">Novedades & Noticias</a></li>
            <li><a href="#club">Club VIP</a></li>
          </ul>
        </nav>

        <div className="nav-actions">
          {isLiveConnected && (
            <span
              style={{
                fontSize: '11px',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '4px 8px',
                borderRadius: '12px',
                fontWeight: 600
              }}
              title="Base de datos Supabase conectada y sincronizada"
            >
              ● Supabase DB
            </span>
          )}

          <button
            type="button"
            className="cart-button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir carrito de compras"
          >
            🛒 Carrito
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
        </div>
      </header>

      {/* Contenido principal de la tienda y novedades */}
      <main className="main-content">
        {/* Banner Hero Principal */}
        <section id="destacado" className="hero-banner">
          <div className="hero-info">
            <span className="hero-tag">🔥 Novedad de la Semana</span>
            <h1 className="hero-title">CYBER ODYSSEY 2077: NEON EDGE</h1>
            <p className="hero-desc">
              Explora una megalópolis futurista viva con trazado de rayos de próxima generación, 
              combates cinemáticos viscerales y una historia profunda con múltiples finales.
            </p>
            <div className="hero-meta">
              <div className="hero-price">
                <span className="original-price">$69.99</span>
                <span className="current-price">$41.99</span>
                <span className="discount-badge">-40%</span>
              </div>
            </div>
            <div className="hero-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  addToCart({
                    id: 'hero-1',
                    title: 'Cyber Odyssey 2077: Neon Edge',
                    genre: 'Mundo Abierto / Sci-Fi',
                    category: 'Sci-Fi',
                    platforms: ['PC', 'PS5', 'XSX'],
                    rating: 4.9,
                    price: 41.99,
                    originalPrice: 69.99,
                    discount: 40,
                    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=700&q=80'
                  })
                }
              >
                Comprar Ahora
              </button>
              <a href="#catalogo" className="btn-secondary">
                Ver Catálogo
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80"
              alt="Cyber Odyssey Preview"
              className="hero-image"
            />
          </div>
        </section>

        {/* Sección de Catálogo de Juegos */}
        <section id="catalogo">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-badge">Catálogo Exclusivo</span>
              <h2 className="section-title">🕹️ Venta de Videojuegos</h2>
            </div>
          </div>

          {/* Filtros por Categoría */}
          <div className="filter-bar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Rejilla de Juegos */}
          <div className="games-grid">
            {filteredGames.map((game) => {
              const inCart = cart.some((c) => c.id === game.id)
              return (
                <article key={game.id} className="game-card">
                  <div className="game-thumb-wrapper">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="game-thumb"
                      loading="lazy"
                    />
                    <span className="game-card-discount">-{game.discount}%</span>
                    <span className="game-card-rating">★ {game.rating.toFixed(1)}</span>
                  </div>

                  <div className="game-card-body">
                    <span className="game-card-genre">{game.genre}</span>
                    <h3 className="game-card-title">{game.title}</h3>

                    <div className="game-card-platforms">
                      {game.platforms.map((p) => (
                        <span key={p} className="platform-tag">
                          {p}
                        </span>
                      ))}
                    </div>

                    <div className="game-card-footer">
                      <div className="game-card-pricing">
                        <span className="game-card-oldprice">
                          ${game.originalPrice.toFixed(2)}
                        </span>
                        <span className="game-card-price">
                          ${game.price.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`btn-buy ${inCart ? 'in-cart' : ''}`}
                        onClick={() => addToCart(game)}
                      >
                        {inCart ? '✓ En Carrito' : '+ Agregar'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Sección de Novedades y Noticias */}
        <section id="noticias" className="news-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-badge">Última Hora</span>
              <h2 className="section-title">📰 Novedades y Noticias Gamer</h2>
            </div>
          </div>

          <div className="news-grid">
            {news.map((article) => (
              <article key={article.id} className="news-card">
                <div className="news-thumb-wrap">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="news-thumb"
                    loading="lazy"
                  />
                  <span className="news-category-badge">{article.category}</span>
                </div>
                <div className="news-content">
                  <span className="news-date">📅 {article.date}</span>
                  <h3 className="news-title">{article.title}</h3>
                  <p className="news-excerpt">{article.excerpt}</p>
                  <a href="#noticias" className="news-link">
                    Leer novedad completa →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Sección Club VIP / Newsletter */}
        <section id="club" className="vip-banner">
          <h2 className="vip-title">🚀 Únete al Club Galáctico</h2>
          <p className="vip-desc">
            Recibe alertas prioritarias sobre ofertas relámpago, claves de acceso a betas privadas
            y los resúmenes semanales de las mayores novedades de la industria.
          </p>
          {emailSubscribed ? (
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '16px' }}>
              🎉 ¡Te has suscrito con éxito! Pronto recibirás tus primeros beneficios gamer.
            </p>
          ) : (
            <form className="vip-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                required
                placeholder="Tu correo electrónico gamer..."
                className="vip-input"
                value={emailInput}
                onInput={(e) => setEmailInput((e.target as HTMLInputElement).value)}
              />
              <button type="submit" className="btn-primary">
                Suscribirme
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Modal del Carrito */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Tu Carrito de Compras ({cart.length})</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsCartOpen(false)}
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
                Tu carrito está vacío. ¡Explora el catálogo y añade tus juegos favoritos!
              </p>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{item.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--accent-cyan)' }}>
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => removeFromCart(item.id)}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-total-row">
                  <span>Total:</span>
                  <span style={{ color: '#38bdf8' }}>${cartTotal.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleCheckout}
                >
                  Finalizar Compra
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <div className="toast">✨ {toast}</div>}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#destacado">Destacados</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#noticias">Noticias</a>
          <a href="#club">Club VIP</a>
          <a href="#">Términos y Condiciones</a>
        </div>
        <p>© 2026 Nexus Games Store. Todos los derechos reservados.</p>
      </footer>
    </>
  )
}
