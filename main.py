from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # 本应用不使用 cookie/凭证。通配源 "*" 与 allow_credentials=True 不能共存
    # （浏览器会拒绝），因此这里显式关闭凭证，使通配源合法生效。
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeData(BaseModel):
    name: str
    skills: str

@app.post("/api/analyze")
def analyze_resume(data: ResumeData):
    analysis_result = f"AirSense 引擎已收到 {data.name} 的数据。特征扫描完毕：该开发者精通 {data.skills}，展现出极强的 ENTP 跨界降维打击潜力！"
    
    return {
        "status": "success",
        "message": analysis_result
    }