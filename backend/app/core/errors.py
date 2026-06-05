from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
class AppError(Exception):
    def __init__(self,message,status_code=400,code='app_error'): self.message=message; self.status_code=status_code; self.code=code
class NotFoundError(AppError):
    def __init__(self,msg='Resource not found'): super().__init__(msg,404,'not_found')
class ForbiddenError(AppError):
    def __init__(self,msg='Forbidden'): super().__init__(msg,403,'forbidden')
class UnauthorizedError(AppError):
    def __init__(self,msg='Authentication required'): super().__init__(msg,401,'unauthorized')
def register_exception_handlers(app:FastAPI):
    @app.exception_handler(AppError)
    async def handler(_:Request, exc:AppError): return ORJSONResponse(status_code=exc.status_code, content={'ok':False,'error':{'code':exc.code,'message':exc.message}})
