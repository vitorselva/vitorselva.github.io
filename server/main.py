from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from .models import (
	Job,
	JobSummary,
	UpdateClipStatusPayload,
	UpdateJobStatusPayload,
)
from .storage import find_job, load_jobs, save_jobs


BASE_DIR = Path(__file__).resolve().parent.parent
DASHBOARD_DIR = (BASE_DIR / "dashboard").resolve()

app = FastAPI(title="TikTok Clips Pipeline Dashboard", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
	return {"status": "ok"}


@app.get("/")
def root() -> RedirectResponse:
	return RedirectResponse(url="/dashboard")


# Static dashboard
app.mount("/dashboard", StaticFiles(directory=str(DASHBOARD_DIR), html=True), name="dashboard")


@app.get("/api/jobs", response_model=List[JobSummary])
def api_list_jobs() -> List[JobSummary]:
	jobs = load_jobs()
	summaries: List[JobSummary] = []
	for job in jobs:
		published_count = sum(1 for c in job.selected_clips if c.status == "published")
		summaries.append(
			JobSummary(
				id=job.id,
				source_title=job.source_title,
				source_channel=job.source_channel,
				source_url=job.source_url,
				thumbnail_url=job.thumbnail_url,
				duration_s=job.duration_s,
				status=job.status,
				clip_count=len(job.selected_clips),
				published_count=published_count,
			)
		)
	return summaries


@app.get("/api/jobs/{job_id}", response_model=Job)
def api_get_job(job_id: str) -> Job:
	jobs = load_jobs()
	job = find_job(jobs, job_id)
	if not job:
		raise HTTPException(status_code=404, detail="Job not found")
	return job


@app.post("/api/jobs/{job_id}/status")
def api_update_job_status(job_id: str, payload: UpdateJobStatusPayload) -> dict:
	jobs = load_jobs()
	job = find_job(jobs, job_id)
	if not job:
		raise HTTPException(status_code=404, detail="Job not found")
	job.status = payload.status
	job.updated_at = datetime.utcnow()
	save_jobs(jobs)
	return {"ok": True}


@app.post("/api/jobs/{job_id}/clips/{clip_id}/status")
def api_update_clip_status(job_id: str, clip_id: str, payload: UpdateClipStatusPayload) -> dict:
	jobs = load_jobs()
	job = find_job(jobs, job_id)
	if not job:
		raise HTTPException(status_code=404, detail="Job not found")
	clip = next((c for c in job.selected_clips if c.id == clip_id), None)
	if not clip:
		raise HTTPException(status_code=404, detail="Clip not found")
	clip.status = payload.status
	if payload.published_url:
		clip.published_url = payload.published_url
	clip.updated_at = datetime.utcnow()
	save_jobs(jobs)
	return {"ok": True}