using System;
using UnityEngine;

namespace SkyTap
{
    public class HeatSystem : MonoBehaviour
    {
        [SerializeField] private float maxHeat = 100f;
        [SerializeField] private float passiveCoolRate = 20f;
        [SerializeField] private float emergencyCoolRate = 40f;
        [SerializeField] private float warningThreshold = 0.8f;

        public float HeatLevel { get; private set; }
        public bool IsOverheated => HeatLevel >= maxHeat;

        public event Action<float> OnHeatChanged; // valor normalizado 0-1
        public event Action OnHeatWarning;

        private bool _hasWarned;

        public void AddHeat(float amount)
        {
            HeatLevel = Mathf.Clamp(HeatLevel + amount, 0f, maxHeat);
            DispatchHeatEvents();
        }

        public void Tick(bool canCool)
        {
            if (IsOverheated)
            {
                return;
            }

            float coolRate = canCool ? passiveCoolRate : 0f;
            HeatLevel = Mathf.Max(0f, HeatLevel - coolRate * Time.deltaTime);

            if (canCool && GameManager.Instance != null && GameManager.Instance.IsGameOver)
            {
                HeatLevel = Mathf.Max(0f, HeatLevel - emergencyCoolRate * Time.deltaTime);
            }

            DispatchHeatEvents();
        }

        public void ForceCooldown(float amount)
        {
            HeatLevel = Mathf.Clamp(HeatLevel - amount, 0f, maxHeat);
            DispatchHeatEvents(resetWarning: true);
        }

        public void ResetHeat()
        {
            HeatLevel = 0f;
            _hasWarned = false;
            DispatchHeatEvents(resetWarning: true);
        }

        private void DispatchHeatEvents(bool resetWarning = false)
        {
            if (resetWarning)
            {
                _hasWarned = false;
            }

            float normalized = Mathf.Approximately(maxHeat, 0f) ? 0f : HeatLevel / maxHeat;
            OnHeatChanged?.Invoke(normalized);

            if (!_hasWarned && normalized >= warningThreshold && !IsOverheated)
            {
                _hasWarned = true;
                OnHeatWarning?.Invoke();
            }

            if (normalized < warningThreshold * 0.6f)
            {
                _hasWarned = false;
            }
        }
    }
}

