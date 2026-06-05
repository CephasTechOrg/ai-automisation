from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.core.limiter import limiter

app = FastAPI(title=settings.APP_NAME, version="0.1.0", docs_url="/docs" if settings.APP_ENV != "production" else None)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
register_exception_handlers(app)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get('/health')
async def health():
    return {'status':'ok','service':settings.APP_NAME,'environment':settings.APP_ENV}
