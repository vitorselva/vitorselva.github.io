using System;
using UnityEngine;

namespace SkyTap
{
    public enum GameState
    {
        Menu,
        Running,
        GameOver,
        Paused
    }

    public enum GameOverReason
    {
        Collision,
        Overheat,
        Fall
    }

    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [SerializeField] private RocketController rocket;
        [SerializeField] private ScoreManager scoreManager;
        [SerializeField] private GameplayUIController uiController;

        public GameState CurrentState { get; private set; } = GameState.Menu;
        public bool IsGameRunning => CurrentState == GameState.Running;
        public bool IsGameOver => CurrentState == GameState.GameOver;
        public bool CanAcceptGameplayInput => CurrentState == GameState.Running;

        public event Action<GameState> OnStateChanged;
        public event Action<GameOverReason> OnGameOver;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            if (rocket != null)
            {
                rocket.OnOverheated += HandleOverheat;
                rocket.OnExploded += HandleExplosion;
            }

            uiController?.ShowMenu();
        }

        public void StartRun()
        {
            scoreManager?.ResetScore();
            rocket?.GetComponent<HeatSystem>()?.ResetHeat();
            CurrentState = GameState.Running;
            OnStateChanged?.Invoke(CurrentState);
            uiController?.HideAllOverlays();
        }

        public void TriggerGameOver(GameOverReason reason)
        {
            if (CurrentState == GameState.GameOver)
            {
                return;
            }

            CurrentState = GameState.GameOver;
            OnStateChanged?.Invoke(CurrentState);
            uiController?.ShowGameOver(scoreManager?.CurrentDistance ?? 0f, scoreManager?.BestDistance ?? 0f, reason);
            OnGameOver?.Invoke(reason);
        }

        public void BackToMenu()
        {
            CurrentState = GameState.Menu;
            OnStateChanged?.Invoke(CurrentState);
            uiController?.ShowMenu();
        }

        private void HandleOverheat()
        {
            TriggerGameOver(GameOverReason.Overheat);
        }

        private void HandleExplosion()
        {
            if (rocket != null && rocket.transform.position.y < uiController.FallThresholdY)
            {
                TriggerGameOver(GameOverReason.Fall);
            }
        }
    }
}

