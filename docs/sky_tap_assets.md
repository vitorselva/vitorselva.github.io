## Sky Tap: Space Journey — Recursos Recomendados para o MVP

### 1. Dependências Técnicas
- **Unity 2022.3 LTS** (mínimo) com módulo iOS e Android instalados.
- **TextMeshPro** (integrado ao Unity; importe essenciais ao abrir projeto).
- **Cinemachine (opcional)** para suavizar follow da câmera.
- **Input System**: projeto pode permanecer no sistema antigo, mas considere novo Input System para suporte avançado a touch.
- **2D Sprite Shape (opcional)** se desejar criar trilhas ou nublados dinâmicos.
- **Pacote Unity Ads/Medidas** apenas quando integrar monetização.

### 2. Arte (Placeholder → MVP)
- **Foguete e Skins**
  - Comece com formas vetoriais simples (Photoshop, Figma, Affinity Designer ou Inkscape).
  - Estilo: corpo cilíndrico, aletas triangulares, janelas circulares; cores sólidas.
  - Crie atlas 512x512 com 4-6 skins (paletas: azul, vermelho, amarelo, preto, branco).
- **Obstáculos**
  - Clipes 2D `png` com alfa, uso de gradient mesh simples.
  - Dimensões aproximadas: 256x256 (balões, drones), 512x256 (aviões), 128x128 (meteoritos).
- **Backgrounds**
  - Gradientes lineares exportados como texturas 2048x2048 ou use shader `Sprite/Default` com `MaterialPropertyBlock`.
  - Parallax layers: nuvens suaves, estrelas, nebulosas (modo additive).
- **Partículas**
  - `ParticleSystem` com textura `soft circle` (128x128), cores do motor (azul -> amarelo) e explosão (laranja -> branco).

### 3. Fontes e UI
- **Fontes gratuitas**
  - `Montserrat`, `Nunito`, `Poppins` (Google Fonts) para UI limpa.
  - Importar como TMP Font Asset com atlas dinâmico.
- **Ícones**
  - Ícones de UI (play, replay, home) podem ser extraídos de `FontAwesome` (licença) ou `Material Icons`.
- **Paleta de Cores Sugestão**
  - Azul céu: `#5ECDE1`
  - Azul profundo: `#2D3E8B`
  - Violeta espacial: `#5B4B8A`
  - Cinza lunar: `#BFC3C4`
  - Vermelho marciano: `#D9472B`
  - Preto espacial: `#0D0B1A`

### 4. Áudio
- **Trilha Base**
  - Utilize loops royalty-free de ambientação espacial (ccMixter, Free Music Archive, Artlist/Envato para licenças pagas).
  - Necessário pelo menos 4 camadas (Atmosfera, Estratosfera, Espacial, Profundo). Cada camada ~60s loop seamless.
- **Efeitos Sonoros**
  - Motor: ruído suave + synth (pode gravar ruído e filtrar ou usar pacotes `freesound.org`).
  - Aviso calor: bips ascendentes (2-3 tons).
  - Colisão/explosão: impacto baixo + ruído branco.
  - UI: cliques suaves.
- **Mixer**
  - Crie `Audio Mixer` com grupos: `Music`, `SFX`, `UI`. Permite controle individual de volume.

### 5. Monetização e Anúncios
- **AdMob SDK**
  - Importar via `External Dependency Manager` quando estiver pronto.
  - Configurar IDs de teste para interstitial e rewarded.
- **Firebase Analytics/Crashlytics**
  - Requer integração via pacotes oficiais (GoogleGames). Planeje no pós-MVP.

### 6. Ferramentas Auxiliares
- **Sprite Editor** para fatiar atlas.
- **Animation (Unity)** para efeitos simples (UI pop, parallax).
- **Shader Graph (URP)** para gradientes dinâmicos e distorções leves (poeira marciana).
- **Timeline** caso queira cutscenes na tela inicial.

### 7. Licenciamento e Organização
- Mantenha planilha com origem/URL/licença de cada asset.
- Prefira assets CC0, CC-BY ou licenças comerciais claras.
- Repositório Git: armazenar apenas arquivos fonte (ex.: `.psd` compactas) e exportar `.png` otimizados.

