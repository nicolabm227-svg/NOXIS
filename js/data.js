/* ============================================================
   NOXIS — data.js
   Fuente de datos local (11 juegos reales cargados desde
   "Contenedor de juegos" + 5 herramientas).
   IMPORTANTE: Esta capa es la única que consulta los datos.
   En el futuro, sustituir la implementación por datos de
   Firebase SIN tocar la interfaz (los módulos de vista leen
   vía NOXIS.Data).
   ============================================================ */

(function (global) {
  "use strict";

  const games = [
    /* ── Juegos nuevos (destacados) ── */
    {
      id: "grand-theft-auto-v",
      title: "Grand Theft Auto V",
      category: "Acción",
      genre: "Aventura de mundo abierto",
      os: ["Windows"],
      year: 2015,
      popular: 98,
      rating: 9.5,
      featured: true,
      sub: "Aventura de mundo abierto · 2015",
      cover: "assets/images/games/grand-theft-auto-v/portada.jpg",
      description:
        "Cuando un joven estafador callejero, un ladrón de bancos retirado y un psicópata aterrador se ven involucrados con lo peor y más desquiciado del mundo criminal, del gobierno de los EE. UU. y de la industria del espectáculo, tendrán que llevar a cabo una serie de peligrosos golpes para sobrevivir en una ciudad implacable en la que no pueden confiar en nadie.",
      specs: {
        plataforma: "PC",
        idiomaTextos: "Español, Inglés, Francés, Italiano, Portugués (Brasil), Alemán, Ruso, Polaco, Chino",
        idiomaVoces: "Inglés",
        anio: "2015",
        tamano: "45 GB",
        formato: "ISO",
        genero: "Acción, Aventura, Mundo Abierto",
      },
      links: {
        download: "https://www.mediafire.com/file/ckuw8fpi8pc5tw2/grandtheftav-v3717-87.torrent/file",
        purchase: "https://store.steampowered.com/agecheck/app/271590/",
      },
      gallery: [
        "assets/images/games/grand-theft-auto-v/complementaria-1.webp",
        "assets/images/games/grand-theft-auto-v/complementaria-2.jpg",
        "assets/images/games/grand-theft-auto-v/complementaria-3.webp",
        "assets/images/games/grand-theft-auto-v/complementaria-4.webp",
      ],
    },
    {
      id: "the-witcher-3-wild-hunt",
      title: "The Witcher 3: Wild Hunt — Remastered",
      category: "RPG",
      genre: "RPG de mundo abierto",
      os: ["Windows"],
      year: 2026,
      popular: 93,
      rating: 9.6,
      featured: true,
      sub: "RPG de mundo abierto · 2026",
      cover: "assets/images/games/the-witcher-3-wild-hunt/portada.jpg",
      description:
        "Convertite en Geralt de Rivia, un brujo cazador de monstruos que recorre un continente devastado por la guerra, donde la magia, la intriga política y las viejas supersticiones se entrelazan. En The Witcher 3: Wild Hunt, cada contrato esconde sus propios peligros y cada decisión puede cambiar el destino de quienes te rodean. Explorá un mundo inmenso, enfrentá criaturas aterradoras y perseguí a la Cacería Salvaje en una aventura donde no siempre existe una elección correcta.",
      requirements: {
        min: {
          os: "Windows 11 64-bit",
          cpu: "Intel Core i5-8400 / AMD Ryzen 5 2600",
          ram: "12 GB",
          gpu: "NVIDIA GeForce GTX 1660 / AMD Radeon RX 5500 XT 8 GB / Intel Arc A580",
          storage: "60 GB libres",
        },
        rec: {
          os: "Windows 11 64-bit",
          cpu: "Intel Core i7-8700K / AMD Ryzen 5 3600X",
          ram: "16 GB",
          gpu: "NVIDIA GeForce RTX 2060 Super / AMD Radeon RX 6600 XT / Intel Arc B580",
          storage: "60 GB libres",
        },
      },
      specs: {
        plataforma: "PC",
        idiomaTextos: "Español, Inglés, Italiano, Francés, Portugués (Brasil), Alemán, Ruso, Japonés, Chino, Polaco, Checo, Árabe",
        idiomaVoces: "Inglés, Francés, Alemán, Polaco",
        anio: "2026",
        tamano: "50.5 GB",
        formato: "ISO",
        genero: "RPG, Mundo Abierto, Acción, Fantasía",
      },
      links: {
        download: "https://www.mediafire.com/file/tzly4xc4rl8moim/thew3-wildh298.torrent/file",
        purchase: "https://store.steampowered.com/agecheck/app/292030/",
      },
      gallery: [
        "assets/images/games/the-witcher-3-wild-hunt/complementaria-1.jpg",
        "assets/images/games/the-witcher-3-wild-hunt/complementaria-2.jpg",
        "assets/images/games/the-witcher-3-wild-hunt/complementaria-3.jpg",
        "assets/images/games/the-witcher-3-wild-hunt/complementaria-4.jpg",
      ],
      dlc: ["Hearts of Stone", "Blood and Wine", "Artworks", "Map", "Soundtrack x3"],
    },
    {
      id: "the-last-of-us-part-i",
      title: "The Last of Us Part I",
      category: "Acción",
      genre: "Aventura y supervivencia",
      os: ["Windows"],
      year: 2023,
      popular: 90,
      rating: 9.4,
      featured: true,
      sub: "Aventura y supervivencia · 2023",
      cover: "assets/images/games/the-last-of-us-part-i/portada.jpg",
      description:
        "Veinte años después del colapso de la civilización, The Last of Us Part I sigue a Joel, un superviviente endurecido por la pérdida, y Ellie, una adolescente que podría guardar la clave para cambiar el destino de la humanidad. En un mundo devastado por una infección, ambos deberán atravesar ciudades abandonadas, enfrentarse a infectados y sobrevivientes despiadados, y aprender a confiar el uno en el otro. Una aventura intensa donde sobrevivir es solo una parte de la historia.",
      requirements: {
        min: {
          os: "Windows 10 (versión 1909 o posterior)",
          cpu: "AMD Ryzen 5 1500X, Intel Core i7-4770K",
          ram: "16 GB",
          gpu: "AMD Radeon RX 470 4 GB / RX 6500 XT 4 GB, NVIDIA GeForce GTX 970 4 GB / GTX 1050 Ti 4 GB",
          storage: "100 GB libres",
        },
        rec: {
          os: "Windows 10 (versión 1909 o posterior)",
          cpu: "AMD Ryzen 5 3600X, Intel Core i7-8700",
          ram: "16 GB",
          gpu: "AMD Radeon RX 5700 XT 8 GB / RX 6600 XT 8 GB, NVIDIA GeForce RTX 2070 SUPER 8 GB / RTX 3060 8 GB",
          storage: "100 GB libres",
        },
      },
      specs: {
        plataforma: "PC",
        idiomaTextos: "Español, Inglés, Francés, Italiano, Portugués, Portugués (Brasil), Alemán, Ruso, Japonés, Polaco, Chino, Checo",
        idiomaVoces: "Español, Inglés, Francés, Portugués (Brasil), Alemán, Polaco",
        anio: "2023",
        tamano: "66.1 GB",
        formato: "ISO",
        genero: "Acción, Aventura, Supervivencia",
      },
      links: {
        download: "https://www.mediafire.com/file/i9vg4mlpkzec4zm/thelofusparti-v1.0.5.064806.torrent/file",
        purchase: "https://store.steampowered.com/agecheck/app/1888930/",
      },
      gallery: [
        "assets/images/games/the-last-of-us-part-i/complementaria-1.webp",
        "assets/images/games/the-last-of-us-part-i/complementaria-2.webp",
        "assets/images/games/the-last-of-us-part-i/complementaria-3.jpg",
        "assets/images/games/the-last-of-us-part-i/complementaria-4.jpg",
        "assets/images/games/the-last-of-us-part-i/complementaria-5.jpg",
      ],
      dlc: ["Digital Deluxe Upgrade + Soundtrack mp3", "Pre-purchase Entitlements"],
    },
    {
      id: "gears-of-war-e-day",
      title: "Gears of War: E-Day — Premium Edition",
      category: "Acción",
      genre: "Shooter en tercera persona",
      os: ["Windows"],
      year: 2026,
      popular: 88,
      rating: 8.8,
      featured: true,
      sub: "Shooter en tercera persona · 2026",
      cover: "assets/images/games/gears-of-war-e-day/portada.jpg",
      description:
        "Antes de convertirse en leyendas, Marcus Fenix y Dominic Santiago tuvieron que enfrentarse al día que cambió el destino de Sera. Gears of War: E-Day recrea el primer ataque de la Horda Locust, cuando una amenaza surgida de las profundidades sumerge al mundo en el caos. Viví los orígenes de una guerra brutal, marcada por la desesperación, la camaradería y la lucha por sobrevivir.",
      requirements: {
        min: {
          os: "Windows 10 64-bit (22H, 19045.7291)",
          cpu: "AMD Ryzen 5 2600X / Intel Core i7-6850K / i5-10400",
          ram: "12 GB",
          gpu: "GPU con soporte de Ray Tracing: NVIDIA GeForce RTX 5050 / RTX 2060 / AMD Radeon RX 6600 / RX 9060",
          directx: "Versión 12",
          storage: "115 GB libres",
        },
        rec: {
          os: "Windows 11 64-bit (25H2 o superior)",
          cpu: "AMD Ryzen 5 5600 / Intel Core i5-11600K",
          ram: "16 GB",
          gpu: "NVIDIA GeForce RTX 5060 / RTX 3060 Ti / AMD Radeon RX 6700 XT / RX 9060 XT",
          directx: "Versión 12",
          storage: "115 GB libres",
        },
      },
      specs: {
        plataforma: "PC",
        idiomaTextos: "Español, Inglés, Francés, Portugués (Brasil), Portugués, Alemán, Ruso, Polaco, Checo, Árabe",
        idiomaVoces: "Español, Inglés, Francés, Portugués (Brasil), Alemán",
        anio: "2026",
        tamano: "98.5 GB",
        formato: "ISO",
        genero: "Shooter en tercera persona, Acción",
      },
      links: {
        download: "https://www.mediafire.com/file/o7rr8dyolv4jlzs/gofw-e-day-pe-5252.torrent/file",
        purchase: "https://store.steampowered.com/agecheck/app/3010850/",
      },
      gallery: [
        "assets/images/games/gears-of-war-e-day/complementaria-1.jpg",
        "assets/images/games/gears-of-war-e-day/complementaria-2.jpg",
        "assets/images/games/gears-of-war-e-day/complementaria-3.jpg",
      ],
      dlc: [
        "Premium 1000 Iron",
        "Prince Street Pizza",
        "Liquid Death Bundle",
        "Luke Preece Marcus Weapon Skin Set",
        "Pre-Order",
        "Emergence Customization Pack",
        "Bravo Squad Signature Weapon Pack",
      ],
    },
    {
      id: "little-nightmares-iii",
      title: "Little Nightmares III",
      category: "Terror",
      genre: "Aventura y puzles",
      os: ["Windows"],
      year: 2025,
      popular: 85,
      rating: 8.5,
      featured: true,
      sub: "Aventura y puzles · 2025",
      cover: "assets/images/games/little-nightmares-iii/portada.jpg",
      description:
        "Little Nightmares III es una aventura de terror, plataformas y rompecabezas que sigue a Low y Alone, dos jóvenes que deben escapar de la Espiral, un mundo oscuro y surrealista habitado por criaturas aterradoras. Para sobrevivir, tendrán que cooperar, resolver acertijos y superar peligros en un viaje lleno de misterio y tensión.",
      requirements: {
        min: {
          os: "Windows 11",
          cpu: "Intel Core i5-6500 o AMD Ryzen 3 1200",
          ram: "8 GB",
          gpu: "NVIDIA GeForce GTX 1060 o AMD Radeon RX 580",
          storage: "20 GB libres",
        },
        rec: {
          os: "Windows 11",
          cpu: "Intel Core i5-8400 o AMD Ryzen 5 1600",
          ram: "12 GB",
          gpu: "NVIDIA GeForce RTX 2080 8 GB o AMD RX 6800",
          storage: "20 GB libres",
        },
      },
      specs: {
        plataforma: "PC",
        idiomaTextos: "Español, Inglés, Francés, Italiano, Portugués (Brasil), Alemán, Ruso, Japonés, Polaco, Chino, Árabe",
        anio: "2025",
        tamano: "14.01 GB",
        formato: "ISO",
        genero: "Terror, Aventura, Puzles, Plataformas",
      },
      links: {
        download: "https://www.mediafire.com/file/8tlvhxe74i5efpy/littlenightmares3433.torrent/file",
        purchase: "https://store.steampowered.com/app/1392860/Little_Nightmares_III/",
      },
      gallery: [
        "assets/images/games/little-nightmares-iii/complementaria-1.jpg",
        "assets/images/games/little-nightmares-iii/complementaria-2.webp",
        "assets/images/games/little-nightmares-iii/complementaria-3.jpg",
        "assets/images/games/little-nightmares-iii/complementaria-4.jpg",
      ],
      dlc: [
        "Secrets of The Spiral Expansion Pass",
        "Klonoa Costumes Set",
        "Nomes Costumes Set",
        "Dark Six Costumes Set",
        "Residents Costumes Pack",
        "Ferryman Costumes Set",
        "The Backstage",
        "The Shores",
      ],
    },
    /* ── Juego real (cargado manualmente desde "Contenedor de juegos") ──
       Portada: assets/images/games/cyberpunk-2077/portada.jpg
       Galería: imágenes "Complementaria N" copiadas a assets. */
    {
      id: "cyberpunk-2077",
      title: "Cyberpunk 2077",
      category: "Acción",
      genre: "RPG de mundo abierto",
      os: ["Windows"],
      year: 2020,
      popular: 96,
      rating: 8.7,
      featured: true,
      sub: "RPG de mundo abierto · 2020",
      cover: "assets/images/games/cyberpunk-2077/portada.jpg",
      description:
        "Sumergite en Night City, una metrópolis futurista dominada por la tecnología, las corporaciones y el crimen. En Cyberpunk 2077, encarnás a V, un mercenario que busca alcanzar la fama y sobrevivir en un mundo abierto lleno de decisiones, combates intensos y secretos por descubrir. Tu historia, tus elecciones y tus implantes cibernéticos definirán tu destino.",
      requirements: {
        min: {
          os: "Windows 10 64-bit",
          cpu: "Intel Core i7-6700 o AMD Ryzen 5 1600",
          ram: "12 GB",
          gpu: "NVIDIA GeForce GTX 1060 6GB, AMD Radeon RX 580 8GB o Intel Arc A380",
          vram: "6 GB",
          storage: "70 GB en SSD",
        },
        rec: {
          os: "Windows 10 64-bit",
          cpu: "Intel Core i7-12700 o AMD Ryzen 7 7800X3D",
          ram: "16 GB",
          gpu: "NVIDIA GeForce RTX 2060 SUPER, AMD Radeon RX 5700 XT o Intel Arc A770",
          vram: "8 GB",
          storage: "70 GB en SSD",
        },
      },
      specs: {
        plataforma: "PC",
        idiomaTextos: "Español (MX/ES), Inglés, Francés, Italiano, Portugués (Brasil)",
        idiomaVoces: "Español (ES), Inglés, Francés, Alemán, Polaco",
        anio: "2020",
        tamano: "97.0 GB",
        formato: "ISO",
        genero: "FPS, Acción, Ciberpunk, Rol, Mundo Abierto",
      },
      links: {
        download: "https://www.mediafire.com/file/be7niz9jmj9bsy0/CYBRPNK.torrent/file",
        purchase: "https://store.steampowered.com/agecheck/app/1091500/?snr=1_7_15__13",
      },
      gallery: [
        "assets/images/games/cyberpunk-2077/complementaria-1.webp",
        "assets/images/games/cyberpunk-2077/complementaria-2.webp",
        "assets/images/games/cyberpunk-2077/complementaria-3.webp",
      ],
      dlc: ["Phantom Liberty"],
    },
    {
      id: "god-of-war",
      title: "God of War",
      category: "Acción",
      genre: "Aventura y mitología",
      os: ["Windows"],
      year: 2022,
      popular: 95,
      rating: 9.3,
      featured: true,
      sub: "Aventura y mitología · 2022",
      cover: "assets/images/games/god-of-war/portada.jpg",
      description:
        "Convertite en el dios de la guerra en God of War, una épica aventura de acción y mitología. Acompañá a Kratos en un viaje marcado por combates brutales, criaturas legendarias y desafíos implacables, mientras intenta dejar atrás su pasado y guiar a su hijo Atreus en un mundo dominado por los dioses nórdicos.",
      requirements: {
        min: {
          os: "Windows 10 64-bit",
          cpu: "Intel Core i5-2500K o AMD Ryzen 3 1200",
          ram: "8 GB",
          gpu: "NVIDIA GTX 960 (4 GB) o AMD R9 290X (4 GB)",
          vram: "4 GB",
        },
        rec: {
          os: "Windows 10 64-bit",
          cpu: "Intel Core i5-6600K o AMD Ryzen 5 2400 G",
          ram: "8 GB",
          gpu: "NVIDIA GTX 1060 (6 GB) o AMD RX 570 (4 GB)",
          vram: "4 GB",
        },
      },
      specs: {
        plataforma: "PC",
        idiomaTextos: "Español (MX/ES), Inglés, Francés, Italiano, Portugués (Brasil)",
        idiomaVoces: "Español (MX/ES), Inglés, Francés, Italiano",
        anio: "2022",
        tamano: "28.5 GB",
        formato: "ISO",
        genero: "Acción, Aventura, Rol",
      },
      links: {
        download: "https://www.mediafire.com/file/om9ritufqao44q7/God_of_War-NOXIS.torrent/file",
        purchase: "https://store.steampowered.com/agecheck/app/1593500/?snr=1_7_15__13",
      },
      gallery: [
        "assets/images/games/god-of-war/complementaria-1.jpg",
        "assets/images/games/god-of-war/complementaria-2.jpg",
        "assets/images/games/god-of-war/complementaria-3.jpg",
      ],
    },
    {
      id: "red-dead-redemption-2",
      title: "Red Dead Redemption 2",
      category: "Acción",
      genre: "Aventura de mundo abierto",
      os: ["Windows"],
      year: 2019,
      popular: 97,
      rating: 9.7,
      featured: true,
      sub: "Aventura de mundo abierto · 2019",
      cover: "assets/images/games/red-dead-redemption-2/portada.jpg",
      description:
        "Adentrate en el ocaso del Viejo Oeste en Red Dead Redemption 2, una aventura de mundo abierto donde encarnás a Arthur Morgan, un forajido que lucha por sobrevivir junto a su banda en una época de grandes cambios. Explorá paisajes impresionantes, participá en intensos tiroteos y descubrí una historia inolvidable de lealtad, libertad y redención.",
      requirements: {
        min: {
          os: "Windows 7 SP1 (64-bit)",
          cpu: "Intel Core i5-2500K o AMD FX-6300",
          ram: "8 GB",
          gpu: "NVIDIA GeForce GTX 770 2GB o AMD Radeon R9 280 3GB",
          storage: "150 GB de espacio disponible",
        },
        rec: {
          os: "Windows 10 (Actualización de abril de 2018 o posterior)",
          cpu: "Intel Core i7-4770K o AMD Ryzen 5 1500X",
          ram: "12 GB",
          gpu: "NVIDIA GeForce GTX 1060 6GB o AMD Radeon RX 480 4GB",
          storage: "150 GB de espacio disponible",
        },
      },
      specs: {
        plataforma: "PC",
        idiomaTextos: "Español (MX/ES), Inglés, Francés, Italiano, Portugués (Brasil)",
        idiomaVoces: "Inglés",
        anio: "2019",
        tamano: "103 GB",
        formato: "ISO",
        genero: "TPS, FPS, Acción, Aventura, Mundo Abierto",
      },
      links: {
        download: "https://www.mediafire.com/file/ukgu716914g62o2/Red_Dead_Redemption_2-NOXIS.torrent/file",
        purchase: "https://store.steampowered.com/agecheck/app/1174180/?snr=1_7_15__13",
      },
      gallery: [
        "assets/images/games/red-dead-redemption-2/complementaria-1.jpg",
        "assets/images/games/red-dead-redemption-2/complementaria-2.jpg",
        "assets/images/games/red-dead-redemption-2/complementaria-3.jpg",
      ],
      dlc: ["Red Dead Online"],
    },
    {
      id: "command-and-conquer-red-alert-3",
      title: "Command & Conquer: Red Alert 3",
      category: "Estrategia",
      genre: "Estrategia en tiempo real",
      os: ["Windows"],
      year: 2008,
      popular: 84,
      rating: 8.1,
      featured: true,
      sub: "Estrategia en tiempo real · 2008",
      cover: "assets/images/games/command-and-conquer-red-alert-3/portada.jpg",
      description:
        "Sumergite en una guerra alternativa donde las grandes potencias luchan por dominar el mundo en Command & Conquer: Red Alert 3 - Complete Collection. Construí bases, administrá recursos y comandá ejércitos en intensas batallas de estrategia en tiempo real. Con campañas llenas de acción, tecnología experimental y facciones únicas, cada decisión puede cambiar el curso de la guerra.",
      requirements: {
        min: {
          os: "Windows XP SP2, Windows 7 (probado en Windows 7)",
          cpu: "Cualquier procesador Intel Core Duo; XP: Intel Pentium 4 2.2 GHz o más, AMD Athlon XP 2100+ o más",
          ram: "1 GB de RAM",
          gpu: "Compatible con DirectX 9.0c, nVidia GeForce 6800 o superior, ATI Radeon X800 o superior",
          storage: "20 GB libres",
        },
        rec: {
          storage: "20 GB libres",
        },
      },
      specs: {
        plataforma: "PC",
        genero: "Estrategia En Tiempo Real",
        anio: "2008",
        tamano: "20 GB",
      },
      links: {
        download: "https://www.mediafire.com/file/8ufeerzw2cqix1m/Command_and_Conquer_Red_Alert_3_Complete_Collection-Noxis.torrent/file",
        purchase: "https://store.steampowered.com/app/17480/Command__Conquer_Red_Alert_3/",
      },
      gallery: [
        "assets/images/games/command-and-conquer-red-alert-3/complementaria-1.jpg",
        "assets/images/games/command-and-conquer-red-alert-3/complementaria-2.jpg",
        "assets/images/games/command-and-conquer-red-alert-3/complementaria-3.jpg",
        "assets/images/games/command-and-conquer-red-alert-3/complementaria-4.jpg",
      ],
      dlc: ["Uprising"],
    },
    {
      id: "rise-of-nations-extended-edition",
      title: "Rise of Nations: Extended Edition",
      category: "Estrategia",
      genre: "Estrategia en tiempo real",
      os: ["Windows"],
      year: 2014,
      popular: 86,
      rating: 8.4,
      featured: true,
      sub: "Estrategia en tiempo real · 2014",
      cover: "assets/images/games/rise-of-nations-extended-edition/portada.jpg",
      description:
        "Rise of Nations: Extended Edition es un videojuego de estrategia en tiempo real y versión remasterizada del clásico RTS de Big Huge Games, modificado por Skybox Labs, que recientemente se encargó de remasterizar Age of Mythology: Extended Edition. Esta edición extendida incluye el juego original de Rise of Nations más su expansión Thrones and Patriots.",
      requirements: {
        min: {
          os: "Windows Vista/7/8.1/10",
          cpu: "1.6 GHz",
          ram: "1 GB",
          gpu: "DirectX 10+ Capable GPU",
          directx: "Versión 10",
          storage: "3 GB",
          sound: "Direct X Compatible Sound Card",
          notes: "GPU al menos (Integrated HD 3000, 8600GT, etc.)",
        },
        rec: {
          os: "Windows Vista/7/8.1/10",
          cpu: "2.6 GHz",
          ram: "4 GB",
          gpu: "DirectX 11+",
          directx: "Versión 11",
          storage: "5 GB",
          notes: "GeForce 9800GTX, Radeon 4850+",
        },
      },
      specs: {
        plataforma: "PC",
        idioma: "Español (Multi)",
        tamano: "1.20 GB",
        formato: "ISO, 1 DVD",
        genero: "Estrategia En Tiempo Real",
      },
      links: {
        download: "https://www.mediafire.com/file/7dl4yeuum072fu1/Rise_of_Nations_Extended_Edition.torrent/file",
        purchase: "https://store.steampowered.com/app/287450/Rise_of_Nations_Extended_Edition/",
      },
      gallery: [
        "assets/images/games/rise-of-nations-extended-edition/complementaria-1.jpg",
        "assets/images/games/rise-of-nations-extended-edition/complementaria-2.jpg",
        "assets/images/games/rise-of-nations-extended-edition/complementaria-3.jpg",
        "assets/images/games/rise-of-nations-extended-edition/complementaria-4.jpg",
      ],
      dlc: ["Thrones and Patriots"],
    },
    /* ── Juego real (cargado manualmente desde "Contenedor de juegos") ── */
    {
      id: "diablo-ii-resurrected",
      title: "Diablo II: Resurrected — Infernal Edition",
      category: "Acción",
      genre: "RPG de acción",
      os: ["Windows"],
      year: 2021,
      popular: 88,
      rating: 8.5,
      featured: true,
      sub: "RPG de acción · 2021",
      cover: "assets/images/games/diablo-ii-resurrected/portada.jpg",
      description:
        "Descendé a un mundo consumido por la oscuridad en Diablo II: Resurrected, la versión remasterizada del legendario RPG de acción de Blizzard. Recorré tierras corrompidas, explorá mazmorras infestadas de demonios y enfrentate a las fuerzas del Infierno mientras perseguís al mismísimo Diablo. Elegí tu clase, dominá habilidades devastadoras y conseguí equipo cada vez más poderoso en una lucha donde cada expedición puede esconder una nueva recompensa… o una muerte segura.",
      requirements: {
        min: {
          os: "Windows 10 (64 bits)",
          cpu: "Intel Core i3-3250 o AMD FX-4350",
          ram: "8 GB",
          gpu: "Nvidia GTX 660 o AMD Radeon HD 7850",
          storage: "30 GB",
          notes: "Resolución: 1280 x 720",
        },
        rec: {
          os: "Windows 10 (64 bits)",
          cpu: "Intel Core i5-9600K o AMD Ryzen 5 2600",
          ram: "16 GB",
          gpu: "Nvidia GTX 1060 o AMD Radeon RX 5500 XT",
          storage: "30 GB",
          notes: "Resolución: 1280 x 720",
        },
      },
      specs: {
        plataforma: "PC",
        idiomaTextos: "Español (MX/ES), Inglés, Francés, Italiano, Portugués (Brasil)",
        idiomaVoces: "Español, Inglés, Francés, Alemán",
        anio: "2021",
        tamano: "31.5 GB",
        formato: "ISO",
        genero: "Aventura, Rol",
      },
      links: {
        download: "https://www.mediafire.com/file/jxsved7fo6rd6y1/Diablo_II_Resurrected_Infernal_Edition.torrent/file",
        purchase: "https://store.steampowered.com/app/2536520/Diablo_II_Resurrected__Infernal_Edition/",
      },
      gallery: [
        "assets/images/games/diablo-ii-resurrected/complementaria-1.jpg",
        "assets/images/games/diablo-ii-resurrected/complementaria-2.png",
        "assets/images/games/diablo-ii-resurrected/complementaria-3.png",
        "assets/images/games/diablo-ii-resurrected/complementaria-4.webp",
      ],
      dlc: ["Lord of Destruction"],
    },
  ];

  /* Herramientas del bloque lateral (presentación compacta).
     Cada herramienta incluye su enlace de descarga/sitio, abierto
     en pestaña nueva desde explore.js (target="_blank", rel="noopener noreferrer"). */
  const tools = [
    { id: "winrar",      name: "WinRAR",       url: "https://winrar.es/descargas" },
    { id: "ultraiso",    name: "UltraISO",     url: "https://centercorpec.wixsite.com/estalingradocorp/post/opten-ultraiso" },
    { id: "daemontools", name: "DAEMON Tools", url: "https://www.daemon-tools.cc/spa/downloads" },
    { id: "qbittorrent", name: "qBittorrent",  url: "https://www.qbittorrent.org/" },
    { id: "utorrent",    name: "µTorrent",     url: "https://www.utorrent.com/intl/es/downloads/win/" },
  ];

  /* Popularidad dinámica cargada desde el backend de interacciones
     (Cloudflare Worker). Mapa { gameId: score }. null = sin cargar. */
  let popularity = null;

  /* Orden "popular": con datos de interacciones, ordena por score
     ponderado (desempate por el campo estático `popular`). Sin datos
     (arranque en frío / sin conexión), usa solo el campo estático. */
  const comparePopular = (a, b) => {
    const hasData = popularity && Object.keys(popularity).length > 0;
    if (hasData) {
      const sa = Number(popularity[a.id]) || 0;
      const sb = Number(popularity[b.id]) || 0;
      if (sb !== sa) return sb - sa;
    }
    return (b.popular || 0) - (a.popular || 0);
  };

  /* Configuración de las secciones de la Home.
     Cada sección define cómo se seleccionan los juegos.
     "Destacados" = juegos marcados con `featured`, ordenados por popularidad
     (descargas/interacciones reales del backend; `popular` estático de respaldo).
     Se eliminó la sección "Más populares" por ser redundante con este orden. */
  const sections = [
    { key: "featured", heading: "Destacados",
      select: (list) => [...list].filter((g) => g.featured).sort(comparePopular) },
    { key: "new", heading: "Nuevos",
      select: (list) => [...list].sort((a, b) => b.year - a.year) },
  ];

  /* Utilidades pequeñas de orden. */
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const uniqFlat = (arr) => uniq(arr.flat());

  /* API pública del módulo de datos.
     Sustituir el interior por Firebase manteniendo la misma forma de retorno. */
  const Data = {
    /* Carga (opcional) la popularidad calculada por el backend de
       interacciones. Si falla o no hay backend, se conserva el orden
       estático basado en el campo `popular`. */
    async init() {
      const endpoint =
        global.NOXIS && global.NOXIS.Analytics && global.NOXIS.Analytics.endpoint;
      if (!endpoint) return;
      // En desarrollo local no se consulta el backend.
      const isLocal =
        location.protocol === "file:" ||
        ["localhost", "127.0.0.1", ""].indexOf(location.hostname) !== -1;
      if (isLocal) return;
      try {
        const res = await fetch(endpoint + "/popular");
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data === "object") {
          popularity = data;
          document.dispatchEvent(new CustomEvent("noxis:popularity"));
        }
      } catch (e) {
        /* silencioso: se conserva el orden estático */
      }
    },

    getAllGames() {
      return games;
    },

    getSectionGames(key) {
      const section = sections.find((s) => s.key === key);
      return section ? section.select(games) : [];
    },

    /* Carriles de la Home sin repetir juegos: cada sección aporta su
       propia selección (destacados por popularidad, más nuevos) y toma los
       primeros que aún no aparecieron arriba. El tamaño por sección se
       adapta al catálogo (máx. 8) para que todas tengan contenido aunque
       la biblioteca sea chica, y se omiten las secciones vacías. */
    getSections() {
      const perSection = Math.min(8, Math.ceil(games.length / sections.length));
      const used = new Set();
      return sections
        .map((s) => {
          const pool = s.select(games).filter((g) => !used.has(g.id));
          const chosen = perSection > 0 ? pool.slice(0, perSection) : [];
          chosen.forEach((g) => used.add(g.id));
          return { key: s.key, heading: s.heading, games: chosen };
        })
        .filter((s) => s.games.length > 0);
    },

    searchGames(query) {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return games.filter((g) =>
        [g.title, g.category, g.genre, g.sub].join(" ").toLowerCase().includes(q)
      );
    },

    /* Facetas para los filtros de Explorar. */
    getFacets() {
      return {
        categories: uniq(games.map((g) => g.category)),
        genres: uniq(games.map((g) => g.genre)),
        os: uniqFlat(games.map((g) => g.os)),
        years: uniq(games.map((g) => g.year)).sort((a, b) => b - a),
      };
    },

    getTools() {
      return tools;
    },

    /* Filtra y ordena el catálogo según los criterios recibidos. */
    filterGames({ category, genre, os, year, sort }) {
      let list = games.slice();

      if (category) list = list.filter((g) => g.category === category);
      if (genre) list = list.filter((g) => g.genre === genre);
      if (os) list = list.filter((g) => g.os.includes(os));
      if (year) list = list.filter((g) => g.year === year);

      if (sort === "recent") list.sort((a, b) => b.year - a.year);
      else if (sort === "popular") list.sort(comparePopular);
      else if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));

      return list;
    },
  };

  global.NOXIS = global.NOXIS || {};
  global.NOXIS.Data = Data;
})(window);