const { useState, useEffect } = React;

const STORAGE_KEY = "sparkresume:data:v1";

// 默认数据为空白占位，避免内置真人 persona 误导用户或被误导出。
// 各输入框通过 placeholder 提供填写示例。
const DEFAULT_DATA = {
  personalInfo: {
    name: "",
    title: "",
    email: "",
    phone: "",
    github: "",
    website: "",
    summary: ""
  },
  workExperience: [
    { id: "w1", company: "", position: "", startDate: "", endDate: "", description: "" }
  ],
  education: [
    { id: "e1", school: "", degree: "", major: "", startDate: "", endDate: "" }
  ],
  skills: ""
};

// 基础结构校验：保证恢复/导入的数据形状可用，避免坏数据导致白屏。
function isValidData(d) {
  return !!d && typeof d === "object"
    && !!d.personalInfo && typeof d.personalInfo === "object"
    && Array.isArray(d.workExperience)
    && Array.isArray(d.education)
    && typeof d.skills === "string";
}

// 从 localStorage 读取已保存的简历；失败或格式不符时返回 null。
function loadData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidData(parsed) ? parsed : null;
  } catch (e) {
    return null;
  }
}

// 后端地址：默认指向本地 FastAPI 服务 (main.py，uvicorn 默认 8000 端口)。
// 部署到其他环境时，可在 index.html 中设置 window.API_BASE 覆盖。
const API_BASE = (typeof window !== 'undefined' && window.API_BASE) || "http://localhost:8000";

const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  // 惰性初始化：优先从 localStorage 恢复上次编辑的内容。
  const [data, setData] = useState(() => loadData() || DEFAULT_DATA);

  const [aiFeedback, setAiFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 自动保存：data 变化即写入 localStorage，刷新不丢失。
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // 隐私模式或配额超限等写入失败时静默忽略，不影响编辑。
    }
  }, [data]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (isValidData(parsed)) setData(parsed);
        else window.alert("导入失败：文件格式不正确（缺少必要字段）。");
      } catch (err) {
        window.alert("导入失败：无法解析 JSON 文件。");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // 允许重复导入同一文件
  };

  const handleReset = () => {
    if (window.confirm("确定要清空所有内容、重置为空白简历吗？此操作不可撤销。")) {
      setData(DEFAULT_DATA);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiFeedback("AirSense 本地算力引擎启动中...");
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.personalInfo.name, skills: data.skills }),
      });
      if (!response.ok) {
        setAiFeedback(`🚨 后端返回错误（HTTP ${response.status}）。请稍后重试或检查服务端日志。`);
        return;
      }
      const result = await response.json();
      setAiFeedback(result.message);
    } catch (error) {
      setAiFeedback("🚨 呼叫后端失败！请检查 Python 服务器终端是否正在运行。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  // 仅在数据变化时重建图标（增删工作/教育条目会引入新的 <i data-lucide>），
  // 避免无依赖数组导致每次渲染都全量重扫图标。
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [data]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [name]: value } }));
  };

  const handleSkillsChange = (e) => setData(prev => ({ ...prev, skills: e.target.value }));

  const handleWorkExpChange = (id, field, value) => {
    setData(prev => ({ ...prev, workExperience: prev.workExperience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp) }));
  };

  const addWorkExp = () => setData(prev => ({ ...prev, workExperience: [...prev.workExperience, { id: generateId(), company: "", position: "", startDate: "", endDate: "", description: "" }] }));
  const removeWorkExp = (id) => setData(prev => ({ ...prev, workExperience: prev.workExperience.filter(exp => exp.id !== id) }));

  // 交换数组中相邻两项的位置（dir = -1 上移 / +1 下移），越界则原样返回。
  const moveItem = (arr, id, dir) => {
    const i = arr.findIndex(x => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return arr;
    const next = arr.slice();
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };
  const moveWorkExp = (id, dir) => setData(prev => ({ ...prev, workExperience: moveItem(prev.workExperience, id, dir) }));

  const handleEduChange = (id, field, value) => {
    setData(prev => ({ ...prev, education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu) }));
  };
  const addEdu = () => setData(prev => ({ ...prev, education: [...prev.education, { id: generateId(), school: "", degree: "", major: "", startDate: "", endDate: "" }] }));
  const removeEdu = (id) => setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  const moveEdu = (id, dir) => setData(prev => ({ ...prev, education: moveItem(prev.education, id, dir) }));

  return (
    <div className="app-container">
      <div className="form-section">
        <div className="header">
          <h1>闪耀简历 SparkResume</h1>
          <p>实时编辑，即刻所现所得的高级定制简历。</p>
        </div>

        <div className="form-card">
          <h2 className="card-title"><i data-lucide="user" aria-hidden="true"></i> 基本信息</h2>
          <div className="input-row">
            <div className="input-group"><label htmlFor="pi-name">姓名</label><input id="pi-name" type="text" name="name" placeholder="张三" value={data.personalInfo.name} onChange={handlePersonalInfoChange} /></div>
            <div className="input-group"><label htmlFor="pi-title">求职意向 / 职位</label><input id="pi-title" type="text" name="title" placeholder="前端开发工程师" value={data.personalInfo.title} onChange={handlePersonalInfoChange} /></div>
          </div>
          <div className="input-row">
            <div className="input-group"><label htmlFor="pi-phone">联系电话</label><input id="pi-phone" type="tel" inputMode="tel" name="phone" placeholder="138-0000-0000" value={data.personalInfo.phone} onChange={handlePersonalInfoChange} /></div>
            <div className="input-group"><label htmlFor="pi-email">邮箱</label><input id="pi-email" type="email" inputMode="email" name="email" placeholder="you@example.com" value={data.personalInfo.email} onChange={handlePersonalInfoChange} /></div>
          </div>
          <div className="input-row">
            <div className="input-group"><label htmlFor="pi-website">个人主页</label><input id="pi-website" type="text" name="website" placeholder="example.com" value={data.personalInfo.website} onChange={handlePersonalInfoChange} /></div>
            <div className="input-group"><label htmlFor="pi-github">GitHub</label><input id="pi-github" type="text" name="github" placeholder="github.com/yourname" value={data.personalInfo.github} onChange={handlePersonalInfoChange} /></div>
          </div>
          <div className="input-group"><label htmlFor="pi-summary">个人总结</label><textarea id="pi-summary" name="summary" placeholder="一句话概括你的核心优势与求职目标……" value={data.personalInfo.summary} onChange={handlePersonalInfoChange}></textarea></div>
        </div>

        <div className="form-card">
          <h2 className="card-title"><i data-lucide="briefcase" aria-hidden="true"></i> 工作经历</h2>
          {data.workExperience.map((exp, index) => (
            <div key={exp.id} className="list-item">
              <div className="list-item-header">
                <span className="item-index">经历 {index + 1}</span>
                <span className="list-item-actions">
                  <button type="button" className="btn-icon" aria-label={`上移第 ${index + 1} 段工作经历`} disabled={index === 0} onClick={() => moveWorkExp(exp.id, -1)}><i data-lucide="arrow-up" aria-hidden="true" style={{ width: 16, height: 16 }}></i></button>
                  <button type="button" className="btn-icon" aria-label={`下移第 ${index + 1} 段工作经历`} disabled={index === data.workExperience.length - 1} onClick={() => moveWorkExp(exp.id, 1)}><i data-lucide="arrow-down" aria-hidden="true" style={{ width: 16, height: 16 }}></i></button>
                  <button type="button" className="btn-icon" aria-label={`删除第 ${index + 1} 段工作经历`} onClick={() => removeWorkExp(exp.id)}><i data-lucide="trash-2" aria-hidden="true" style={{ width: 16, height: 16 }}></i></button>
                </span>
              </div>
              <div className="input-row">
                <div className="input-group"><label htmlFor={`work-company-${exp.id}`}>公司名称</label><input id={`work-company-${exp.id}`} type="text" placeholder="某某科技有限公司" value={exp.company} onChange={(e) => handleWorkExpChange(exp.id, 'company', e.target.value)} /></div>
                <div className="input-group"><label htmlFor={`work-position-${exp.id}`}>担任职位</label><input id={`work-position-${exp.id}`} type="text" placeholder="前端开发工程师" value={exp.position} onChange={(e) => handleWorkExpChange(exp.id, 'position', e.target.value)} /></div>
              </div>
              <div className="input-row">
                <div className="input-group"><label htmlFor={`work-start-${exp.id}`}>开始时间</label><input id={`work-start-${exp.id}`} type="text" placeholder="2023-09" value={exp.startDate} onChange={(e) => handleWorkExpChange(exp.id, 'startDate', e.target.value)} /></div>
                <div className="input-group"><label htmlFor={`work-end-${exp.id}`}>结束时间</label><input id={`work-end-${exp.id}`} type="text" placeholder="至今" value={exp.endDate} onChange={(e) => handleWorkExpChange(exp.id, 'endDate', e.target.value)} /></div>
              </div>
              <div className="input-group"><label htmlFor={`work-desc-${exp.id}`}>工作职责与业绩</label><textarea id={`work-desc-${exp.id}`} placeholder="- 用一句话描述你的职责与可量化的成果……" value={exp.description} onChange={(e) => handleWorkExpChange(exp.id, 'description', e.target.value)}></textarea></div>
            </div>
          ))}
          <button type="button" className="btn btn-outline" onClick={addWorkExp} style={{ width: '100%' }}><i data-lucide="plus" aria-hidden="true" style={{ width: 18, height: 18 }}></i> 添加工作经历</button>
        </div>

        <div className="form-card">
          <h2 className="card-title"><i data-lucide="graduation-cap" aria-hidden="true"></i> 教育背景</h2>
          {data.education.map((edu, index) => (
            <div key={edu.id} className="list-item">
              <div className="list-item-header">
                <span className="item-index">教育 {index + 1}</span>
                <span className="list-item-actions">
                  <button type="button" className="btn-icon" aria-label={`上移第 ${index + 1} 段教育背景`} disabled={index === 0} onClick={() => moveEdu(edu.id, -1)}><i data-lucide="arrow-up" aria-hidden="true" style={{ width: 16, height: 16 }}></i></button>
                  <button type="button" className="btn-icon" aria-label={`下移第 ${index + 1} 段教育背景`} disabled={index === data.education.length - 1} onClick={() => moveEdu(edu.id, 1)}><i data-lucide="arrow-down" aria-hidden="true" style={{ width: 16, height: 16 }}></i></button>
                  <button type="button" className="btn-icon" aria-label={`删除第 ${index + 1} 段教育背景`} onClick={() => removeEdu(edu.id)}><i data-lucide="trash-2" aria-hidden="true" style={{ width: 16, height: 16 }}></i></button>
                </span>
              </div>
              <div className="input-row">
                <div className="input-group"><label htmlFor={`edu-school-${edu.id}`}>学校名称</label><input id={`edu-school-${edu.id}`} type="text" placeholder="某某大学" value={edu.school} onChange={(e) => handleEduChange(edu.id, 'school', e.target.value)} /></div>
                <div className="input-group"><label htmlFor={`edu-degree-${edu.id}`}>学历/学位</label><input id={`edu-degree-${edu.id}`} type="text" placeholder="本科" value={edu.degree} onChange={(e) => handleEduChange(edu.id, 'degree', e.target.value)} /></div>
              </div>
              <div className="input-group"><label htmlFor={`edu-major-${edu.id}`}>专业</label><input id={`edu-major-${edu.id}`} type="text" placeholder="计算机科学与技术" value={edu.major} onChange={(e) => handleEduChange(edu.id, 'major', e.target.value)} /></div>
              <div className="input-row">
                <div className="input-group"><label htmlFor={`edu-start-${edu.id}`}>开始时间</label><input id={`edu-start-${edu.id}`} type="text" placeholder="2019-09" value={edu.startDate} onChange={(e) => handleEduChange(edu.id, 'startDate', e.target.value)} /></div>
                <div className="input-group"><label htmlFor={`edu-end-${edu.id}`}>结束时间</label><input id={`edu-end-${edu.id}`} type="text" placeholder="2023-06" value={edu.endDate} onChange={(e) => handleEduChange(edu.id, 'endDate', e.target.value)} /></div>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-outline" onClick={addEdu} style={{ width: '100%' }}><i data-lucide="plus" aria-hidden="true" style={{ width: 18, height: 18 }}></i> 添加教育背景</button>
        </div>

        <div className="form-card">
          <h2 className="card-title"><i data-lucide="code" aria-hidden="true"></i> 专业技能</h2>
          <div className="input-group"><label htmlFor="skills-list">技能列表</label><textarea id="skills-list" placeholder="用逗号分隔，例如：JavaScript, React, Node.js, Git" value={data.skills} onChange={handleSkillsChange}></textarea></div>
        </div>
      </div>

      <div className="preview-section">
        <div className="preview-actions">
          <button type="button" className="btn btn-primary" onClick={handleDownloadPdf}>
            <i data-lucide="download" aria-hidden="true" style={{ width: 18, height: 18 }}></i> 导出矢量 PDF
          </button>
          <button type="button" className="btn btn-outline" onClick={handleExportJson}>
            <i data-lucide="save" aria-hidden="true" style={{ width: 18, height: 18 }}></i> 导出数据 (JSON)
          </button>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            <i data-lucide="upload" aria-hidden="true" style={{ width: 18, height: 18 }}></i> 导入数据
            <input type="file" accept="application/json,.json" onChange={handleImportJson} style={{ display: 'none' }} />
          </label>
          <button type="button" className="btn btn-outline" onClick={handleReset}>
            <i data-lucide="rotate-ccw" aria-hidden="true" style={{ width: 18, height: 18 }}></i> 重置
          </button>
        </div>

        <div className="ai-box" style={{ width: '100%', maxWidth: '800px', margin: '16px auto 24px auto', padding: '16px', backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span style={{ color: '#ef4444' }}>⚡</span> AirSense 简历潜能评估
            </h3>
            <button onClick={handleAnalyze} disabled={isAnalyzing}
              className={`px-4 py-2 rounded font-bold text-sm whitespace-nowrap transition-all ${isAnalyzing ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"}`}
              style={{ border: 'none' }}>
              {isAnalyzing ? "算力扫描中..." : "一键调用 AI 分析"}
            </button>
          </div>
          {aiFeedback && (<div style={{ padding: '12px', backgroundColor: 'black', borderRadius: '4px', border: '1px solid #2d3748', color: '#4ade80', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{aiFeedback}</div>)}
        </div>

        <div className="resume-paper">
          <div className="resume-header">
            <div>
              <h1 className="resume-name">{data.personalInfo.name || '姓名'}</h1>
              <div className="resume-title">{data.personalInfo.title || '求职意向/职位'}</div>
            </div>
            <div className="resume-contact">
              {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
              {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
              {data.personalInfo.website && <div>{data.personalInfo.website}</div>}
              {data.personalInfo.github && <div>{data.personalInfo.github}</div>}
            </div>
          </div>

          {data.personalInfo.summary && (
            <div className="resume-section">
              <div className="resume-section-title">个人总结</div>
              <div className="resume-item"><div className="resume-item-desc">{data.personalInfo.summary}</div></div>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="resume-section">
              <div className="resume-section-title">工作经历</div>
              {data.workExperience.map((exp) => (
                <div className="resume-item" key={"preview-w-" + exp.id}>
                  <div className="resume-item-header">
                    <div className="resume-item-title">{exp.company || '公司名称'}</div>
                    <div className="resume-item-date">{exp.startDate} {exp.startDate && exp.endDate ? ' - ' : ''} {exp.endDate}</div>
                  </div>
                  <div className="resume-item-subtitle" style={{ marginBottom: '0.4rem' }}>{exp.position}</div>
                  <div className="resume-item-desc">{exp.description}</div>
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="resume-section">
              <div className="resume-section-title">教育背景</div>
              {data.education.map((edu) => (
                <div className="resume-item" key={"preview-e-" + edu.id}>
                  <div className="resume-item-header">
                    <div className="resume-item-title">{edu.school || '学校名称'}</div>
                    <div className="resume-item-date">{edu.startDate} {edu.startDate && edu.endDate ? ' - ' : ''} {edu.endDate}</div>
                  </div>
                  <div className="resume-item-subtitle">{edu.major ? edu.major + ' · ' : ''}{edu.degree}</div>
                </div>
              ))}
            </div>
          )}

          {data.skills && (
            <div className="resume-section">
              <div className="resume-section-title">专业技能</div>
              <div className="skills-container">
                {data.skills.split(/[,，]+/).map(s => s.trim()).filter(Boolean).map((skill, i) => (<span className="skill-tag" key={skill + '-' + i}>{skill}</span>))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);