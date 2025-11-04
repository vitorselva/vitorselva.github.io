## Sky Tap: Space Journey — Guia de Configuração no Unity

### 1. Criar Projeto
- Abra o Unity Hub (versão recomendada: 2022.3 LTS ou superior) e crie um projeto 2D URP (ou 2D padrão se preferir pipeline built-in).
- Nome sugerido: `SkyTap`.
- Defina a pasta `Assets/SkyTap` como raiz lógica para scripts, prefabs e cenas.

### 2. Estrutura de Pastas (`Assets/SkyTap`)
- `Scripts/Gameplay` — scripts C# fornecidos.
- `Prefabs/Player`, `Prefabs/Obstacles`, `Prefabs/UI`.
- `Art/Backgrounds`, `Art/Obstacles`, `Art/FX`.
- `Audio/Music`, `Audio/SFX`.
- `ScriptableObjects/Stages`, `ScriptableObjects/Skins`.
- `Scenes` — `MainMenu.unity`, `Gameplay.unity`.
- `Materials` e `Shaders` (para gradientes/partículas).

### 3. Importar Scripts
- Copie os arquivos `.cs` de `/workspace/UnityProject/Scripts` para `Assets/SkyTap/Scripts/Gameplay`.
- Deixe o Unity recompilar. Resolva eventuais namespaces (todos estão em `SkyTap`).

### 4. Configurar Cena `Gameplay`
1. **Câmera**
   - Tipo: Orthographic, tamanho ~5.
   - Acrescente script de follow simples (opcional) para suavizar movimento com o foguete.
2. **GameManager (Empty GameObject)**
   - Adicione componentes `GameManager`, `ScoreManager`, `ObstacleManager`, `BackgroundManager`, `AudioManager`, `GameplayUIController`.
   - Marque `DontDestroyOnLoad` conforme script já faz.
3. **Rocket**
   - Crie objeto com `SpriteRenderer` (placeholder), `Rigidbody2D` (Gravity Scale ~1.5, Drag 0), `RocketController`, `HeatSystem`.
   - Adicione `Collider2D` (Capsule ou Box) com `Is Trigger = false`.
   - Partículas: `ParticleSystem` filho (`engineParticles`) posicionado na base.
4. **HUD (Canvas)**
   - Canvas `Screen Space - Overlay`, scaler `Scale with Screen Size` (1080x1920).
   - Dentro crie `HUD` (distância, recorde, barra de calor), `MenuOverlay`, `GameOverOverlay`.
   - Vincule referências no `GameplayUIController` (TMP Texts, Images, Buttons). Configure `CanvasGroup` nos overlays.
5. **Background**
   - `BackgroundRoot` com dois `SpriteRenderer`: um para gradiente (material com shader de dois tons, ex.: `Sprite/Lit` customizado) e outro para layer parallax.
   - Atribua no `BackgroundManager` (campo `gradientRenderer` e `parallaxRenderer`).
6. **Obstacles**
   - Crie prefab `Obstacle_Basic` com `SpriteRenderer`, `Obstacle` script, `BoxCollider2D`.
   - Configure `horizontalAmplitude`, `verticalScrollSpeed` base.
   - Crie `ObjectPool` como filho de `GameManager` e ligue o prefab.
   - Arraste referências no `ObstacleManager` (`obstaclePool`, `rocket`, `backgroundManager`).

### 5. ScriptableObjects de Estágios
- Menu `Assets > Create > SkyTap > BackgroundStage` (crie um scriptable custom caso queira) ou utilize arrays no inspector.
- Para cada faixa de altitude, defina:
  - `startAltitude` (0, 100, 500, 1000, 2000, 4000 em Unity units, ajustar proporção).
  - `gradientTop/Bottom` (cores hex da paleta).
  - `parallaxLayer` (sprites de nuvens, estrelas, etc.).
  - `obstacleSprites` (lista por estágio).
  - `musicLayer` (clip de áudio para mix dinâmico).

### 6. Cena `MainMenu`
- Canvas principal com título, botão `Play`, botão `Skins` (placeholder) e exibição da skin atual (imagem do foguete).
- `GameManager` persiste entre cenas; botão `Play` chama `GameManager.Instance.StartRun()` e carrega cena `Gameplay` (use `SceneLoader` simples ou `UnityEngine.SceneManagement`).
- Opcional: animação de fundo usando o mesmo `BackgroundManager` com estágio inicial.

### 7. Eventos e Ligações
- Configure `GameManager` referenciando os componentes (arraste no inspector).
- `RocketController` precisa do `HeatSystem`, `ParticleSystem`, `AudioSource` (loop de motor), `GameManager` singleton.
- `ObstacleManager` requer `spawnCurveByAltitude`: crie curva onde X=altura normalizada (0 a 1) e Y= multipliers (1-2).
- `AudioManager`: associe `baseMusicSource` (loop geral) e múltiplos `layeredSources` com `AudioSource` independentes (defina `loop = true`).

### 8. UI & TextMeshPro
- Instale TMP se o projeto pedir. Substitua placeholder Text Mesh por TMP Texts.
- Barra de calor: use `Image` radial/vertical. Atribua no `heatFill`.
- `heatWarningFlash`: imagem full-screen com blend `Multiply` e alpha 0; `GameplayUIController` lida com flash.

### 9. Ajustes de Física
- Ajuste `Physics2D.gravity` global (ex.: (0, -9)).
- No `RocketController`, ajuste `thrustForce` para equilíbrio entre toques e queda.
- Garanta que `Rigidbody2D` esteja em modo `Dynamic` com `Interpolate` habilitado.

### 10. Game Over Flow
- `GameManager.TriggerGameOver` já atualiza UI. Certifique-se que `ObstacleManager` pare via `OnStateChanged`.
- Para continuação com anúncio: no botão `continueButton`, adicionar listener futuro para AdMob (usar `Unity Mediation` ou `Google Mobile Ads` SDK).

### 11. Build Settings
- Adicione cenas `MainMenu` e `Gameplay` em `File > Build Settings`.
- Ajuste lado iOS/Android: 
  - Android: `Resolution Scaling` -> `Fixed DPI`, target 320.
  - iOS: habilite `Requires Fullscreen`, configure ícones.

### 12. Testes Rápidos
- Use `Unity Remote` ou build rápido via `Development Build` para validar controles touch.
- Em Editor, substitua toque por input de mouse (já suportado por script).
- Ative `Debug.Log` importantes para calor, spawn e colisões durante os testes iniciais.

### 13. Controle de Versão
- Configure `.gitignore` para `Library/`, `Temp/`, `Logs/` e builds.
- Organize prefabs e cenas em pasta `Assets/SkyTap` para facilitar colaboração.

