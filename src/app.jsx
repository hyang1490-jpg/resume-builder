const { useState, useEffect, useRef } = React;

const DEFAULT_DATA = {
  personalInfo: {
    name: "本小胆",
    title: "跨界 AI 开发者 / 全栈架构师",
    email: "your.email@example.com",
    phone: "138-XXXX-XXXX",
    github: "github.com/YourName",
    website: "airsense.ai (筹备中)",
    summary: "具备 ENTP 型创新思维的跨界 AI 开发者。现就读于 2+2 联合培养项目（已落地日本进行深度研习）。深谙“前沿技术+社会心理学”的跨界降维打击之道。目前正依托 RTX 5080 顶级本地算力，自主研发结合微表情分析的非语言信号洞察系统 (AirSense)。具备从 React 纯前端构建到 Python 底层基建的完整视野。目标近期突破 JLPT N1 与 TOEIC 800+，致力于用 AI 技术重塑个体价值。"
  },
  workExperience: [
    {
      id: "w1",
      company: "个人开源 / 核心研发项目",
      position: "AirSense (微表情与社会信号分析系统)",
      startDate: "2025-10",
      endDate: "至今",
      description: "- 主导架构设计：跨界结合社会心理学理论与 AI 视觉分析技术，打造智能辅助系统。\n- 全栈链路打通：独立完成 Windows 本地高配算力中心（Intel Ultra 9 + RTX 5080）的环境基建。\n- 现代化前端落地：运用 React 生态与组件化思维，构建 Web SPA 应用。"
    },
    {
      id: "w2",
      company: "全栈工程化演练中心",
      position: "独立全栈开发者",
      startDate: "2026-03",
      endDate: "至今",
      description: "- 零基础突围：成功独立部署本地微型服务器，克服端口映射与系统劫持等底层环境大坑。\n- UI/UX 掌控力：精通 CSS 现代化排版与动态主题切换，独立实现极客科技风高级界面。\n- AI协同开发：熟练掌握“人类输出顶层思维 + AI 执行底层逻辑”的超级个体开发范式。"
    }
  ],
  education: [
    {
      id: "e1",
      school: "厦门大学 & 日本高校 (2+2 联合培养项目)",
      degree: "本科",
      major: "跨界融合专业 (第三年在读)",
      startDate: "2023-09",
      endDate: "2027-06"
    }
  ],
  skills: "前端 React 全栈开发, Python 底层基建, RTX 5080 算力部署, 社会心理学与非语言博弈, ENTP 创新思维, JLPT N1 & TOEIC 800+ 备考中"
};

const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const printRef = useRef(null);

  const [aiFeedback, setAiFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiFeedback("AirSense 本地算力引擎启动中...");
    try {
      const response = await fetch("https://greedily-opacus-shantelle.ngrok-free.dev/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.personalInfo.name, skills: data.skills }),
      });
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

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

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

  const handleEduChange = (id, field, value) => {
    setData(prev => ({ ...prev, education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu) }));
  };
  const addEdu = () => setData(prev => ({ ...prev, education: [...prev.education, { id: generateId(), school: "", degree: "", major: "", startDate: "", endDate: "" }] }));
  const removeEdu = (id) => setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));

  return (
    <div className="app-container">
      {/* 极客物理外挂：干掉网址日期，压缩内边距，完美单页收官！ */}
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          body, html { background-color: #ffffff !important; margin: 0; padding: 0; }
          .form-section, .preview-actions, .ai-box { display: none !important; }
          .app-container, .preview-section { display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          /* 上下内边距从 10mm 压缩到了 8mm，给技能标签腾地方 */
          .resume-paper { 
            width: 100% !important; max-width: 100% !important; box-shadow: none !important; margin: 0 !important; padding: 8mm 15mm !important; 
          }
          .resume-paper, .resume-paper * { 
            color: #000000 !important; 
            font-weight: 500 !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          .resume-paper .resume-title, .resume-paper .resume-item-subtitle {
            color: #8b261f !important; font-weight: bold !important;
          }
        }
      `}</style>

      <div className="form-section">
        <div className="header">
          <h1>闪耀简历 SparkResume</h1>
          <p>实时编辑，即刻所现所得的高级定制简历。</p>
        </div>

        <div className="form-card">
          <h2 className="card-title"><i data-lucide="user"></i> 基本信息</h2>
          <div className="input-row">
            <div className="input-group"><label>姓名</label><input type="text" name="name" value={data.personalInfo.name} onChange={handlePersonalInfoChange} /></div>
            <div className="input-group"><label>求职意向 / 职位</label><input type="text" name="title" value={data.personalInfo.title} onChange={handlePersonalInfoChange} /></div>
          </div>
          <div className="input-row">
            <div className="input-group"><label>联系电话</label><input type="text" name="phone" value={data.personalInfo.phone} onChange={handlePersonalInfoChange} /></div>
            <div className="input-group"><label>邮箱</label><input type="email" name="email" value={data.personalInfo.email} onChange={handlePersonalInfoChange} /></div>
          </div>
          <div className="input-row">
            <div className="input-group"><label>个人主页</label><input type="text" name="website" value={data.personalInfo.website} onChange={handlePersonalInfoChange} /></div>
            <div className="input-group"><label>GitHub</label><input type="text" name="github" value={data.personalInfo.github} onChange={handlePersonalInfoChange} /></div>
          </div>
          <div className="input-group"><label>个人总结</label><textarea name="summary" value={data.personalInfo.summary} onChange={handlePersonalInfoChange}></textarea></div>
        </div>

        <div className="form-card">
          <h2 className="card-title"><i data-lucide="briefcase"></i> 工作经历</h2>
          {data.workExperience.map((exp, index) => (
            <div key={exp.id} className="list-item">
              <div className="list-item-header">
                <span className="item-index">经历 {index + 1}</span>
                <button className="btn-icon" onClick={() => removeWorkExp(exp.id)}><i data-lucide="trash-2" style={{ width: 16, height: 16 }}></i></button>
              </div>
              <div className="input-row">
                <div className="input-group"><label>公司名称</label><input type="text" value={exp.company} onChange={(e) => handleWorkExpChange(exp.id, 'company', e.target.value)} /></div>
                <div className="input-group"><label>担任职位</label><input type="text" value={exp.position} onChange={(e) => handleWorkExpChange(exp.id, 'position', e.target.value)} /></div>
              </div>
              <div className="input-row">
                <div className="input-group"><label>开始时间</label><input type="text" value={exp.startDate} onChange={(e) => handleWorkExpChange(exp.id, 'startDate', e.target.value)} /></div>
                <div className="input-group"><label>结束时间</label><input type="text" value={exp.endDate} onChange={(e) => handleWorkExpChange(exp.id, 'endDate', e.target.value)} /></div>
              </div>
              <div className="input-group"><label>工作职责与业绩</label><textarea value={exp.description} onChange={(e) => handleWorkExpChange(exp.id, 'description', e.target.value)}></textarea></div>
            </div>
          ))}
          <button className="btn btn-outline" onClick={addWorkExp} style={{ width: '100%' }}><i data-lucide="plus" style={{ width: 18, height: 18 }}></i> 添加工作经历</button>
        </div>

        <div className="form-card">
          <h2 className="card-title"><i data-lucide="graduation-cap"></i> 教育背景</h2>
          {data.education.map((edu, index) => (
            <div key={edu.id} className="list-item">
              <div className="list-item-header">
                <span className="item-index">教育 {index + 1}</span>
                <button className="btn-icon" onClick={() => removeEdu(edu.id)}><i data-lucide="trash-2" style={{ width: 16, height: 16 }}></i></button>
              </div>
              <div className="input-row">
                <div className="input-group"><label>学校名称</label><input type="text" value={edu.school} onChange={(e) => handleEduChange(edu.id, 'school', e.target.value)} /></div>
                <div className="input-group"><label>学历/学位</label><input type="text" value={edu.degree} onChange={(e) => handleEduChange(edu.id, 'degree', e.target.value)} /></div>
              </div>
              <div className="input-row">
                <div className="input-group"><label>专业</label><input type="text" value={edu.major} onChange={(e) => handleEduChange(edu.id, 'major', e.target.value)} /></div>
                <div className="input-group"><label>在校时间</label><input type="text" value={edu.startDate + ' - ' + edu.endDate} onChange={(e) => {
                  const parts = e.target.value.split('-');
                  if (parts.length >= 2) { handleEduChange(edu.id, 'startDate', parts[0].trim()); handleEduChange(edu.id, 'endDate', parts.slice(1).join('-').trim()); }
                  else { handleEduChange(edu.id, 'startDate', e.target.value); handleEduChange(edu.id, 'endDate', ''); }
                }} />
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-outline" onClick={addEdu} style={{ width: '100%' }}><i data-lucide="plus" style={{ width: 18, height: 18 }}></i> 添加教育背景</button>
        </div>

        <div className="form-card">
          <h2 className="card-title"><i data-lucide="code"></i> 专业技能</h2>
          <div className="input-group"><label>技能列表</label><textarea value={data.skills} onChange={handleSkillsChange}></textarea></div>
        </div>
      </div>

      <div className="preview-section">
        <div className="preview-actions">
          <button className="btn btn-primary" onClick={handleDownloadPdf}>
            <i data-lucide="download" style={{ width: 18, height: 18 }}></i> 导出矢量 PDF
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

        <div className="resume-paper" ref={printRef}>
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
                {data.skills.split(/[,，]+/).map((skill, i) => skill.trim() && (<span className="skill-tag" key={i}>{skill.trim()}</span>))}
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