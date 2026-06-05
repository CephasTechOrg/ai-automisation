from fastapi import APIRouter, Header
from app.core.config import settings
from app.core.errors import UnauthorizedError
router=APIRouter()
@router.post('/followups/run')
async def run_followups(x_job_secret:str|None=Header(default=None)):
    if x_job_secret != settings.FOLLOWUP_JOB_SECRET: raise UnauthorizedError('Invalid job secret')
    return {'ok':True,'data':{'processed':0,'note':'scheduler foundation only'}}
