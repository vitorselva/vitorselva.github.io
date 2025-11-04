using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace SkyTap
{
    public class GameplayUIController : MonoBehaviour
    {
        [Header("HUD")]
        [SerializeField] private TMP_Text distanceLabel;
        [SerializeField] private TMP_Text bestLabel;
        [SerializeField] private Image heatFill;
        [SerializeField] private Image heatWarningFlash;

        [Header("Overlays")]
        [SerializeField] private CanvasGroup menuOverlay;
        [SerializeField] private CanvasGroup gameOverOverlay;
        [SerializeField] private TMP_Text gameOverDistanceLabel;
        [SerializeField] private TMP_Text gameOverBestLabel;
        [SerializeField] private TMP_Text gameOverReasonLabel;

        [Header("Botões")]
        [SerializeField] private Button playButton;
        [SerializeField] private Button replayButton;
        [SerializeField] private Button menuButton;
        [SerializeField] private Button continueButton;

        [Header("Configuração")]
        [SerializeField] private float hudUpdateRate = 0.1f;
        [SerializeField] private float fallThresholdY = -5f;

        public float FallThresholdY => fallThresholdY;

        private ScoreManager _scoreManager;
        private HeatSystem _heatSystem;
        private float _hudTimer;

        private void Awake()
        {
            if (GameManager.Instance != null)
            {
                playButton?.onClick.AddListener(GameManager.Instance.StartRun);
                replayButton?.onClick.AddListener(GameManager.Instance.StartRun);
                menuButton?.onClick.AddListener(GameManager.Instance.BackToMenu);
            }
            continueButton?.onClick.AddListener(HandleContinue);
        }

        private void Start()
        {
            _scoreManager = FindObjectOfType<ScoreManager>();
            _heatSystem = FindObjectOfType<HeatSystem>();

            if (_heatSystem != null)
            {
                _heatSystem.OnHeatChanged += UpdateHeatBar;
                _heatSystem.OnHeatWarning += TriggerHeatWarning;
            }
        }

        private void Update()
        {
            _hudTimer += Time.deltaTime;
            if (_hudTimer > hudUpdateRate)
            {
                _hudTimer = 0f;
                RefreshHUD();
            }
        }

        public void ShowMenu()
        {
            ShowCanvas(menuOverlay, true);
            ShowCanvas(gameOverOverlay, false);
        }

        public void HideAllOverlays()
        {
            ShowCanvas(menuOverlay, false);
            ShowCanvas(gameOverOverlay, false);
        }

        public void ShowGameOver(float distance, float best, GameOverReason reason)
        {
            ShowCanvas(gameOverOverlay, true);
            gameOverDistanceLabel.SetText($"{distance:0}" + " m");
            gameOverBestLabel.SetText($"Recorde: {best:0} m");
            gameOverReasonLabel.SetText(reason switch
            {
                GameOverReason.Collision => "Você colidiu!",
                GameOverReason.Overheat => "Motor superaqueceu!",
                GameOverReason.Fall => "Você caiu!",
                _ => "Game Over"
            });
        }

        private void RefreshHUD()
        {
            if (_scoreManager != null)
            {
                distanceLabel?.SetText($"{_scoreManager.CurrentDistance:0} m");
                bestLabel?.SetText($"{_scoreManager.BestDistance:0} m");
            }
        }

        private void UpdateHeatBar(float normalized)
        {
            if (heatFill != null)
            {
                heatFill.fillAmount = normalized;
                heatFill.color = Color.Lerp(Color.cyan, Color.red, normalized);
            }
        }

        private void TriggerHeatWarning()
        {
            if (heatWarningFlash == null)
            {
                return;
            }

            heatWarningFlash.gameObject.SetActive(true);
            heatWarningFlash.canvasRenderer.SetAlpha(1f);
            heatWarningFlash.CrossFadeAlpha(0f, 0.5f, false);
        }

        private void ShowCanvas(CanvasGroup canvas, bool show)
        {
            if (canvas == null)
            {
                return;
            }

            canvas.alpha = show ? 1f : 0f;
            canvas.interactable = show;
            canvas.blocksRaycasts = show;
        }

        private void HandleContinue()
        {
            // Placeholder para integração com anúncio recompensado
            Debug.Log("Assistir anúncio para continuar - integrar AdMob aqui");
        }
    }
}

