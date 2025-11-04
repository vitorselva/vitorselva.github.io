using UnityEngine;

namespace SkyTap
{
    public class ScoreManager : MonoBehaviour
    {
        [SerializeField] private Transform rocketTransform;
        [SerializeField] private float unitsToMeters = 10f;

        public float CurrentDistance { get; private set; }
        public float BestDistance { get; private set; }

        private void Start()
        {
            BestDistance = PlayerPrefs.GetFloat(Keys.BestDistance, 0f);
        }

        private void Update()
        {
            if (!GameManager.Instance.IsGameRunning || rocketTransform == null)
            {
                return;
            }

            float meters = Mathf.Max(0f, rocketTransform.position.y * unitsToMeters);
            CurrentDistance = Mathf.Max(CurrentDistance, meters);
            BestDistance = Mathf.Max(BestDistance, CurrentDistance);

            PlayerPrefs.SetFloat(Keys.BestDistance, BestDistance);
        }

        public void ResetScore()
        {
            CurrentDistance = 0f;
        }

        public static class Keys
        {
            public const string BestDistance = "BEST_DISTANCE";
        }
    }
}

