from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, HttpUrl, Field


LayoutType = Literal["full", "split"]
ClipStatus = Literal["selected", "rendered", "published", "failed"]
JobStatus = Literal["new", "processing", "ready", "published", "failed"]


class Clip(BaseModel):
	id: str
	start_s: float = Field(..., ge=0)
	end_s: float = Field(..., gt=0)
	layout_type: LayoutType = "split"
	retention_overlay: bool = True
	output_path: Optional[str] = None
	published_url: Optional[HttpUrl] = None
	status: ClipStatus = "selected"
	created_at: datetime = Field(default_factory=datetime.utcnow)
	updated_at: datetime = Field(default_factory=datetime.utcnow)


class Job(BaseModel):
	id: str
	source_title: str
	source_channel: str
	source_url: HttpUrl
	thumbnail_url: Optional[HttpUrl] = None
	duration_s: Optional[float] = None
	status: JobStatus = "new"
	selected_clips: List[Clip] = []
	is_vertical_composed: bool = False
	created_at: datetime = Field(default_factory=datetime.utcnow)
	updated_at: datetime = Field(default_factory=datetime.utcnow)

	@property
	def clip_count(self) -> int:
		return len(self.selected_clips)


class JobSummary(BaseModel):
	id: str
	source_title: str
	source_channel: str
	source_url: HttpUrl
	thumbnail_url: Optional[HttpUrl] = None
	duration_s: Optional[float] = None
	status: JobStatus
	clip_count: int
	published_count: int


class UpdateClipStatusPayload(BaseModel):
	status: ClipStatus
	published_url: Optional[HttpUrl] = None


class UpdateJobStatusPayload(BaseModel):
	status: JobStatus