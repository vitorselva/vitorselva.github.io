## Sky Tap: Space Journey — Documento de Design

### Visão Geral
- **Gênero**: Endless runner vertical minimalista
- **Plataformas alvo**: iOS e Android (Unity como engine principal, suporte opcional a Godot)
- **Loop central**: jogador toca na tela para impulsionar o foguete; gerencia calor; evita obstáculos; busca maior altitude possível; partida rápida com replays imediatos.

### Cenas Principais
- **Menu Principal (`MainMenu`)**
  - Elementos: título `Sky Tap: Space Journey`, botão `Play`, botão `Skins` (placeholder), exibição da skin atual.
  - Fundo: gradiente suave animado com partículas de estrelas lentas.
  - Transições: fade-in/out simples para `Gameplay`.
- **Cena de Gameplay (`Gameplay`)**
  - Objetos centrais: foguete (`PlayerRocket`), sistema de obstáculos (`ObstacleManager`), gerador de fundo (`BackgroundManager`), UI (`GameplayHUD`).
  - Câmera: perspectiva ortográfica fixa, acompanhando foguete com offset suave (lerp).
  - Loop infinito: segmentos de obstáculos spawnados à frente do foguete, reciclagem via pooling.
- **Tela de Game Over (`GameOverOverlay`)**
  - UI sobreposta na própria cena de gameplay.
  - Exibe distância da run, recorde local, botões `Replay` e `Assistir anúncio`. Botão `Home` opcional para voltar ao menu.

### Mecânicas Principais
- **Impulso e Gravidade**
  - Gravidade constante configurada em `Physics2D.gravity` ou aplicada manualmente.
  - Toque liga o motor: aplica força impulsionando no eixo Y e consome calor.
- **Gestão de Calor**
  - `heatLevel` (0 a `maxHeat`). Aumenta enquanto impulso ativo (multiplicador por segundo) e diminui quando desativado.
  - Feedback visual: barra vertical à direita, cor variando de azul -> amarelo -> vermelho.
- **Condição de Derrota**
  - Calor ≥ `maxHeat`: explosão (animação + som) e fim de jogo.
  - Colisão com obstáculos: explosão imediata.
  - Saída da tela para baixo (queda): derrota.
- **Pontuação**
  - Baseada na altitude máxima atingida (metros). Conversão: altura em Unity units * fator de escala.
  - Recorde armazenado em `PlayerPrefs`.

### Progressão de Altitude
- **0 – 1.000 m (Atmosfera)**
  - Fundo: gradiente azul claro; nuvens em parallax.
  - Obstáculos: aviões, drones, balões; velocidades lentas.
- **1.000 – 5.000 m (Estratosfera)**
  - Fundo: azul profundo/violeta.
  - Obstáculos: balões meteorológicos, satélites lentos.
- **5.000 – 10.000 m (Limite Espacial)**
  - Fundo: preto com estrelas.
  - Obstáculos: lixo espacial, meteoritos.
- **10.000 – 20.000 m (Zona Lunar)**
  - Fundo: tons acinzentados com superfície lunar distante.
  - Obstáculos: rochas flutuantes, detritos lunares.
- **20.000 – 40.000 m (Órbita Marciana)**
  - Fundo: gradiente avermelhado; poeira animada.
  - Obstáculos: drones rápidos, meteoritos.
- **40.000+ m (Espaço Profundo)**
  - Fundo: preto com nebulosas coloridas.
  - Obstáculos: fragmentos cósmicos com movimento errático.
- **Implementação Técnica**
  - Script `BackgroundManager` consulta altitude e interpola gradientes/sprites.
  - Coleções de sprites e parâmetros por faixa armazenados em `BackgroundStage` ScriptableObjects.

### Obstáculos
- **Geração Procedural**
  - Sistema baseado em `Spawner` com pooling.
  - Tabelas de spawn por faixa de altitude definem prefabs, frequências e velocidade relativa.
  - Obstáculos possuem movimento lateral simples (seno, zig-zag) e colisores `BoxCollider2D`.
- **Dificuldade Dinâmica**
  - Cadência e velocidade sobem levemente com altitude.
  - RNG seed opcional para runs reprodutíveis.

### Interface e Feedback
- **HUD**
  - `DistanceLabel`: mostra metros atuais.
  - `BestScoreLabel`: recorde.
  - `HeatBar`: barra vertical com gradiente.
  - Indicadores de aviso de calor (piscar >80%).
- **Game Over Overlay**
  - Distância, recorde, botões `Replay`, `Watch Ad`, `Menu`.
  - Animação de entrada (scale up + fade).
- **Audio**
  - Trilha dinâmica baseada na faixa (4-5 camadas remixáveis).
  - Efeitos: motor, aviso de calor alto, colisão, explosão.

### Arte e Animação
- **Estilo Visual**: minimalista, shapes geométricos, paleta flat.
- **Assets**
  - Foguete: sprite principal + variantes de skins.
  - Partículas: chama do motor (usar `ParticleSystem`), explosão simples.
  - Obstáculos: sprites 2D vetoriais.
  - Background: gradientes animados (Shader Graph ou sprites). Parallax layers.

### Arquitetura de Códigos (Unity)
- `RocketController`: input, física, calor, estados.
- `HeatSystem`: lógica de aquecimento/resfriamento, eventos de limite.
- `ObstacleManager` + `Obstacle` + `ObjectPool`.
- `BackgroundManager`: troca de temas por altitude.
- `ScoreManager`: cálculo de distância, recorde.
- `UIManager`: HUD e overlays.
- `AudioManager`: gerencia trilha dinâmica.
- `GameManager`: estados principais (Menu, Running, GameOver), integra anúncios.

### Dados Persistentes
- `PlayerPrefs`
  - `BestDistance`
  - `SelectedSkin`
  - Flags para skins desbloqueadas.
- Futuro: migrar para sistema de salvamento mais robusto.

### Build & Plataforma
- **Mobile**
  - Input: `Touch` (fallback para clique em builds de teste).
  - Performance: objetos simplificados, pooling, UI otimizada.
  - Aspect ratio alvo: 9:16 (adaptação via safe area).
- **Empacotamento**
  - Android: `Gradle`, suporte mínimo Android 7.0.
  - iOS: `IL2CPP`, suporte iPhone 8+.

### Métricas Futuras
- Distância média/tempo de sessão.
- Taxa de sucesso em `Watch ad to continue`.
- Desbloqueio de skins por sessão.

### Monetização (Fase Pós-MVP)
- **Interstitial AdMob**: exibido após game over, com delay mínimo de 30s entre impressões.
- **Rewarded Ad**: botão `Assistir anúncio` na tela final; concede continuação única por partida com calor zerado e invulnerabilidade temporária.
- **Skins Cosméticas**: desbloqueios progressivos por metas de distância (ex.: 1.000 m, 5.000 m, 10.000 m) e pacote premium.
- **IAP Remover Anúncios**: remove interstitials e desbloqueia skins exclusivas; mantém rewarded opcional.
- **Telemetria**: eventos em Firebase Analytics para acompanhar retenção e conversão.

### Roadmap de Extras
- **Power-ups**: itens coletáveis que aparecem após 2.000 m (resfriamento instantâneo, escudo de colisão, turbo temporário).
- **Ranking Online**: integração com Play Games Services / Game Center; placares semanais e globais.
- **Missões Diárias**: três objetivos gerados aleatoriamente (ex.: sobreviver 60s, coletar 5 power-ups).
- **Eventos Sazonais**: temas especiais (Natal, Halloween) com skins e obstáculos temporários.
- **Modos de Desafio**: corridas curtas com limite de tempo e layout fixo para speedrun.

