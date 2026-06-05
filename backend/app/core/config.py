from functools import cached_property
from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    model_config=SettingsConfigDict(env_file='.env', case_sensitive=True, extra='ignore')
    APP_NAME:str='LeadFlow Pro API'; APP_ENV:str='development'; API_V1_PREFIX:str='/api/v1'; FRONTEND_URL:str='http://localhost:3000'; CORS_ORIGINS:str='http://localhost:3000'
    DATABASE_URL:str; SUPABASE_URL:str; SUPABASE_SERVICE_ROLE_KEY:str; SUPABASE_JWT_AUDIENCE:str='authenticated'; SUPABASE_JWKS_URL:str
    RESEND_API_KEY:str|None=None; RESEND_FROM_EMAIL:str='LeadFlow Pro <notifications@example.com>'; RESEND_REPLY_TO:str|None=None
    DEEPSEEK_API_KEY:str|None=None; DEEPSEEK_BASE_URL:str='https://api.deepseek.com'; DEEPSEEK_MODEL:str='deepseek-v4-flash'; DEEPSEEK_REASONING_MODEL:str='deepseek-v4-pro'
    PUBLIC_FORM_RATE_LIMIT_PER_MINUTE:int=10; FOLLOWUP_JOB_SECRET:str='change-me'
    @cached_property
    def cors_origins_list(self): return [x.strip() for x in self.CORS_ORIGINS.split(',') if x.strip()]
settings=Settings()
