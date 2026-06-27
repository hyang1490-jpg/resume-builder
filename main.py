import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS 允许源通过环境变量 ALLOWED_ORIGINS 配置（逗号分隔），默认 "*"。
# 简历涉及个人信息（PII），部署上线前建议把它收紧到实际前端域名。
_origins_env = os.environ.get("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # 本应用不使用 cookie/凭证。通配源 "*" 与 allow_credentials=True 不能共存
    # （浏览器会拒绝），因此这里显式关闭凭证。
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResumeData(BaseModel):
    name: str
    skills: str


@app.get("/health")
def health():
    """健康检查：返回 200 表示后端在线。"""
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze_resume(data: ResumeData):
    # ⚠️ 模板化占位，并非真实分析：这里只是把输入套进固定文案返回。
    # 真实的简历完整性检查器留待路线图 Phase B（B5）实现。
    analysis_result = f"AirSense 引擎已收到 {data.name} 的数据。特征扫描完毕：该开发者精通 {data.skills}，展现出极强的 ENTP 跨界降维打击潜力！"

    return {
        "status": "success",
        "message": analysis_result
    }
