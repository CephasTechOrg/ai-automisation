from fastapi import APIRouter
from app.api.v1.routes import admin, owner, public, jobs
api_router=APIRouter()
api_router.include_router(admin.router,prefix='/admin',tags=['Admin'])
api_router.include_router(owner.router,prefix='/owner',tags=['Owner'])
api_router.include_router(public.router,prefix='/public',tags=['Public Forms'])
api_router.include_router(jobs.router,prefix='/jobs',tags=['Jobs'])
