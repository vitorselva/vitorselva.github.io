from __future__ import annotations

import json
from pathlib import Path
from typing import List, Optional

from pydantic import TypeAdapter

from .models import Job


DATA_PATH = (Path(__file__).resolve().parent.parent / "data" / "jobs.json").resolve()
DATA_PATH.parent.mkdir(parents=True, exist_ok=True)


def load_jobs() -> List[Job]:
	if not DATA_PATH.exists():
		return []
	with DATA_PATH.open("r", encoding="utf-8") as f:
		data = json.load(f)
	adapter = TypeAdapter(list[Job])
	return adapter.validate_python(data)


def save_jobs(jobs: List[Job]) -> None:
	adapter = TypeAdapter(list[Job])
	data = adapter.dump_python(jobs, by_alias=True)
	with DATA_PATH.open("w", encoding="utf-8") as f:
		json.dump(data, f, ensure_ascii=False, indent=2)


def find_job(jobs: List[Job], job_id: str) -> Optional[Job]:
	for job in jobs:
		if job.id == job_id:
			return job
	return None