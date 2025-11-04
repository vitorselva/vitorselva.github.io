## Sky Tap: Space Journey — Plano de Testes e Validação

### 1. Checklists de Smoke Test (Build Editor)
- `MainMenu` carrega com título e botão `Play` funcional.
- Clicar/tocar ativa o motor e foguete sobe.
- Barra de calor responde incrementalmente, reseta ao soltar.
- Obstáculos começam a surgir após 1–2 segundos.
- Colisão ou calor máximo aciona Game Over e UI correspondente.
- Botão `Replay` reinicia run com calor zerado e score limpo.

### 2. Testes de Mecânica
- **Controle de Impulso**: testar repetidos taps de diferentes frequências para garantir que o foguete não oscila demais (ajustar `thrustForce`, `maxVerticalSpeed`).
- **Heat System**: verificar thresholds (70%, 90%, 100%) com logs visuais; confirmar que aquecimento é proporcional ao tempo de impulso.
- **Queda**: remover input por 2-3 segundos e confirmar queda e game over por `Fall`.
- **Pooling**: monitorar `Profiler > Memory` para confirmar que objetos de obstáculos são reutilizados (sem instâncias extras).

### 3. Testes de Progressão por Altitude
- Definir `Debug` temporário para teletransportar o foguete (ex.: setar `transform.position.y`) e garantir transições suaves de cores e sprites.
- Verificar que cada faixa troca obstacles sprites e música sem cortes.
- Garantir que `spawnCurveByAltitude` aumenta cadência sem tornar jogo injusto (target >= 1.5x após 20.000 m).

### 4. Testes de UI/UX
- Avaliar legibilidade em múltiplas resoluções (1080x1920, 1440x3040, 720x1600).
- Testar safe area em iPhone X/Android com notch (Unity GameView `Safe Area Simulator`).
- Conferir tamanho de botões em dispositivos reais (mínimo 48px físicos).
- Game Over overlay: animações suaves, botões responsivos, nenhum bloqueio.

### 5. Testes de Performance
- **Editor**: use `Profiler` para monitorar FPS e GC alloc; meta 60 fps.
- **Android**: build `Development` com `Autoconnect Profiler` e teste em hardware médio (Snapdragon 660). Ajuste quantidades de partículas se necessário.
- **iOS**: usar `Xcode` Instruments para frame time e CPU.
- Reduza draw calls limitando número de layers ativos.

### 6. Testes de Áudio
- Verificar que camadas de música entram/saem sem clipping ou saltos.
- Checar volumes relativos (Music -6 dB, SFX 0 dB, UI -3 dB como ponto de partida).
- Assegurar que áudio pausa em background (`OnApplicationFocus` ou `OnApplicationPause`).

### 7. Testes de Monetização (quando integrado)
- Mockar chamadas AdMob com IDs de teste.
- Garantir que interstitial não aparece em sequência inferior a 30s ou entre duas partidas rápidas.
- Rewarded: validar que usuário recebe continuação apenas uma vez por run; sem anúncios, loop deve seguir sem travar.

### 8. QA Funcional & Bugs Comuns
- Colisores de obstáculos alinhados ao sprite (use `Gizmos` para visualizar).
- Verificar `Rigidbody2D` constraints (freeze Z rotation para evitar giro indesejado).
- Ajustar limites laterais invisíveis para evitar fuga da tela.
- Confirmar resets de estado (calor, velocidade, UI) em cada replay.

### 9. Testes de Usuário
- Recrute 3-5 jogadores casuais (preferência mobile) para sessões rápidas.
- Observações: 
  - Compreenderam objetivo sem tutorial? 
  - Conseguiram manter ritmo de toques?
  - Feedback sobre barra de calor e avisos.
- Colete comentários sobre dificuldade e estética.

### 10. Métricas e Instrumentação (Pós-Lançamento)
- Implementar eventos: `run_start`, `run_end` (distância, causa morte), `ad_watched`, `skin_unlocked`.
- Monitorar retenção D1/D7 e tempo médio por sessão.
- Ajustar balanceamento (heat, obstáculos) baseado em dados reais.

