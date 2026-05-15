import { useState, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell, AreaChart, Area, ReferenceLine } from "recharts";
import { Upload, AlertTriangle, AlertCircle, Info, CheckCircle, Clock, Cpu, Activity, FileText, Zap, ChevronRight, X, Search, Copy, Download, TrendingDown, GitCompare, TrendingUp, Minus, BarChart2, Award, Star, Target, RefreshCw, ShieldCheck, FileCode, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  error:   { fg:"#A32D2D", bg:"#FCEBEB", border:"#F09595", mid:"#E24B4A" },
  warning: { fg:"#633806", bg:"#FAEEDA", border:"#FAC775", mid:"#EF9F27" },
  info:    { fg:"#0C447C", bg:"#E6F1FB", border:"#85B7EB", mid:"#378ADD" },
  note:    { fg:"#27500A", bg:"#EAF3DE", border:"#97C459", mid:"#639922" },
};
const TOOL_LABEL = { design_compiler:"Design Compiler", genus:"Genus", primetime:"PrimeTime", icc2:"ICC2", innovus:"Innovus", unknown:"Unknown" };
const SEV_ICON   = { error:<AlertCircle size={13}/>, warning:<AlertTriangle size={13}/>, info:<Info size={13}/>, note:<CheckCircle size={13}/> };
const RUN_COLORS = ["#378ADD","#7F77DD","#E24B4A","#639922","#EF9F27","#D85A30","#1D9E75","#9333ea"];

// ── Shared UI components ───────────────────────────────────────────────────────
function Badge({ sev, label }) {
  const c = C[sev]||C.info;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:c.bg, color:c.fg, border:`1px solid ${c.border}`, whiteSpace:"nowrap" }}>{SEV_ICON[sev]}{label||sev}</span>;
}
function Card({ children, style={} }) {
  return <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:"18px 22px", ...style }}>{children}</div>;
}
function StatCard({ icon, label, value, sub, color="#378ADD" }) {
  return (
    <Card style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px" }}>
      <div style={{ width:42, height:42, borderRadius:10, background:color+"1a", display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>{icon}</div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:22, fontWeight:700, color:"#111", lineHeight:1.1 }}>{value}</div>
        <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>{label}</div>
        {sub && <div style={{ fontSize:10, color, marginTop:1, fontWeight:600 }}>{sub}</div>}
      </div>
    </Card>
  );
}
function SectionTitle({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:0.8, marginBottom:10 }}>{children}</div>;
}
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={e=>{ e.stopPropagation(); try{navigator.clipboard.writeText(text)}catch(e){} setCopied(true); setTimeout(()=>setCopied(false),1500); }}
      title="Copy" style={{ border:"none", background:"none", cursor:"pointer", padding:"2px 4px", color:copied?C.note.mid:"#9ca3af", display:"inline-flex", alignItems:"center" }}>
      {copied?<CheckCircle size={11}/>:<Copy size={11}/>}
    </button>
  );
}
// FIX #5: proper action buttons
function ActionBtn({ onClick, children, icon, variant="secondary" }) {
  const bg   = variant==="primary" ? "#0f172a" : "#f1f5f9";
  const col  = variant==="primary" ? "#f8fafc"  : "#374151";
  const bord = variant==="primary" ? "none"     : "1px solid #e2e8f0";
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
      background:bg, border:bord, borderRadius:8, fontSize:12, fontWeight:600, color:col, cursor:"pointer" }}>
      {icon}{children}
    </button>
  );
}

// ── SDC Tools UI helpers ───────────────────────────────────────────────────────
function ST({ children, style={} }) {
  return <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:0.8, marginBottom:8, ...style }}>{children}</div>;
}
function SDCSev({ sev, label }) {
  const c=C[sev]||C.info;
  const Icon=sev==="error"?AlertCircle:sev==="warning"?AlertTriangle:sev==="note"?CheckCircle:Info;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:c.bg, color:c.fg, border:`1px solid ${c.border}`, whiteSpace:"nowrap" }}><Icon size={11}/>{label}</span>;
}
function Inp({ value, onChange, placeholder, type="text", style={} }) {
  return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
    style={{ width:"100%", padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:12,
      color:"#374151", outline:"none", fontFamily:"monospace", background:"#fafafa", boxSizing:"border-box", ...style }}/>;
}
function Chk({ checked, onChange, label }) {
  return <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#374151", cursor:"pointer", userSelect:"none" }}>
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{ cursor:"pointer" }}/>{label}
  </label>;
}
function Sel({ value, onChange, children, style={} }) {
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{ width:"100%", padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:12, color:"#374151", background:"#fafafa", boxSizing:"border-box", ...style }}>
    {children}
  </select>;
}
function FField({ label, hint, children }) {
  return <div style={{ marginBottom:10 }}>
    {label&&<div style={{ fontSize:11, fontWeight:600, color:"#374151", marginBottom:4 }}>{label}</div>}
    {children}
    {hint&&<div style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>{hint}</div>}
  </div>;
}
function ColSec({ label, badge, open, onToggle, children }) {
  return (
    <Card style={{ marginBottom:10, padding:"12px 16px" }}>
      <button onClick={onToggle} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"none", border:"none", cursor:"pointer", padding:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <ST style={{ margin:0 }}>{label}</ST>
          {badge>0&&<span style={{ fontSize:10, background:C.info.bg, color:C.info.fg, padding:"1px 7px", borderRadius:20, fontWeight:700 }}>{badge}</span>}
        </div>
        {open?<ChevronUp size={14} color="#9ca3af"/>:<ChevronDown size={14} color="#9ca3af"/>}
      </button>
      {open&&<div style={{ marginTop:12 }}>{children}</div>}
    </Card>
  );
}
function InfoBox({ sev="info", children }) {
  const c=C[sev]||C.info;
  const Icon=sev==="warning"?AlertTriangle:sev==="error"?AlertCircle:Info;
  return <div style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:6, padding:"6px 10px", marginBottom:8, fontSize:11, color:c.fg, display:"flex", alignItems:"flex-start", gap:6 }}>
    <Icon size={12} style={{ marginTop:1, flexShrink:0 }}/><div>{children}</div>
  </div>;
}
function sdcDownload(content, filename) {
  const uri="data:text/plain;charset=utf-8,"+encodeURIComponent(content);
  const a=document.createElement("a"); a.setAttribute("href",uri); a.setAttribute("download",filename);
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ── FIX HINTS (extended) ───────────────────────────────────────────────────────
const FIX_HINTS = {
  "ELAB-302":"Cell reference not found. Check set_link_library includes all required .db files. Verify the referenced module is in your RTL source list.",
  "OPT-001": "Setup timing constraint not met. Try compile_ultra -retime, check set_max_delay on false paths, and verify clock uncertainty values in your SDC.",
  "OPT-110": "High fanout net detected. Add buffer tree using insert_buffer or set set_max_fanout constraint. Common on reset/enable/clock-enable nets.",
  "TIM-104": "Hold violation. Insert DELAY_X1/X2 cells on short paths. Use set_multicycle_path for known multi-cycle paths. Do NOT loosen hold constraints.",
  "UID-95":  "Undriven net. Run check_design -summary to find all undriven nets. Check RTL for missing port connections or incomplete always blocks.",
  "GEN-001": "Unresolved module. Verify HDL source list and set_hdl_search_path includes all directories.",
  "GEN-042": "Latch inferred — likely missing else branch in combinational always block. Use always_ff with synchronous reset to avoid latches.",
  "DRC-001": "DRC failure. Review metal spacing/width rules. Run signoff DRC with the correct rule deck for your process node.",
  "ROUTE-01":"Unrouted nets. Check for congestion hotspots and routing blockages. Adjust cell density or add routing channels.",
};

// ── Parser ─────────────────────────────────────────────────────────────────────
function parseLogText(text, filename="sample.log") {
  const lines = text.split("\n");
  const entries = [];
  const SEV_MAP = { error:"error", warning:"warning", information:"info", note:"note" };
  const patterns = [
    { re:/^\s*(Error|Warning|Information|Note)\s+\(([A-Z0-9_\-]+)\):\s*(.+)$/i, g:[1,2,3] },
    { re:/^\s*\*+(Error|Warning|Info|Note)\s*(?:\[([A-Z0-9_\-]+)\])?\s*:\s*(.+)$/i, g:[1,2,3] },
    { re:/^\[(?:[A-Z]+-)?([A-Z0-9_\-]+)\]\s*(ERROR|WARNING|INFO|NOTE):\s*(.+)$/i, g:[2,1,3] },
    { re:/^\s*(Error|Warning|Information|Note):\s*(.+)$/i, g:[1,null,2] },
  ];
  let tool = "unknown";
  if      (text.includes("Design Compiler")||text.includes("dc_shell"))  tool="design_compiler";
  else if (text.includes("Genus Synthesis")||text.includes("genus>"))    tool="genus";
  else if (text.includes("PrimeTime")||text.includes("pt_shell"))        tool="primetime";
  else if (text.includes("IC Compiler II")||text.includes("icc2_shell")) tool="icc2";
  else if (text.includes("Innovus")||text.includes("innovus>"))          tool="innovus";

  // FIX #6: parse synthesis date/time
  const stats = {};
  const cellM = text.match(/Total cell count\s*[:\s]+([\d,]+)/i);
  const areaM = text.match(/Design area\s*[:\s]+([\d,]+)/i);
  const netM  = text.match(/Net count\s*[:\s]+([\d,]+)/i);
  const wnsM  = text.match(/WNS\s*[=:]\s*([-\d.]+)/i);
  const tnsM  = text.match(/TNS\s*[=:]\s*([-\d.]+)/i);
  const nvpM  = text.match(/NVP\s*[=:]\s*(\d+)/i);
  const timeM = text.match(/Elapsed time:\s*([\d:]+)/i);
  const dateM = text.match(/(\w{3}\s+\d+\s+\d{4})/);
  if (cellM) stats.cells   = cellM[1];
  if (areaM) stats.area    = areaM[1];
  if (netM)  stats.nets    = netM[1];
  if (wnsM)  stats.wns     = parseFloat(wnsM[1]);
  if (tnsM)  stats.tns     = parseFloat(tnsM[1]);
  if (nvpM)  stats.nvp     = parseInt(nvpM[1]);
  if (timeM) stats.elapsed = timeM[1];
  if (dateM) stats.date    = dateM[1];

  lines.forEach((line, i) => {
    for (const p of patterns) {
      const m = line.match(p.re);
      if (m) {
        const sev  = SEV_MAP[(m[p.g[0]]||"").toLowerCase()]||"info";
        const code = p.g[1]?(m[p.g[1]]||null):null;
        const msg  = (m[p.g[2]]||"").trim();
        if (!msg) break;
        let cat = null;
        if (code) {
          if (/^TIM|^OPT-001/.test(code))    cat="timing";
          else if (/^ELAB/.test(code))        cat="elaboration";
          else if (/^UID|^GEN/.test(code))    cat="netlist";
          else if (/^DRC|^ROUTE/.test(code))  cat="physical";
          else if (/^OPT/.test(code))         cat="optimization";
        }
        if (!cat) {
          const ml = msg.toLowerCase();
          if (/timing|slack|setup|hold|wns|tns/.test(ml)) cat="timing";
          else if (/clock|cdc|domain/.test(ml))           cat="clock";
          else if (/undriven|unresolved|module|fanout/.test(ml)) cat="netlist";
        }
        entries.push({ id:String(i), line_number:i+1, severity:sev, code, message:msg, tool, category:cat, fix_hint:code?FIX_HINTS[code]:null });
        break;
      }
    }
  });

  const errors   = entries.filter(e=>e.severity==="error").length;
  const warnings = entries.filter(e=>e.severity==="warning").length;
  const infos    = entries.filter(e=>e.severity==="info").length;
  return { run_id:"run-1", filename, tool, stats, summary:{ tool, errors, warnings, infos, total:entries.length }, entries };
}

// ── Sample data ────────────────────────────────────────────────────────────────
const SAMPLE_LOG_TEXT = `Design Compiler Version R-2020.09\ndesign: AES_CORE\nError (ELAB-302): Cannot find design 'AES_SBOX' referenced in 'AES_CORE'. [aes_core.v:45]\nWarning (OPT-110): High fanout on net 'key_schedule[7]' (fanout=342).\nWarning (OPT-110): High fanout on net 'round_counter[3]' (fanout=198).\nWarning (OPT-110): High fanout on net 'rst_n' (fanout=512).\nError (TIM-104): Hold violation -0.234ns path FF_A/Q to FF_B/D.\nWarning: Unable to resolve reference 'glitch_filter' in library 'STDCELL'.\nInformation: Compiling module aes_mixcolumns (aes_mixcolumns.v:1)\nInformation: Compiling module aes_subbytes (aes_subbytes.v:1)\nError (UID-95): Undriven net 'output_valid' in module 'AES_CORE'.\nWarning (OPT-001): Setup timing not met: clk_core -> data_out. Slack = -1.23ns\nWarning: Cell 'BUF_X4' has no timing arc for transition low->high on pin 'A'.\nInformation: Total cell count: 45,231\nInformation: Design area: 12450 um^2\nInformation: Net count: 48920\nInformation: WNS = -1.23 ns\nInformation: TNS = -8.45 ns\nInformation: NVP = 6\nInformation: Elapsed time: 00:12:43\n`;
const SAMPLE_DATA = parseLogText(SAMPLE_LOG_TEXT, "aes_core_synth.log");

const SAMPLE_TIMING = {
  run_id:"t-1", filename:"aes_core_timing.rpt", tool:"primetime", wns:-1.23, tns:-8.45, nvp:6,
  clock_domains:[
    { name:"clk_core", period:5.0,  wns:-1.23, tns:-5.20, nvp:4 },
    { name:"clk_io",   period:10.0, wns:-0.45, tns:-3.25, nvp:2 },
    { name:"clk_pcie", period:4.0,  wns:0.12,  tns:0,     nvp:0 },
  ],
  paths:[
    { path_id:0, startpoint:"FF_AES_ROUND/Q",  endpoint:"FF_AES_SBOX_IN/D", clock:"clk_core", slack:-1.23, path_type:"setup", violated:true  },
    { path_id:1, startpoint:"FF_KEY_SCH/Q",    endpoint:"FF_ROUND_CTR/D",   clock:"clk_core", slack:-0.87, path_type:"setup", violated:true  },
    { path_id:2, startpoint:"FF_MIX_COL/Q",    endpoint:"FF_ADD_RK/D",      clock:"clk_core", slack:-0.65, path_type:"setup", violated:true  },
    { path_id:3, startpoint:"FF_DATA_IN/Q",    endpoint:"FF_AES_ROUND/D",   clock:"clk_core", slack:-0.44, path_type:"setup", violated:true  },
    { path_id:4, startpoint:"FF_IO_DATA/Q",    endpoint:"FF_BRIDGE/D",      clock:"clk_io",   slack:-0.45, path_type:"setup", violated:true  },
    { path_id:5, startpoint:"FF_IO_CTRL/Q",    endpoint:"FF_IO_STATUS/D",   clock:"clk_io",   slack:-0.31, path_type:"setup", violated:true  },
    { path_id:6, startpoint:"FF_PCIE_TX/Q",    endpoint:"FF_PCIE_BUF/D",    clock:"clk_pcie", slack:0.12,  path_type:"setup", violated:false },
    { path_id:7, startpoint:"FF_PCIE_RX/Q",    endpoint:"FF_PCIE_CTRL/D",   clock:"clk_pcie", slack:0.34,  path_type:"setup", violated:false },
  ],
};

const QOR_DEMO = [
  { rid:1, filename:"run_01_baseline.log", tool:"design_compiler", color:RUN_COLORS[0],
    summary:{ errors:5, warnings:7, infos:8, total:20 },
    stats:{ wns:-1.231, tns:-9.823, nvp:8, cells:"48,321", area:"14,230", nets:"51,887", elapsed:"00:12:43" } },
  { rid:2, filename:"run_02_opt1.log",     tool:"design_compiler", color:RUN_COLORS[1],
    summary:{ errors:3, warnings:6, infos:9, total:18 },
    stats:{ wns:-0.876, tns:-6.140, nvp:5, cells:"46,890", area:"13,870", nets:"50,124", elapsed:"00:14:21" } },
  { rid:3, filename:"run_03_opt2.log",     tool:"design_compiler", color:RUN_COLORS[2],
    summary:{ errors:0, warnings:3, infos:10, total:13 },
    stats:{ wns:-0.287, tns:-1.840, nvp:2, cells:"44,120", area:"12,940", nets:"47,310", elapsed:"00:16:54" } },
];

// ── DropZone ───────────────────────────────────────────────────────────────────
function DropZone({ onFile, label="Drop your log file here or click to browse", accept=".log,.txt", hint="Supports DC, Genus, PrimeTime, ICC2, Innovus" }) {
  const [drag, setDrag]       = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef();
  const handle = useCallback(file => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = e => { onFile(e.target.result, file.name); setLoading(false); };
    reader.readAsText(file);
  }, [onFile]);
  return (
    <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)handle(f);}}
      onClick={()=>!loading&&ref.current.click()}
      style={{ border:`2px dashed ${drag?"#378ADD":"#cbd5e1"}`, borderRadius:12, padding:"24px 20px",
        textAlign:"center", cursor:loading?"wait":"pointer", background:drag?"#E6F1FB":"#f9fafb",
        transition:"all 0.2s", marginBottom:18 }}>
      {loading
        ? <div style={{color:"#378ADD",fontSize:13,fontWeight:600}}>⏳ Parsing file…</div>
        : <><Upload size={22} color={drag?"#378ADD":"#9ca3af"} style={{margin:"0 auto 8px"}}/><div style={{fontSize:13,fontWeight:600,color:drag?"#378ADD":"#374151"}}>{label}</div><div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>{hint}</div></>}
      <input ref={ref} type="file" accept={accept} style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)handle(f);e.target.value="";}}/>
    </div>
  );
}

function RunBanner({ data }) {
  if (!data) return null;
  const { errors, warnings } = data.summary;
  const clean = errors===0;
  const c = clean?C.note:C.error;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 14px", borderRadius:8,
      background:c.bg, border:`1px solid ${c.border}`, color:c.fg, fontSize:12, fontWeight:500, marginBottom:16 }}>
      {clean?<CheckCircle size={15}/>:<AlertCircle size={15}/>}
      {clean?`Clean run — no errors. ${warnings} warning${warnings!==1?"s":""} to review.`
            :`${errors} error${errors!==1?"s":""} found · ${warnings} warning${warnings!==1?"s":""}. See Fixes Advisor for solutions.`}
    </div>
  );
}

// ── FIX #1: Page header with breadcrumb ───────────────────────────────────────
function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
      <div>
        <h1 style={{ fontSize:20, fontWeight:700, color:"#111", margin:0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize:12, color:"#6b7280", marginTop:3, margin:"3px 0 0" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display:"flex", gap:8, alignItems:"center" }}>{actions}</div>}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"overview", icon:<Activity size={16}/>,   label:"Overview"       },
  { id:"logs",     icon:<FileText size={16}/>,    label:"Log Analyzer"   },
  { id:"timing",   icon:<Clock size={16}/>,       label:"Timing Viewer"  },
  { id:"compare",  icon:<GitCompare size={16}/>,  label:"Run Comparison" },
  { id:"qor",      icon:<BarChart2 size={16}/>,   label:"QoR Trends"     },
  { id:"sdc",      icon:<ShieldCheck size={16}/>, label:"SDC Tools"      },
  { id:"advisor",  icon:<Zap size={16}/>,         label:"Fixes Advisor"  },
];

// FIX #3: Changelog tooltip
const WHATS_NEW = ["v0.6: 20 improvements applied","Slack histogram in Timing","Per-category diff in Comparison","WNS threshold alerts in QoR","Grouped errors in Log Analyzer"];

function Sidebar({ active, setActive }) {
  const [showChangelog, setShowChangelog] = useState(false);
  return (
    <div style={{ width:212, flexShrink:0, background:"#0f172a", minHeight:"100vh", display:"flex", flexDirection:"column", padding:"20px 0", position:"relative" }}>
      <div style={{ padding:"0 16px 20px", borderBottom:"1px solid #1e293b" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#1e3a5f", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid #2d5a8e" }}>
            <Cpu size={16} color="#378ADD"/>
          </div>
          <div>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:14, letterSpacing:-0.2 }}>VLSI Hub</div>
            <button onClick={()=>setShowChangelog(s=>!s)}
              style={{ color:"#475569", fontSize:9, background:"none", border:"none", cursor:"pointer", padding:0, textAlign:"left" }}>
              open source · v0.7.0 ↗
            </button>
          </div>
        </div>
        {showChangelog && (
          <div style={{ marginTop:10, background:"#1e293b", borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>What's new</div>
            {WHATS_NEW.map((w,i)=>(
              <div key={i} style={{ fontSize:10, color:"#94a3b8", marginBottom:3, display:"flex", gap:5 }}>
                <span style={{ color:"#1D9E75" }}>✓</span>{w}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex:1, paddingTop:10 }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#334155", textTransform:"uppercase", letterSpacing:1.2, padding:"0 16px 6px" }}>Navigation</div>
        {NAV.map(n=>(
          // FIX #2: tabIndex for keyboard nav
          <button key={n.id} onClick={()=>setActive(n.id)} tabIndex={0}
            onKeyDown={e=>e.key==="Enter"&&setActive(n.id)}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 16px",
              border:"none", cursor:"pointer", textAlign:"left",
              background:active===n.id?"#1e293b":"transparent",
              color:active===n.id?"#f1f5f9":"#64748b",
              borderLeft:active===n.id?"2px solid #378ADD":"2px solid transparent",
              fontSize:13, fontWeight:active===n.id?600:400, transition:"all 0.12s",
              outline:"none" }}>
            {n.icon}{n.label}
            {active===n.id && <div style={{ width:5, height:5, borderRadius:"50%", background:"#378ADD", marginLeft:"auto" }}/>}
          </button>
        ))}
      </div>
      <div style={{ margin:"0 10px 10px", background:"#0a1628", border:"1px solid #1e3a5f", borderRadius:10, padding:"11px 13px" }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#334155", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Supported tools</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 6px" }}>
          {["Design Compiler","Genus","PrimeTime","ICC2","Innovus"].map(t=>(
            <div key={t} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"#1D9E75", flexShrink:0 }}/>
              <span style={{ fontSize:9, color:"#475569" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Overview Page ──────────────────────────────────────────────────────────────
function OverviewPage({ logData, timingData, setActive }) {
  const d = logData||SAMPLE_DATA;
  const t = timingData||SAMPLE_TIMING;
  const s = d.summary;
  const isDemo = !logData;

  const catCounts = {};
  d.entries.filter(e=>e.severity==="error"||e.severity==="warning").forEach(e=>{
    const c=e.category||"other"; catCounts[c]=(catCounts[c]||0)+1;
  });
  const catData = Object.entries(catCounts).map(([name,count])=>({ name:name.charAt(0).toUpperCase()+name.slice(1), count })).sort((a,b)=>b.count-a.count);
  const catColors = ["#E24B4A","#EF9F27","#378ADD","#7F77DD","#639922","#D85A30"];

  return (
    <div>
      {/* FIX #1 */}
      <PageHeader title="Overview"
        subtitle={isDemo ? "Demo run: aes_core_synth.log — upload your own in Log Analyzer" : `Run: ${d.filename} · ${TOOL_LABEL[d.tool]||d.tool}${d.stats?.date?` · ${d.stats.date}`:""}${d.stats?.elapsed?` · ⏱ ${d.stats.elapsed}`:""}`}
      />

      {isDemo && (
        <div style={{ background:C.warning.bg, border:`1px solid ${C.warning.border}`, borderRadius:8, padding:"8px 14px", fontSize:12, color:C.warning.fg, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
          <Info size={13}/> Showing demo data. Upload a real log file in Log Analyzer to see your results.
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        <StatCard icon={<AlertCircle size={18}/>}   label="Errors"          value={s.errors}         color={C.error.mid}   sub={s.errors>0?"Needs attention":"Clean"}/>
        <StatCard icon={<AlertTriangle size={18}/>} label="Warnings"        value={s.warnings}       color={C.warning.mid}/>
        <StatCard icon={<Clock size={18}/>}         label="WNS (ns)"        value={(t.wns).toFixed(3)} color={t.wns<0?C.error.mid:C.note.mid} sub={t.wns<0?"Setup violated":"Timing met"}/>
        <StatCard icon={<Activity size={18}/>}      label="Violating paths" value={t.nvp}            color={t.nvp>0?C.error.mid:C.note.mid}/>
      </div>

      {/* FIX #4: always show design stats panel, use — for missing values */}
      <Card style={{ marginBottom:14, padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.8 }}>Design stats</div>
          {[
            ["Cells",    d.stats?.cells||"—"],
            ["Area",     d.stats?.area ? d.stats.area+" µm²" : "—"],
            ["Nets",     d.stats?.nets||"—"],
            ["TNS",      d.stats?.tns!=null ? d.stats.tns.toFixed(3)+" ns" : "—"],
            ["Elapsed",  d.stats?.elapsed||"—"],
          ].map(([k,v])=>(
            <div key={k} style={{ fontSize:13 }}>
              <span style={{ color:"#9ca3af", marginRight:4 }}>{k}</span>
              <span style={{ fontFamily:"monospace", fontWeight:700, color:"#374151" }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <Card>
          <SectionTitle>Issues by category (live)</SectionTitle>
          {catData.length>0
            ? <ResponsiveContainer width="100%" height={165}>
                <BarChart data={catData} barSize={28}>
                  <XAxis dataKey="name" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}} allowDecimals={false}/><Tooltip/>
                  <Bar dataKey="count" radius={[4,4,0,0]}>{catData.map((_,i)=><Cell key={i} fill={catColors[i%catColors.length]}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            : <div style={{color:"#9ca3af",fontSize:12,padding:"28px 0",textAlign:"center"}}>No categorized issues found in this log.</div>
          }
        </Card>
        <Card>
          <SectionTitle>QoR trend — WNS</SectionTitle>
          <ResponsiveContainer width="100%" height={165}>
            <LineChart data={[{run:"run_01",wns:-3.2},{run:"run_02",wns:-2.8},{run:"run_03",wns:-2.1},{run:"run_04",wns:-1.8},{run:"run_05",wns:-1.23}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
              <XAxis dataKey="run" tick={{fontSize:9}}/><YAxis tick={{fontSize:10}}/><Tooltip formatter={v=>[`${parseFloat(v).toFixed(3)} ns`,"WNS"]}/>
              <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 2"/>
              <Line type="monotone" dataKey="wns" stroke="#378ADD" strokeWidth={2} dot={{r:3,fill:"#378ADD"}}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{ marginBottom:14 }}>
        <SectionTitle>Clock domain health</SectionTitle>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ borderBottom:"2px solid #f3f4f6" }}>
            {["Clock","Period (ns)","WNS (ns)","TNS (ns)","Violations","Status"].map(h=>(
              <th key={h} style={{ textAlign:"left", padding:"5px 10px", fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{t.clock_domains.map(cd=>(
            <tr key={cd.name} style={{ borderBottom:"1px solid #f9fafb" }}>
              <td style={{ padding:"9px 10px", fontFamily:"monospace", fontWeight:600, color:"#374151", fontSize:11 }}>{cd.name}</td>
              <td style={{ padding:"9px 10px", color:"#6b7280" }}>{cd.period?.toFixed(1)??"—"}</td>
              <td style={{ padding:"9px 10px", fontWeight:700, color:cd.wns<0?C.error.mid:C.note.mid }}>{cd.wns.toFixed(3)}</td>
              <td style={{ padding:"9px 10px", color:cd.tns<0?C.error.mid:"#6b7280" }}>{cd.tns.toFixed(3)}</td>
              <td style={{ padding:"9px 10px" }}>{cd.nvp}</td>
              <td style={{ padding:"9px 10px" }}><Badge sev={cd.nvp>0?"error":"note"} label={cd.nvp>0?"Violated":"Clean"}/></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>

      {/* FIX #5: proper action buttons */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[
          { label:"View log errors", page:"logs",   icon:<FileText size={14}/>, desc:`${s.errors} errors · ${s.warnings} warnings` },
          { label:"Inspect timing",  page:"timing", icon:<Clock size={14}/>,    desc:`${t.nvp} violations · WNS ${t.wns.toFixed(3)} ns` },
        ].map(b=>(
          <button key={b.page} onClick={()=>setActive(b.page)} style={{
            background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:10,
            padding:"12px 16px", cursor:"pointer", textAlign:"left",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            transition:"border-color 0.15s, box-shadow 0.15s",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ color:"#378ADD" }}>{b.icon}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{b.label}</div>
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{b.desc}</div>
              </div>
            </div>
            <ChevronRight size={14} color="#9ca3af"/>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Log Analyzer ──────────────────────────────────────────────────────────────
function exportCSV(entries, filename) {
  const hdr  = ["Line","Severity","Code","Category","Message","Fix Hint"];
  const rows = entries.map(e=>[e.line_number, e.severity, e.code||"", e.category||"", `"${e.message.replace(/"/g,'""')}"`, `"${(e.fix_hint||"").replace(/"/g,'""')}"`]);
  const csv  = [hdr,...rows].map(r=>r.join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const a    = document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=filename.replace(/\.\w+$/,"")+"-issues.csv"; a.click();
}

function LogAnalyzerPage({ logData, setLogData }) {
  const [search,     setSearch]     = useState("");
  const [sevFilter,  setSevFilter]  = useState("all");
  const [catFilter,  setCatFilter]  = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  // FIX #9: group mode
  const [groupMode,  setGroupMode]  = useState(false);

  const data    = logData||SAMPLE_DATA;
  const isDemo  = !logData;
  const entries = data.entries;
  const cats    = ["all",...Array.from(new Set(entries.map(e=>e.category).filter(Boolean)))];

  const filtered = entries.filter(e=>{
    if (sevFilter!=="all" && e.severity!==sevFilter) return false;
    if (catFilter!=="all" && e.category!==catFilter) return false;
    if (search) { const q=search.toLowerCase(); if (!e.message.toLowerCase().includes(q)&&!(e.code||"").toLowerCase().includes(q)) return false; }
    return true;
  });

  // FIX #9: group repeated entries by code
  const grouped = (() => {
    if (!groupMode) return filtered.map(e=>({...e, count:1, isGroup:false}));
    const map = {};
    filtered.forEach(e=>{
      const key = e.code||e.message.slice(0,50);
      if (!map[key]) map[key] = {...e, count:0, isGroup:true};
      map[key].count++;
    });
    return Object.values(map).sort((a,b)=>b.count-a.count);
  })();

  const withHints = filtered.filter(e=>e.fix_hint).length;

  return (
    <div>
      <PageHeader title="Log Analyzer"
        subtitle={isDemo?"Demo mode — upload your own log file below":`${data.filename} · ${TOOL_LABEL[data.tool]||data.tool}${data.stats?.elapsed?` · ⏱ ${data.stats.elapsed}`:""}`}
        actions={<>
          {/* FIX #9: group toggle */}
          <button onClick={()=>setGroupMode(g=>!g)} style={{ padding:"6px 12px", borderRadius:8,
            border:`1.5px solid ${groupMode?"#378ADD":"#e2e8f0"}`,
            background:groupMode?"#E6F1FB":"#f1f5f9", color:groupMode?"#0C447C":"#374151",
            fontSize:11, fontWeight:600, cursor:"pointer" }}>
            {groupMode?"Grouped":"Group by code"}
          </button>
          {!isDemo && <ActionBtn onClick={()=>exportCSV(filtered, data.filename)} icon={<Download size={12}/>}>Export CSV</ActionBtn>}
        </>}
      />

      <DropZone onFile={(content,name)=>{ setLogData(parseLogText(content,name)); setSearch(""); setSevFilter("all"); setCatFilter("all"); setExpandedId(null); }}/>
      <RunBanner data={logData}/>

      {withHints>0 && (
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12, background:C.warning.bg, border:`1px solid ${C.warning.border}`, borderRadius:8, padding:"7px 13px", fontSize:12, color:C.warning.fg }}>
          <Zap size={12}/> <strong>{withHints} entries</strong> have fix suggestions — click any row to expand.
        </div>
      )}

      <div style={{ display:"flex", gap:7, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", gap:5 }}>
          {[{sev:"all",label:`All (${entries.length})`},{sev:"error",label:`Errors (${data.summary.errors})`},{sev:"warning",label:`Warnings (${data.summary.warnings})`},{sev:"info",label:`Info (${data.summary.infos})`}].map(f=>(
            <button key={f.sev} onClick={()=>setSevFilter(f.sev)} style={{
              padding:"4px 11px", borderRadius:20, border:"1.5px solid",
              borderColor:sevFilter===f.sev?(C[f.sev]?.mid||"#378ADD"):"#e5e7eb",
              background:sevFilter===f.sev?(C[f.sev]?.bg||"#E6F1FB"):"#fff",
              color:sevFilter===f.sev?(C[f.sev]?.fg||"#0C447C"):"#6b7280",
              fontSize:11, fontWeight:600, cursor:"pointer" }}>{f.label}</button>
          ))}
        </div>
        {cats.length>1 && (
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ padding:"4px 10px", borderRadius:8, border:"1px solid #e5e7eb", fontSize:11, color:"#374151", background:"#fff", cursor:"pointer" }}>
            {cats.map(c=><option key={c} value={c}>{c==="all"?"All categories":c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
        )}
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:7, background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"4px 10px", minWidth:160 }}>
          <Search size={12} color="#9ca3af"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages or codes…"
            style={{ border:"none", background:"transparent", outline:"none", fontSize:11, flex:1, color:"#374151" }}/>
          {search && <button onClick={()=>setSearch("")} style={{border:"none",background:"none",cursor:"pointer",padding:0}}><X size={10} color="#9ca3af"/></button>}
        </div>
      </div>

      <div style={{ fontSize:11, color:"#9ca3af", marginBottom:8 }}>
        Showing <strong style={{color:"#374151"}}>{grouped.length}</strong> {groupMode?"groups":"entries"} of <strong style={{color:"#374151"}}>{entries.length}</strong> total
        {sevFilter!=="all"&&` · ${sevFilter}s`}{catFilter!=="all"&&` · ${catFilter}`}{search&&` · "${search}"`}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ maxHeight:520, overflowY:"auto" }}>
          {grouped.length===0 && <div style={{ padding:32, textAlign:"center", color:"#9ca3af", fontSize:13 }}>No entries match your filters.</div>}
          {grouped.map((e,idx)=>(
            <div key={e.id+idx} style={{ borderBottom:"1px solid #f3f4f6", background:expandedId===e.id?"#f8fafc":"#fff" }}>
              <div onClick={()=>setExpandedId(expandedId===e.id?null:e.id)}
                style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", cursor:"pointer" }}>
                <div style={{ marginTop:1, flexShrink:0 }}><Badge sev={e.severity}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2, flexWrap:"wrap" }}>
                    {e.code && <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, background:"#f3f4f6", color:"#374151", padding:"1px 6px", borderRadius:4, display:"inline-flex", alignItems:"center", gap:2 }}>{e.code}<CopyBtn text={e.code}/></span>}
                    {/* FIX #9: occurrence badge */}
                    {e.count>1 && <span style={{ fontSize:10, background:"#e0e7ff", color:"#3730a3", padding:"1px 7px", borderRadius:20, fontWeight:700 }}>×{e.count}</span>}
                    {e.category && <span style={{ fontSize:9, color:"#9ca3af", textTransform:"uppercase" }}>{e.category}</span>}
                    {e.fix_hint && <span style={{ fontSize:9, color:C.warning.fg, background:C.warning.bg, padding:"1px 6px", borderRadius:10, border:`1px solid ${C.warning.border}` }}>has fix</span>}
                    <span style={{ fontSize:9, color:"#d1d5db", marginLeft:"auto" }}>L{e.line_number}</span>
                  </div>
                  {/* FIX #7: full message display, no truncation when expanded */}
                  <div style={{ fontSize:12, color:"#374151", lineHeight:1.5,
                    overflow:"hidden", textOverflow:expandedId===e.id?"unset":"ellipsis",
                    whiteSpace:expandedId===e.id?"normal":"nowrap",
                    wordBreak:expandedId===e.id?"break-word":"normal" }}>{e.message}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:3, flexShrink:0 }}>
                  <CopyBtn text={e.message}/>
                  <ChevronRight size={12} color="#9ca3af" style={{ transform:expandedId===e.id?"rotate(90deg)":"none", transition:"transform 0.15s" }}/>
                </div>
              </div>
              {expandedId===e.id && (
                <div style={{ margin:"0 14px 12px", display:"flex", flexDirection:"column", gap:7 }}>
                  {/* FIX #7: full message in monospace box */}
                  <div style={{ fontFamily:"monospace", fontSize:11, color:"#374151", background:"#f9fafb", borderRadius:6, padding:"8px 12px", wordBreak:"break-all", lineHeight:1.6, userSelect:"all" }}>{e.message}</div>
                  {/* FIX #8: line number as copyable reference */}
                  <div style={{ fontSize:10, color:"#9ca3af" }}>
                    Line <span style={{ fontFamily:"monospace", fontWeight:600, color:"#6b7280" }}>{e.line_number}</span>
                    <CopyBtn text={`Line ${e.line_number}: ${e.message}`}/>
                  </div>
                  {e.fix_hint
                    ? <div style={{ display:"flex", gap:8, background:C.warning.bg, border:`1px solid ${C.warning.border}`, borderRadius:8, padding:"10px 14px" }}>
                        <Zap size={13} color={C.warning.mid} style={{marginTop:2,flexShrink:0}}/>
                        <div><div style={{ fontSize:9, fontWeight:700, color:C.warning.fg, marginBottom:3, textTransform:"uppercase", letterSpacing:0.5 }}>Fix suggestion</div>
                        <div style={{ fontSize:12, color:C.warning.fg, lineHeight:1.6 }}>{e.fix_hint}</div></div>
                      </div>
                    : <div style={{ fontSize:11, color:"#9ca3af", fontStyle:"italic" }}>No specific fix hint. Check EDA tool documentation for this message.</div>
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Timing Parser ──────────────────────────────────────────────────────────────
function parseTimingRpt(text, filename) {
  const wnsM = text.match(/WNS\s*[=:]\s*([-\d.]+)/i);
  const tnsM = text.match(/TNS\s*[=:]\s*([-\d.]+)/i);
  const nvpM = text.match(/NVP\s*[=:]\s*(\d+)/i);
  const paths=[];
  const chunks = text.split(/(?=^Path\s+\d+\s*$)/m);
  let pid=0;
  for (const chunk of chunks) {
    const sp=chunk.match(/Startpoint:\s*(\S+)/i), ep=chunk.match(/Endpoint:\s*(\S+)/i);
    const sl=chunk.match(/slack\s+\(\s*(VIOLATED|MET)\s*\)\s+([-\d.]+)/i);
    const pg=chunk.match(/Path Group:\s*(\S+)/i), clk=chunk.match(/clocked by\s+(\S+)\)/i), pt=chunk.match(/Path Type:\s*(\S+)/i);
    if (!sp||!ep||!sl) continue;
    const slack=parseFloat(sl[2]);
    paths.push({ path_id:pid++, startpoint:sp[1], endpoint:ep[1],
      clock:pg?pg[1]:(clk?clk[1]:null), path_group:pg?pg[1]:null,
      slack, path_type:pt?pt[1].toLowerCase():"setup", violated:slack<0 });
  }
  // FIX #17: safe fallback — filter out null WNS
  const validPaths = paths.filter(p=>!isNaN(p.slack));
  const wns = wnsM ? parseFloat(wnsM[1]) : (validPaths.length>0?Math.min(...validPaths.map(p=>p.slack)):0);
  const tns = tnsM ? parseFloat(tnsM[1]) : validPaths.filter(p=>p.violated).reduce((s,p)=>s+p.slack,0);
  const nvp = nvpM ? parseInt(nvpM[1])   : validPaths.filter(p=>p.violated).length;

  // Build clock domains from paths
  const domMap={};
  for (const p of validPaths) {
    const k=p.clock||"unknown";
    if (!domMap[k]) domMap[k]={name:k,period:null,wns:0,tns:0,nvp:0,_init:true};
    if (p.violated) { domMap[k].nvp++; domMap[k].tns+=p.slack; if(domMap[k]._init||p.slack<domMap[k].wns){domMap[k].wns=p.slack;domMap[k]._init=false;} }
  }
  return { run_id:"t-upload", filename, tool:"primetime", wns, tns, nvp, paths:validPaths, clock_domains:Object.values(domMap) };
}

function TimingViewerPage({ timingData, setTimingData }) {
  const [filter,       setFilter]       = useState("all");
  const [selectedPath, setSelectedPath] = useState(null);
  const [slackSort,    setSlackSort]    = useState("asc");

  const t      = timingData||SAMPLE_TIMING;
  const isDemo = !timingData;

  let paths = filter==="violated"?t.paths.filter(p=>p.violated):filter==="met"?t.paths.filter(p=>!p.violated):[...t.paths];
  paths = [...paths].sort((a,b)=>slackSort==="asc"?a.slack-b.slack:b.slack-a.slack);

  // FIX #12: Slack histogram data
  const allSlacks = t.paths.map(p=>p.slack);
  const histBuckets = [-2,-1.5,-1,-0.5,0,0.5,1,1.5];
  const histData = histBuckets.map((lo,i)=>{
    const hi = histBuckets[i+1]??99;
    const count = allSlacks.filter(s=>s>=lo&&s<hi).length;
    return { range:`${lo.toFixed(1)}→${hi===99?"+":`${hi.toFixed(1)}`}`, count, violated:lo<0 };
  }).filter(b=>b.count>0);

  // FIX #13: export timing paths
  const exportTimingCSV = () => {
    const hdr  = ["Path ID","Startpoint","Endpoint","Clock","Slack (ns)","Type","Status"];
    const rows = paths.map(p=>[p.path_id, p.startpoint, p.endpoint, p.clock||"", p.slack.toFixed(4), p.path_type, p.violated?"VIOLATED":"MET"]);
    const csv  = [hdr,...rows].map(r=>r.join(",")).join("\n");
    const a    = document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="timing-paths.csv"; a.click();
  };

  const domainChartData = t.clock_domains.map(cd=>({ name:cd.name, wns:parseFloat(cd.wns.toFixed(3)), fill:cd.wns<0?C.error.mid:C.note.mid }));

  return (
    <div>
      <PageHeader title="Timing Viewer"
        subtitle={isDemo?"Demo: aes_core_timing.rpt — upload your .rpt file below":`${t.filename} · ${t.tool}`}
        actions={!isDemo&&<ActionBtn onClick={exportTimingCSV} icon={<Download size={12}/>}>Export CSV</ActionBtn>}
      />

      <DropZone onFile={(content,name)=>{setTimingData(parseTimingRpt(content,name));setSelectedPath(null);}}
        label="Drop your timing report (.rpt) here or click to browse"
        accept=".rpt,.txt,.log" hint="Supports PrimeTime and Tempus .rpt files"/>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        {[{label:"WNS",value:t.wns.toFixed(3),sub:"nanoseconds",color:t.wns<0?C.error.mid:C.note.mid},
          {label:"TNS",value:t.tns.toFixed(3),sub:"nanoseconds",color:t.tns<0?C.warning.mid:C.note.mid},
          {label:"Violating paths",value:t.nvp,sub:`of ${t.paths.length} total`,color:t.nvp>0?C.error.mid:C.note.mid}
        ].map(s=>(
          <Card key={s.label} style={{ textAlign:"center", padding:"14px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.8 }}>{s.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:s.color, margin:"5px 0 2px", letterSpacing:-1 }}>{s.value}</div>
            <div style={{ fontSize:9, color:"#9ca3af" }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* FIX #12: Slack histogram */}
      {histData.length>0 && (
        <Card style={{ marginBottom:14 }}>
          <SectionTitle>Slack distribution — path count per bucket (ns)</SectionTitle>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={histData} barSize={36}>
              <XAxis dataKey="range" tick={{fontSize:9}}/><YAxis tick={{fontSize:9}} allowDecimals={false}/>
              <Tooltip formatter={(v)=>[`${v} paths`,"Count"]}/>
              <ReferenceLine x={0} stroke="#e5e7eb" strokeDasharray="4 2"/>
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {histData.map((b,i)=><Cell key={i} fill={b.violated?C.error.mid:C.note.mid}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:16, marginTop:6, fontSize:11, color:"#6b7280" }}>
            <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:10,height:10,borderRadius:2,background:C.error.mid,display:"inline-block" }}/>Violated (slack &lt; 0)</span>
            <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:10,height:10,borderRadius:2,background:C.note.mid,display:"inline-block" }}/>Met (slack ≥ 0)</span>
          </div>
        </Card>
      )}

      {/* FIX #11: placeholder when no clock domains */}
      {domainChartData.length>0
        ? <Card style={{ marginBottom:14 }}>
            <SectionTitle>WNS per clock domain — red = violated, green = met</SectionTitle>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={domainChartData} barSize={44}>
                <XAxis dataKey="name" tick={{fontSize:11,fontFamily:"monospace"}}/><YAxis tick={{fontSize:10}}/>
                <Tooltip formatter={v=>[`${parseFloat(v).toFixed(3)} ns`,"WNS"]}/>
                <Bar dataKey="wns" radius={[4,4,0,0]}>{domainChartData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        : <div style={{ background:C.info.bg, border:`1px solid ${C.info.border}`, borderRadius:8, padding:"10px 14px", fontSize:12, color:C.info.fg, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            <Info size={13}/> No clock domain data found in this report. Clock domains are extracted from Path Group labels.
          </div>
      }

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"11px 14px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#374151", flex:1 }}>Critical paths <span style={{ fontSize:11, fontWeight:400, color:"#9ca3af" }}>{paths.length} shown</span></div>
          {["all","violated","met"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:"3px 10px", borderRadius:20, border:"1.5px solid",
              borderColor:filter===f?"#378ADD":"#e5e7eb",
              background:filter===f?"#E6F1FB":"#fff",
              color:filter===f?"#0C447C":"#6b7280",
              fontSize:11, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>{f}</button>
          ))}
          <button onClick={()=>setSlackSort(s=>s==="asc"?"desc":"asc")} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:8, border:"1px solid #e5e7eb", background:"#f9fafb", fontSize:11, color:"#374151", cursor:"pointer" }}>
            <TrendingDown size={11}/> Slack {slackSort==="asc"?"▲":"▼"}
          </button>
        </div>
        <div style={{ maxHeight:340, overflowY:"auto" }}>
          {paths.length===0
            ? <div style={{ padding:28, textAlign:"center", color:"#9ca3af", fontSize:13 }}>No paths match the current filter.</div>
            : <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, tableLayout:"fixed" }}>
                <thead style={{ position:"sticky", top:0, background:"#f9fafb", zIndex:1 }}>
                  <tr>{[["#","36px"],["Startpoint","24%"],["Endpoint","24%"],["Clock","14%"],["Slack","11%"],["Status","12%"]].map(([h,w])=>(
                    <th key={h} style={{ padding:"7px 10px", textAlign:"left", fontSize:9, fontWeight:700, color:"#6b7280", textTransform:"uppercase", borderBottom:"2px solid #f3f4f6", width:w }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>{paths.map(p=>(
                  <tr key={p.path_id} onClick={()=>setSelectedPath(selectedPath?.path_id===p.path_id?null:p)}
                    style={{ borderBottom:"1px solid #f9fafb", cursor:"pointer", background:selectedPath?.path_id===p.path_id?"#EFF6FF":"transparent" }}>
                    <td style={{ padding:"8px 10px", color:"#9ca3af", fontSize:10 }}>{p.path_id}</td>
                    <td style={{ padding:"8px 10px", fontFamily:"monospace", fontSize:10, color:"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.startpoint}</td>
                    <td style={{ padding:"8px 10px", fontFamily:"monospace", fontSize:10, color:"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.endpoint}</td>
                    <td style={{ padding:"8px 10px", fontFamily:"monospace", fontSize:10, color:"#7F77DD", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.clock||"—"}</td>
                    <td style={{ padding:"8px 10px", fontWeight:700, fontSize:11, color:p.slack<0?C.error.mid:C.note.mid }}>{p.slack.toFixed(3)}</td>
                    <td style={{ padding:"8px 10px" }}><Badge sev={p.violated?"error":"note"} label={p.violated?"VIOLATED":"MET"}/></td>
                  </tr>
                ))}</tbody>
              </table>
          }
        </div>
      </Card>

      {selectedPath && (
        <Card style={{ marginTop:12, borderLeft:`3px solid ${C.info.mid}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Path #{selectedPath.path_id} detail</div>
            <button onClick={()=>setSelectedPath(null)} style={{border:"none",background:"none",cursor:"pointer"}}><X size={14} color="#9ca3af"/></button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
            {[["Startpoint",selectedPath.startpoint],["Endpoint",selectedPath.endpoint],["Clock",selectedPath.clock||"—"],["Path type",selectedPath.path_type],["Slack",`${selectedPath.slack.toFixed(4)} ns`],["Status",selectedPath.violated?"VIOLATED":"MET"]].map(([k,v])=>(
              <div key={k} style={{ background:"#f9fafb", borderRadius:6, padding:"7px 11px" }}>
                <div style={{ fontSize:9, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:0.4, marginBottom:2 }}>{k}</div>
                <div style={{ fontFamily:"monospace", fontSize:11, color:"#374151", wordBreak:"break-all" }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Run Comparison ─────────────────────────────────────────────────────────────
function DeltaBadge({ delta, invert=false }) {
  if (delta===0) return <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:12, fontWeight:700, color:"#6b7280" }}><Minus size={12}/>0</span>;
  const worse = invert?delta<0:delta>0;
  const color = worse?C.error.mid:C.note.mid;
  const Icon  = worse?TrendingUp:TrendingDown;
  const sign  = delta>0?"+":"";
  return <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:12, fontWeight:700, color }}><Icon size={12}/>{sign}{delta}</span>;
}
function DeltaFloat({ delta, invert=false, unit="" }) {
  if (delta===0||isNaN(delta)) return <span style={{ fontSize:12, fontWeight:700, color:"#6b7280" }}>—</span>;
  const worse = invert?delta>0:delta<0;
  const color = worse?C.error.mid:C.note.mid;
  const sign  = delta>0?"+":"";
  return <span style={{ fontSize:12, fontWeight:700, color }}>{sign}{delta.toFixed(3)}{unit}</span>;
}
function diffRuns(a, b) {
  const keyOf  = e=>e.code?e.code:e.message.slice(0,60).trim();
  const aKeys  = new Set(a.entries.filter(e=>e.severity==="error"||e.severity==="warning").map(keyOf));
  const bKeys  = new Set(b.entries.filter(e=>e.severity==="error"||e.severity==="warning").map(keyOf));
  return {
    fixed:     a.entries.filter(e=>(e.severity==="error"||e.severity==="warning")&&!bKeys.has(keyOf(e))),
    newIssues: b.entries.filter(e=>(e.severity==="error"||e.severity==="warning")&&!aKeys.has(keyOf(e))),
    common:    b.entries.filter(e=>(e.severity==="error"||e.severity==="warning")&& aKeys.has(keyOf(e))),
  };
}

function RunComparisonPage() {
  const [runs,  setRuns]  = useState([]);
  const [selA,  setSelA]  = useState(null);
  const [selB,  setSelB]  = useState(null);
  const [tab,   setTab]   = useState("new");
  const fileRef = useRef();

  const addRun = useCallback((content, name) => {
    if (!name) return;
    const parsed = parseLogText(content, name);
    setRuns(prev=>{
      const next=[...prev,{...parsed, rid:Date.now()+Math.random(), color:RUN_COLORS[prev.length%RUN_COLORS.length]}];
      if (next.length===1) setSelA(0);
      if (next.length===2) setSelB(1);
      return next;
    });
  }, []);

  const removeRun = (idx) => {
    setRuns(prev=>{
      const next=prev.filter((_,i)=>i!==idx);
      if(selA===idx) setSelA(next.length>0?0:null); else if(selA>idx) setSelA(selA-1);
      if(selB===idx) setSelB(next.length>1?1:null); else if(selB>idx) setSelB(selB-1);
      return next;
    });
  };

  // FIX #14: prevent same run selection
  const handleSelA = (i) => { setSelA(i); if(selB===i) setSelB(null); };
  const handleSelB = (i) => { setSelB(i); if(selA===i) setSelA(null); };

  const canCompare = selA!==null && selB!==null && selA!==selB && runs[selA] && runs[selB];
  const runA = canCompare?runs[selA]:null;
  const runB = canCompare?runs[selB]:null;
  const diff = canCompare?diffRuns(runA,runB):null;

  const errDelta  = canCompare?runB.summary.errors  -runA.summary.errors  :0;
  const warnDelta = canCompare?runB.summary.warnings-runA.summary.warnings:0;
  const wnsDelta  = canCompare?(runB.stats?.wns??0)-(runA.stats?.wns??0):0;
  const tnsDelta  = canCompare?(runB.stats?.tns??0)-(runA.stats?.tns??0):0;
  const cellDelta = canCompare&&runA.stats?.cells&&runB.stats?.cells ? parseInt(runB.stats.cells.replace(/,/g,""))-parseInt(runA.stats.cells.replace(/,/g,"")) : null;
  const areaDelta = canCompare&&runA.stats?.area&&runB.stats?.area   ? parseInt(runB.stats.area.replace(/,/g,""))-parseInt(runA.stats.area.replace(/,/g,""))   : null;

  // FIX #16: per-category diff
  const catDiff = canCompare ? (() => {
    const cats = [...new Set([...runA.entries,...runB.entries].map(e=>e.category).filter(Boolean))];
    return cats.map(cat=>{
      const aCount = runA.entries.filter(e=>e.category===cat&&(e.severity==="error"||e.severity==="warning")).length;
      const bCount = runB.entries.filter(e=>e.category===cat&&(e.severity==="error"||e.severity==="warning")).length;
      return { cat, aCount, bCount, delta:bCount-aCount };
    }).filter(c=>c.aCount>0||c.bCount>0);
  })() : [];

  const tabEntries = diff?(tab==="new"?diff.newIssues:tab==="fixed"?diff.fixed:diff.common):[];
  const trendData = runs.map((r,i)=>({ name:r.filename.replace(/\.\w+$/,"").slice(0,14), errors:r.summary.errors, warnings:r.summary.warnings, wns:r.stats?.wns??null }));
  const bestRun   = runs.length>0?runs.reduce((b,r)=>r.summary.errors<b.summary.errors?r:b):null;

  return (
    <div>
      <PageHeader title="Run Comparison"
        subtitle="Upload multiple synthesis runs — track trends and diff any two side by side"/>

      <div onClick={()=>fileRef.current.click()}
        style={{ border:"2px dashed #cbd5e1", borderRadius:12, padding:"18px 24px", textAlign:"center",
          cursor:"pointer", background:"#f9fafb", marginBottom:16,
          display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
        <Upload size={18} color="#9ca3af"/>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Click to add runs — upload as many log files as you want</div>
          <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>DC, Genus, PT, ICC2, Innovus · .log .txt · multi-select supported</div>
        </div>
        <input ref={fileRef} type="file" accept=".log,.txt" multiple style={{ display:"none" }}
          onChange={e=>{ Array.from(e.target.files).forEach(f=>{ const r=new FileReader(); r.onload=ev=>addRun(ev.target.result,f.name); r.readAsText(f); }); e.target.value=""; }}/>
      </div>

      {runs.length>0 && (
        <Card style={{ padding:0, overflow:"hidden", marginBottom:16 }}>
          <div style={{ padding:"11px 16px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#374151" }}>
              {runs.length} run{runs.length!==1?"s":""} loaded
              {bestRun&&<span style={{ marginLeft:8, fontSize:11, color:C.note.fg, background:C.note.bg, padding:"1px 8px", borderRadius:20, border:`1px solid ${C.note.border}` }}>Best: {bestRun.filename.slice(0,20)}</span>}
            </div>
            <div style={{ fontSize:11, color:"#9ca3af" }}>Click A and B buttons to select runs for comparison</div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead><tr style={{ borderBottom:"1px solid #f3f4f6", background:"#f9fafb" }}>
              {["","Run","Tool","Errors","Warnings","WNS","A","B",""].map((h,i)=>(
                <th key={i} style={{ padding:"6px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{runs.map((r,i)=>(
              // FIX #14 + #15: clear visual indicator for A and B, prevent same selection
              <tr key={r.rid} style={{ borderBottom:"1px solid #f9fafb",
                background:i===selA?"#EFF6FF":i===selB?"#F5F3FF":"transparent",
                borderLeft:i===selA?`3px solid #378ADD`:i===selB?`3px solid #7F77DD`:"3px solid transparent" }}>
                <td style={{ padding:"8px 12px" }}><div style={{ width:9, height:9, borderRadius:"50%", background:r.color }}/></td>
                <td style={{ padding:"8px 12px", fontFamily:"monospace", fontSize:11, color:"#374151", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {r.filename}
                  {i===selA&&<span style={{ marginLeft:6, fontSize:9, background:"#378ADD", color:"#fff", padding:"1px 5px", borderRadius:4 }}>A</span>}
                  {i===selB&&<span style={{ marginLeft:6, fontSize:9, background:"#7F77DD", color:"#fff", padding:"1px 5px", borderRadius:4 }}>B</span>}
                </td>
                <td style={{ padding:"8px 12px", color:"#6b7280", fontSize:11 }}>{TOOL_LABEL[r.tool]||r.tool}</td>
                <td style={{ padding:"8px 12px", fontWeight:700, color:r.summary.errors>0?C.error.mid:C.note.mid }}>{r.summary.errors}</td>
                <td style={{ padding:"8px 12px", color:r.summary.warnings>0?C.warning.mid:"#6b7280" }}>{r.summary.warnings}</td>
                <td style={{ padding:"8px 12px", fontFamily:"monospace", fontWeight:700, color:(r.stats?.wns??0)<0?C.error.mid:C.note.mid }}>{r.stats?.wns!=null?r.stats.wns.toFixed(3):"—"}</td>
                <td style={{ padding:"8px 12px" }}>
                  <button onClick={()=>handleSelA(i)} style={{ width:28, height:22, borderRadius:6, border:`1.5px solid ${selA===i?"#378ADD":"#e5e7eb"}`, background:selA===i?"#378ADD":"#fff", color:selA===i?"#fff":"#6b7280", fontSize:10, fontWeight:700, cursor:"pointer" }}>A</button>
                </td>
                <td style={{ padding:"8px 12px" }}>
                  <button onClick={()=>handleSelB(i)} style={{ width:28, height:22, borderRadius:6, border:`1.5px solid ${selB===i?"#7F77DD":"#e5e7eb"}`, background:selB===i?"#7F77DD":"#fff", color:selB===i?"#fff":"#6b7280", fontSize:10, fontWeight:700, cursor:"pointer" }}>B</button>
                </td>
                <td style={{ padding:"8px 12px" }}>
                  <button onClick={()=>removeRun(i)} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af", padding:0 }}><X size={13}/></button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      )}

      {runs.length>=2 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
          <Card><SectionTitle>Error trend</SectionTitle>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="name" tick={{fontSize:9}}/><YAxis tick={{fontSize:9}} allowDecimals={false}/><Tooltip/>
                <Line type="monotone" dataKey="errors" stroke={C.error.mid} strokeWidth={2} dot={{r:3}} name="Errors"/>
                <Line type="monotone" dataKey="warnings" stroke={C.warning.mid} strokeWidth={2} dot={{r:3}} name="Warnings"/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card><SectionTitle>WNS trend</SectionTitle>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={trendData.filter(d=>d.wns!==null)}><CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="name" tick={{fontSize:9}}/><YAxis tick={{fontSize:9}}/><Tooltip formatter={v=>[`${parseFloat(v).toFixed(3)} ns`,"WNS"]}/>
                <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 2"/>
                <Line type="monotone" dataKey="wns" stroke="#378ADD" strokeWidth={2} dot={{r:3}} name="WNS"/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {runs.length===0&&<div style={{ background:C.info.bg, border:`1px solid ${C.info.border}`, borderRadius:8, padding:"12px 16px", fontSize:12, color:C.info.fg, display:"flex", alignItems:"center", gap:8 }}><Info size={13}/> Upload at least 2 log files to start comparing.</div>}
      {runs.length===1&&<div style={{ background:C.warning.bg, border:`1px solid ${C.warning.border}`, borderRadius:8, padding:"12px 16px", fontSize:12, color:C.warning.fg, display:"flex", alignItems:"center", gap:8 }}><Info size={13}/> 1 run loaded. Upload one more, then select A and B.</div>}
      {/* FIX #14: explicit message when same run */}
      {runs.length>=2&&selA===selB&&selA!==null&&<div style={{ background:C.error.bg, border:`1px solid ${C.error.border}`, borderRadius:8, padding:"12px 16px", fontSize:12, color:C.error.fg, display:"flex", alignItems:"center", gap:8 }}><AlertCircle size={13}/> You selected the same run for both A and B. Please select two different runs.</div>}
      {runs.length>=2&&!canCompare&&selA!==selB&&<div style={{ background:C.warning.bg, border:`1px solid ${C.warning.border}`, borderRadius:8, padding:"12px 16px", fontSize:12, color:C.warning.fg, display:"flex", alignItems:"center", gap:8 }}><Info size={13}/> Select A and B in the table above to compare two runs.</div>}

      {canCompare && (
        <>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Comparing:</div>
            <span style={{ fontFamily:"monospace", fontSize:11, background:"#EFF6FF", color:"#1e40af", padding:"3px 10px", borderRadius:6, border:"1px solid #bfdbfe" }}>A: {runA.filename}</span>
            <span style={{ color:"#9ca3af", fontSize:14 }}>→</span>
            <span style={{ fontFamily:"monospace", fontSize:11, background:"#F5F3FF", color:"#4c1d95", padding:"3px 10px", borderRadius:6, border:"1px solid #ddd6fe" }}>B: {runB.filename}</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:14 }}>
            {[
              {label:"Error delta",   value:<DeltaBadge delta={errDelta}/>,                sub:`${runA.summary.errors} → ${runB.summary.errors}`},
              {label:"Warning delta", value:<DeltaBadge delta={warnDelta}/>,               sub:`${runA.summary.warnings} → ${runB.summary.warnings}`},
              {label:"WNS delta",     value:<DeltaFloat delta={wnsDelta} unit=" ns" invert/>, sub:`${(runA.stats?.wns??0).toFixed(3)} → ${(runB.stats?.wns??0).toFixed(3)}`},
              {label:"TNS delta",     value:<DeltaFloat delta={tnsDelta} unit=" ns" invert/>, sub:`${(runA.stats?.tns??0).toFixed(3)} → ${(runB.stats?.tns??0).toFixed(3)}`},
            ].map(s=>(
              <Card key={s.label} style={{ textAlign:"center", padding:"12px" }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.8, marginBottom:5 }}>{s.label}</div>
                <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:10, color:"#9ca3af", fontFamily:"monospace" }}>{s.sub}</div>
              </Card>
            ))}
          </div>

          {/* FIX #16: per-category breakdown */}
          {catDiff.length>0 && (
            <Card style={{ marginBottom:14 }}>
              <SectionTitle>Per-category diff — errors &amp; warnings</SectionTitle>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {catDiff.map(c=>(
                  <div key={c.cat} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 14px", minWidth:120 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{c.cat}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontFamily:"monospace", fontSize:12, color:"#374151" }}>{c.aCount} → {c.bCount}</span>
                      <DeltaBadge delta={c.delta}/>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(cellDelta!==null||areaDelta!==null) && (
            <Card style={{ marginBottom:14, padding:"10px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.8 }}>Design stats delta</div>
                {cellDelta!==null&&<div style={{ fontSize:12 }}>Cells <span style={{ fontFamily:"monospace", fontWeight:700, color:"#374151" }}>{runA.stats.cells}</span> → <span style={{ fontFamily:"monospace", fontWeight:700, color:"#374151" }}>{runB.stats.cells}</span> <DeltaBadge delta={cellDelta}/></div>}
                {areaDelta!==null&&<div style={{ fontSize:12 }}>Area <span style={{ fontFamily:"monospace", fontWeight:700, color:"#374151" }}>{runA.stats.area}</span> → <span style={{ fontFamily:"monospace", fontWeight:700, color:"#374151" }}>{runB.stats.area}</span> µm² <DeltaBadge delta={areaDelta}/></div>}
              </div>
            </Card>
          )}

          <Card style={{ marginBottom:14 }}>
            <SectionTitle>Issue breakdown A vs B</SectionTitle>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={[{name:"Errors",A:runA.summary.errors,B:runB.summary.errors},{name:"Warnings",A:runA.summary.warnings,B:runB.summary.warnings},{name:"Infos",A:runA.summary.infos,B:runB.summary.infos}]} barGap={4} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}} allowDecimals={false}/><Tooltip/>
                <Bar dataKey="A" name={`A: ${runA.filename.slice(0,16)}`} fill="#378ADD" radius={[4,4,0,0]}/>
                <Bar dataKey="B" name={`B: ${runB.filename.slice(0,16)}`} fill="#7F77DD" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card style={{ padding:0, overflow:"hidden", marginBottom:14 }}>
            <div style={{ display:"flex", borderBottom:"2px solid #f3f4f6" }}>
              {[{id:"new",label:`🔴 New in B (${diff.newIssues.length})`,color:C.error.mid},{id:"fixed",label:`✅ Fixed (${diff.fixed.length})`,color:C.note.mid},{id:"common",label:`⚠️ Remaining (${diff.common.length})`,color:C.warning.mid}].map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"10px 18px", border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:"transparent", color:tab===t.id?t.color:"#6b7280", borderBottom:tab===t.id?`2px solid ${t.color}`:"2px solid transparent", marginBottom:-2 }}>{t.label}</button>
              ))}
            </div>
            <div style={{ maxHeight:340, overflowY:"auto" }}>
              {tabEntries.length===0
                ? <div style={{ padding:"28px", textAlign:"center", color:"#9ca3af", fontSize:13 }}>{tab==="new"?"No new issues in B.":tab==="fixed"?"No issues fixed.":"No common issues."}</div>
                : tabEntries.map((e,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 16px", borderBottom:"1px solid #f9fafb" }}>
                      <Badge sev={e.severity}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                          {e.code&&<span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, background:"#f3f4f6", color:"#374151", padding:"1px 6px", borderRadius:4 }}>{e.code}</span>}
                          {e.category&&<span style={{ fontSize:9, color:"#9ca3af", textTransform:"uppercase" }}>{e.category}</span>}
                          {tab==="new"&&<span style={{ fontSize:9, color:C.error.fg, background:C.error.bg, padding:"1px 6px", borderRadius:10, border:`1px solid ${C.error.border}` }}>new in B</span>}
                          {tab==="fixed"&&<span style={{ fontSize:9, color:C.note.fg, background:C.note.bg, padding:"1px 6px", borderRadius:10, border:`1px solid ${C.note.border}` }}>fixed</span>}
                        </div>
                        <div style={{ fontSize:12, color:"#374151", lineHeight:1.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.message}</div>
                        {e.fix_hint&&tab==="new"&&<div style={{ fontSize:11, color:C.warning.fg, marginTop:3, display:"flex", gap:5 }}><Zap size={11} color={C.warning.mid} style={{marginTop:2,flexShrink:0}}/>{e.fix_hint}</div>}
                      </div>
                    </div>
                  ))
              }
            </div>
          </Card>

          <div style={{ padding:"12px 16px", borderRadius:10, background:errDelta<=0&&wnsDelta>=0?C.note.bg:C.error.bg, border:`1px solid ${errDelta<=0&&wnsDelta>=0?C.note.border:C.error.border}`, display:"flex", alignItems:"center", gap:10 }}>
            {errDelta<=0&&wnsDelta>=0?<CheckCircle size={15} color={C.note.mid}/>:<AlertCircle size={15} color={C.error.mid}/>}
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"#374151" }}>
                {errDelta<=0&&wnsDelta>=0?"Run B is better than Run A — your changes helped!":errDelta>0&&wnsDelta<0?"Run B is worse — errors increased and timing degraded.":"Mixed results — some metrics improved, others got worse."}
              </div>
              <div style={{ fontSize:11, color:"#6b7280", marginTop:1 }}>{diff.fixed.length} issue{diff.fixed.length!==1?"s":""} fixed · {diff.newIssues.length} new issue{diff.newIssues.length!==1?"s":""} introduced</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── QoR Trend Dashboard ────────────────────────────────────────────────────────
function QoRTrendPage() {
  const [runs,      setRuns]      = useState([]);
  const [isDemo,    setIsDemo]    = useState(true);
  const [selRun,    setSelRun]    = useState(null);
  const [metric,    setMetric]    = useState("wns");
  const [threshold, setThreshold] = useState("");   // FIX #19: WNS alert threshold
  const [showThr,   setShowThr]   = useState(false);
  const fileRef = useRef();

  const displayRuns = isDemo?QOR_DEMO:runs;

  const addRuns = useCallback((files) => {
    files.forEach(f=>{
      const r=new FileReader();
      r.onload=ev=>{
        const parsed=parseLogText(ev.target.result,f.name);
        setRuns(prev=>[...prev,{...parsed,rid:Date.now()+Math.random(),color:RUN_COLORS[prev.length%RUN_COLORS.length]}]);
        setIsDemo(false);
      };
      r.readAsText(f);
    });
  }, []);

  const removeRun = (rid) => {
    const next=runs.filter(r=>r.rid!==rid);
    setRuns(next);
    if(next.length===0) setIsDemo(true);
    if(selRun?.rid===rid) setSelRun(null);
  };

  // FIX #18: sort runs by filename
  const sortedRuns = [...displayRuns].sort((a,b)=>a.filename.localeCompare(b.filename));

  // FIX #17: filter null WNS safely
  const trendData = sortedRuns.map((r,i)=>({
    name:    r.filename.replace(/\.\w+$/,"").slice(0,14),
    run:     i+1,
    errors:  r.summary.errors,
    warnings:r.summary.warnings,
    wns:     r.stats?.wns!=null&&!isNaN(r.stats.wns)?r.stats.wns:null,
    tns:     r.stats?.tns!=null&&!isNaN(r.stats.tns)?r.stats.tns:null,
    nvp:     r.stats?.nvp??null,
    cells:   r.stats?.cells?parseInt(r.stats.cells.replace(/,/g,"")):null,
    area:    r.stats?.area?parseInt(r.stats.area.replace(/,/g,"")):null,
    color:   r.color,
  }));

  const bestWNS      = sortedRuns.length>0?sortedRuns.reduce((b,r)=>((r.stats?.wns??-99)>(b.stats?.wns??-99)?r:b)):null;
  const bestErr      = sortedRuns.length>0?sortedRuns.reduce((b,r)=>(r.summary.errors<b.summary.errors?r:b)):null;
  const mostImproved = sortedRuns.length>=2 ? (() => {
    const first = sortedRuns[0]?.stats?.wns, last = sortedRuns[sortedRuns.length-1]?.stats?.wns;
    if (first==null||last==null) return null;
    return { delta: last-first };
  })() : null;

  const thrVal = threshold!==''?parseFloat(threshold):null;

  const METRICS = [
    { id:"wns",     label:"WNS",      color:"#378ADD", unit:" ns" },
    { id:"errors",  label:"Errors",   color:"#E24B4A", unit:""   },
    { id:"warnings",label:"Warnings", color:"#EF9F27", unit:""   },
    { id:"tns",     label:"TNS",      color:"#7F77DD", unit:" ns" },
    { id:"nvp",     label:"NVP",      color:"#D85A30", unit:""   },
    { id:"cells",   label:"Cells",    color:"#1D9E75", unit:""   },
  ];
  const curMetric = METRICS.find(m=>m.id===metric)||METRICS[0];

  // FIX #20: rotate labels when > 5 runs
  const xAngle = sortedRuns.length > 5 ? -35 : 0;
  const xHeight = sortedRuns.length > 5 ? 50 : 20;

  return (
    <div>
      <PageHeader title="QoR Trend Dashboard"
        subtitle="Track quality of results across every synthesis run — spot regressions before tapeout"
        actions={<>
          {/* FIX #19: threshold toggle */}
          <button onClick={()=>setShowThr(s=>!s)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px",
            border:`1.5px solid ${showThr?"#E24B4A":"#e2e8f0"}`, borderRadius:8,
            background:showThr?"#FCEBEB":"#f1f5f9", color:showThr?"#A32D2D":"#374151",
            fontSize:11, fontWeight:600, cursor:"pointer" }}>
            <Target size={12}/> {showThr?"Hide threshold":"Set WNS threshold"}
          </button>
          <button onClick={()=>fileRef.current.click()} style={{
            display:"flex", alignItems:"center", gap:7, padding:"8px 16px",
            background:"#0f172a", border:"none", borderRadius:8,
            color:"#f1f5f9", fontSize:12, fontWeight:600, cursor:"pointer" }}>
            <Upload size={13}/> Add runs
          </button>
          <input ref={fileRef} type="file" accept=".log,.txt" multiple style={{ display:"none" }}
            onChange={e=>{ addRuns(Array.from(e.target.files)); e.target.value=""; }}/>
        </>}
      />

      {/* FIX #19: threshold input */}
      {showThr && (
        <Card style={{ marginBottom:14, padding:"12px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <Target size={14} color={C.error.mid}/>
            <div style={{ fontSize:12, fontWeight:600, color:"#374151" }}>WNS regression threshold</div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <input type="number" step="0.01" value={threshold} onChange={e=>setThreshold(e.target.value)}
                placeholder="-0.5"
                style={{ width:90, padding:"4px 8px", borderRadius:6, border:"1px solid #e5e7eb", fontSize:12,
                  color:"#374151", fontFamily:"monospace" }}/>
              <span style={{ fontSize:12, color:"#6b7280" }}>ns</span>
            </div>
            {thrVal!==null && <span style={{ fontSize:11, color:C.error.fg, background:C.error.bg, padding:"2px 8px", borderRadius:20, border:`1px solid ${C.error.border}` }}>
              Any run with WNS below {thrVal.toFixed(3)} ns is flagged
            </span>}
            {threshold && <button onClick={()=>setThreshold("")} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af" }}><X size={12}/></button>}
          </div>
        </Card>
      )}

      {isDemo && (
        <div style={{ background:C.warning.bg, border:`1px solid ${C.warning.border}`, borderRadius:8,
          padding:"8px 14px", fontSize:12, color:C.warning.fg, marginBottom:16,
          display:"flex", alignItems:"center", gap:8 }}>
          <Info size={13}/> Showing demo data from 3 sample runs. Click <strong>Add runs</strong> to load your own logs.
        </div>
      )}

      {/* Highlight cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        <Card style={{ padding:"14px 18px", borderTop:`3px solid ${C.note.mid}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:C.note.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Award size={17} color={C.note.mid}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.8 }}>Best WNS</div>
              <div style={{ fontSize:16, fontWeight:700, color:C.note.mid }}>{bestWNS?.stats?.wns?.toFixed(3) ?? "—"} ns</div>
              <div style={{ fontSize:10, color:"#6b7280", marginTop:1, fontFamily:"monospace" }}>{bestWNS?.filename?.slice(0,22) ?? "—"}</div>
            </div>
          </div>
        </Card>
        <Card style={{ padding:"14px 18px", borderTop:`3px solid ${C.note.mid}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:C.note.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <CheckCircle size={17} color={C.note.mid}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.8 }}>Fewest Errors</div>
              <div style={{ fontSize:16, fontWeight:700, color:C.note.mid }}>{bestErr?.summary?.errors ?? "—"} errors</div>
              <div style={{ fontSize:10, color:"#6b7280", marginTop:1, fontFamily:"monospace" }}>{bestErr?.filename?.slice(0,22) ?? "—"}</div>
            </div>
          </div>
        </Card>
        <Card style={{ padding:"14px 18px", borderTop:`3px solid #378ADD` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:"#E6F1FB", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <TrendingUp size={17} color="#378ADD"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.8 }}>WNS improvement</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#378ADD" }}>
                {mostImproved ? `${mostImproved.delta > 0 ? "+" : ""}${mostImproved.delta.toFixed(3)} ns` : "—"}
              </div>
              <div style={{ fontSize:10, color:"#6b7280", marginTop:1 }}>run 1 → run {sortedRuns.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Metric selector */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {METRICS.map(m => (
          <button key={m.id} onClick={()=>setMetric(m.id)} style={{
            padding:"5px 12px", borderRadius:20, border:"1.5px solid",
            borderColor: metric===m.id ? m.color : "#e5e7eb",
            background:  metric===m.id ? m.color+"18" : "#fff",
            color:       metric===m.id ? m.color : "#6b7280",
            fontSize:11, fontWeight:600, cursor:"pointer",
          }}>{m.label}</button>
        ))}
      </div>

      {/* Main trend chart */}
      <Card style={{ marginBottom:16 }}>
        <SectionTitle>{curMetric.label} trend across runs</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData.filter(d=>d[metric]!=null)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
            <XAxis dataKey="name" tick={{ fontSize:10, angle:xAngle, textAnchor:xAngle!==0?"end":"middle" }} height={xHeight}/>
            <YAxis tick={{ fontSize:10 }}/>
            <Tooltip formatter={v=>[`${parseFloat(v).toFixed(3)}${curMetric.unit}`, curMetric.label]}/>
            {/* FIX #19: WNS threshold reference line */}
            {metric==="wns" && thrVal!==null && (
              <ReferenceLine y={thrVal} stroke={C.error.mid} strokeDasharray="5 3" strokeWidth={1.5}
                label={{ value:`threshold ${thrVal}ns`, position:"insideTopRight", fontSize:9, fill:C.error.mid }}/>
            )}
            <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 2"/>
            <Area type="monotone" dataKey={metric} stroke={curMetric.color} fill={curMetric.color+"22"} strokeWidth={2}
              dot={({ cx, cy, payload }) => {
                const isBelow = metric==="wns" && thrVal!==null && (payload[metric]??0) < thrVal;
                return <circle key={cx} cx={cx} cy={cy} r={4} fill={isBelow?C.error.mid:curMetric.color} stroke="#fff" strokeWidth={1.5}/>;
              }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* 4-chart mini grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        {[
          { key:"errors",  label:"Errors",   color:C.error.mid  },
          { key:"wns",     label:"WNS (ns)", color:"#378ADD"    },
          { key:"warnings",label:"Warnings", color:C.warning.mid},
          { key:"cells",   label:"Cells",    color:"#1D9E75"    },
        ].map(c=>(
          <Card key={c.key} style={{ padding:"12px 16px" }}>
            <SectionTitle>{c.label}</SectionTitle>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={trendData.filter(d=>d[c.key]!=null)}>
                <XAxis dataKey="name" tick={{fontSize:8}} height={16}/>
                <YAxis tick={{fontSize:8}} width={30}/>
                <Tooltip formatter={v=>[parseFloat(v).toFixed(3), c.label]}/>
                {c.key==="wns" && thrVal!==null && <ReferenceLine y={thrVal} stroke={C.error.mid} strokeDasharray="4 2"/>}
                <Line type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={1.5} dot={{r:2}} connectNulls={false}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ))}
      </div>

      {/* Runs table */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"11px 16px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{sortedRuns.length} run{sortedRuns.length!==1?"s":""} loaded</div>
          {!isDemo && <button onClick={()=>{setRuns([]);setIsDemo(true);setSelRun(null);}} style={{ fontSize:11, color:"#9ca3af", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}><RefreshCw size={11}/> Reset</button>}
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ background:"#f9fafb", borderBottom:"1px solid #f3f4f6" }}>
            {["","Run","Tool","Errors","Warnings","WNS","TNS","Cells","Area"].map((h,i)=>(
              <th key={i} style={{ padding:"6px 10px", textAlign:"left", fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{sortedRuns.map((r,i)=>{
            const wns = r.stats?.wns;
            const belowThreshold = thrVal!==null && wns!=null && wns<thrVal;
            return (
              <tr key={r.rid} onClick={()=>setSelRun(selRun?.rid===r.rid?null:r)}
                style={{ borderBottom:"1px solid #f9fafb", cursor:"pointer",
                  background:selRun?.rid===r.rid?"#f0f9ff":belowThreshold?"#FEFCE8":"transparent",
                  borderLeft:belowThreshold?`3px solid ${C.error.mid}`:"3px solid transparent" }}>
                <td style={{ padding:"8px 10px" }}><div style={{ width:8, height:8, borderRadius:"50%", background:r.color }}/></td>
                <td style={{ padding:"8px 10px", fontFamily:"monospace", fontSize:11, color:"#374151", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {r.filename}
                  {belowThreshold && <span style={{ marginLeft:5, fontSize:9, color:C.error.fg, background:C.error.bg, padding:"1px 5px", borderRadius:10, border:`1px solid ${C.error.border}` }}>⚠ below threshold</span>}
                </td>
                <td style={{ padding:"8px 10px", fontSize:11, color:"#6b7280" }}>{TOOL_LABEL[r.tool]||r.tool}</td>
                <td style={{ padding:"8px 10px", fontWeight:700, color:r.summary.errors>0?C.error.mid:C.note.mid }}>{r.summary.errors}</td>
                <td style={{ padding:"8px 10px", color:r.summary.warnings>0?C.warning.mid:"#6b7280" }}>{r.summary.warnings}</td>
                <td style={{ padding:"8px 10px", fontFamily:"monospace", fontWeight:700, color:wns!=null&&wns<0?C.error.mid:C.note.mid }}>{wns!=null?wns.toFixed(3):"—"}</td>
                <td style={{ padding:"8px 10px", fontFamily:"monospace", fontSize:11, color:r.stats?.tns!=null&&r.stats.tns<0?C.warning.mid:"#6b7280" }}>{r.stats?.tns?.toFixed(3)??"—"}</td>
                <td style={{ padding:"8px 10px", fontSize:11, color:"#6b7280" }}>{r.stats?.cells??"—"}</td>
                <td style={{ padding:"8px 10px", fontSize:11, color:"#6b7280" }}>{r.stats?.area??"—"}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </Card>

      {selRun && (
        <Card style={{ marginTop:12, borderLeft:`3px solid ${selRun.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#374151", fontFamily:"monospace" }}>{selRun.filename}</div>
            <button onClick={()=>setSelRun(null)} style={{ border:"none", background:"none", cursor:"pointer" }}><X size={13} color="#9ca3af"/></button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {[["Errors",selRun.summary.errors],["Warnings",selRun.summary.warnings],["WNS",selRun.stats?.wns?.toFixed(3)??"—"],["TNS",selRun.stats?.tns?.toFixed(3)??"—"],["Cells",selRun.stats?.cells??"—"],["Area",selRun.stats?.area??"—"],["Elapsed",selRun.stats?.elapsed??"—"],["Tool",TOOL_LABEL[selRun.tool]||selRun.tool]].map(([k,v])=>(
              <div key={k} style={{ background:"#f9fafb", borderRadius:6, padding:"7px 10px" }}>
                <div style={{ fontSize:9, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", marginBottom:2 }}>{k}</div>
                <div style={{ fontFamily:"monospace", fontSize:11, color:"#374151" }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Fixes Advisor ──────────────────────────────────────────────────────────────
function FixesAdvisorPage({ logData }) {
  const data = logData || SAMPLE_DATA;
  const isDemo = !logData;
  const withFix = data.entries.filter(e => e.fix_hint);

  const grouped = {};
  withFix.forEach(e => {
    const key = e.code || e.message.slice(0, 50);
    if (!grouped[key]) grouped[key] = { ...e, count: 0 };
    grouped[key].count++;
  });
  const fixes = Object.values(grouped).sort((a, b) => b.count - a.count);

  const GENERAL_FIXES = [
    { title: "Run compile_ultra -retime", desc: "Enables retiming during optimization — often resolves 20-30% of setup violations automatically.", icon: <Zap size={14}/> },
    { title: "Check set_max_fanout constraints", desc: "High fanout nets are a common cause of timing failures. Set set_max_fanout 20 in your SDC for critical signals.", icon: <Activity size={14}/> },
    { title: "Verify all .db files are loaded", desc: "Missing library files cause ELAB errors. Check set_link_library and set_target_library include all required .db paths.", icon: <FileText size={14}/> },
    { title: "Use set_false_path for async crossings", desc: "CDC violations can be suppressed with correct set_false_path or set_clock_groups -asynchronous in your SDC.", icon: <Clock size={14}/> },
    { title: "Check for latches in RTL", desc: "GEN-042 latch inference usually means a missing else branch in a combinational always block. Use always_ff.", icon: <AlertTriangle size={14}/> },
    { title: "Review DRC rule deck version", desc: "DRC failures from wrong node rule deck. Confirm your signoff deck matches the foundry PDK version in your flow.", icon: <CheckCircle size={14}/> },
  ];

  return (
    <div>
      <PageHeader title="Fixes Advisor"
        subtitle={isDemo ? "Demo mode — upload a log file in Log Analyzer to see your specific fixes" : `${data.filename} · ${fixes.length} fixable issues found`}
      />

      {isDemo && (
        <div style={{ background: C.warning.bg, border: `1px solid ${C.warning.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: C.warning.fg, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Info size={13}/> Showing demo fixes. Upload a real log file in Log Analyzer first.
        </div>
      )}

      {fixes.length > 0 && (
        <>
          <SectionTitle>Your run's fixable issues</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {fixes.map((e, i) => (
              <Card key={i} style={{ padding: "12px 16px", borderLeft: `3px solid ${C.warning.mid}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Zap size={14} color={C.warning.mid} style={{ marginTop: 2, flexShrink: 0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      {e.code && <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, background: "#f3f4f6", color: "#374151", padding: "1px 6px", borderRadius: 4 }}>{e.code}</span>}
                      <span style={{ fontSize: 10, background: "#e0e7ff", color: "#3730a3", padding: "1px 7px", borderRadius: 20, fontWeight: 700 }}>×{e.count} occurrence{e.count !== 1 ? "s" : ""}</span>
                      {e.category && <span style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase" }}>{e.category}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: C.warning.fg, lineHeight: 1.6 }}>{e.fix_hint}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <SectionTitle>General best practices</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {GENERAL_FIXES.map((f, i) => (
          <Card key={i} style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ color: "#378ADD", flexShrink: 0, marginTop: 1 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────

// ── SDC Tools Pages ────────────────────────────────────────────────────────────
function parseSDC(text) {
  const issues=[], info=[];
  const grab=re=>[...text.matchAll(re)].map(m=>m[0]);

  const clocks         = grab(/create_clock[^;\n]*/g);
  const genClocks      = grab(/create_generated_clock[^;\n]*/g);
  const groupPath      = grab(/group_path[^;\n]*/g);
  const clkGatingChk   = grab(/set_clock_gating_check[^;\n]*/g);
  const clkGroups      = grab(/set_clock_groups[^;\n]*/g);
  const clkJitter      = grab(/set_clock_jitter[^;\n]*/g);
  const clkLatency     = grab(/set_clock_latency[^;\n]*/g);
  const clkTransition  = grab(/set_clock_transition[^;\n]*/g);
  const clkUncertainty = grab(/set_clock_uncertainty[^;\n]*/g);
  const dataCheck      = grab(/set_data_check[^;\n]*/g);
  const disableTiming  = grab(/set_disable_timing[^;\n]*/g);
  const falsePaths     = grab(/set_false_path[^;\n]*/g);
  const idealNetwork   = grab(/set_ideal_network[^;\n]*/g);
  const inputDelay     = grab(/set_input_delay[^;\n]*/g);
  const minPulseWidth  = grab(/set_min_pulse_width[^;\n]*/g);
  const outputDelay    = grab(/set_output_delay[^;\n]*/g);
  const propagated     = grab(/set_propagated_clock[^;\n]*/g);
  const timingDerate   = grab(/set_timing_derate[^;\n]*/g);
  const maxDelay       = grab(/set_max_delay[^;\n]*/g);
  const minDelay       = grab(/set_min_delay[^;\n]*/g);
  const mcPaths        = grab(/set_multicycle_path[^;\n]*/g);
  const caseAnalysis   = grab(/set_case_analysis[^;\n]*/g);
  const drive          = grab(/set_drive[^;\n]*/g);
  const drivingCell    = grab(/set_driving_cell[^;\n]*/g);
  const inputTransition= grab(/set_input_transition[^;\n]*/g);
  const load           = grab(/set_load[^;\n]*/g);
  const maxArea        = grab(/set_max_area[^;\n]*/g);
  const maxCap         = grab(/set_max_capacitance[^;\n]*/g);
  const maxFanout      = grab(/set_max_fanout[^;\n]*/g);
  const maxTrans       = grab(/set_max_transition[^;\n]*/g);
  const operCond       = grab(/set_operating_conditions[^;\n]*/g);
  const wireLoadMode   = grab(/set_wire_load_mode[^;\n]*/g);
  const wireLoadModel  = grab(/set_wire_load_model[^;\n]*/g);
  const dontTouch      = grab(/set_dont_touch[^;\n]*/g);
  const dontUse        = grab(/set_dont_use[^;\n]*/g);
  const sdcVersion     = grab(/set\s+sdc_version[^;\n]*/g);
  const setUnits       = grab(/set_units[^;\n]*/g);
  const maxDynPower    = grab(/set_max_dynamic_power[^;\n]*/g);
  const maxLeakPower   = grab(/set_max_leakage_power[^;\n]*/g);
  const voltage        = grab(/set_voltage[^;\n]*/g);
  const voltageArea    = grab(/create_voltage_area[^;\n]*/g);

  const virtualClocks = clocks.filter(c=>!/\[get_ports/.test(c)&&!/\[get_pins/.test(c));
  const realClocks    = clocks.filter(c=>/\[get_ports/.test(c)||/\[get_pins/.test(c));

  // ── ERRORS ──────────────────────────────────────────────────────────────────
  if (clocks.length===0&&genClocks.length===0)
    issues.push({ sev:"error", code:"SDC-001", msg:"No create_clock defined. Synthesis has no timing reference — all paths are unconstrained." });

  const cnames=clocks.map(c=>{ const m=c.match(/-name\s+(\S+)/); return m?m[1]:null; }).filter(Boolean);
  const seen=new Set(), dupes=new Set();
  cnames.forEach(n=>{ if(seen.has(n)) dupes.add(n); seen.add(n); });
  dupes.forEach(n=>issues.push({ sev:"error", code:"SDC-002", msg:`Duplicate clock name "${n}" — two create_clock commands use the same name. Last one wins but results are unpredictable.` }));

  genClocks.forEach(gc=>{
    if (!/-source\s+\S+/.test(gc))
      issues.push({ sev:"error", code:"SDC-003", msg:`create_generated_clock missing required -source: "${gc.slice(0,70)}…"` });
    if (/-divide_by/.test(gc)&&/-multiply_by/.test(gc))
      issues.push({ sev:"error", code:"SDC-004", msg:`create_generated_clock has both -divide_by and -multiply_by: "${gc.slice(0,60)}" — use one or the other.` });
  });

  if (inputDelay.length===0&&clocks.length>0)
    issues.push({ sev:"error", code:"SDC-005", msg:"No set_input_delay — all input ports are unconstrained." });
  if (outputDelay.length===0&&clocks.length>0)
    issues.push({ sev:"error", code:"SDC-006", msg:"No set_output_delay — all output ports are unconstrained." });

  clocks.forEach(c=>{
    const port=c.match(/\[get_ports\s+([^\]]+)\]/);
    if (port&&/\bdata\b|\baddr\b|\bbus\b|\bwdata\b|\brdata\b|\bdin\b|\bdout\b/.test(port[1].toLowerCase()))
      issues.push({ sev:"error", code:"SDC-007", msg:`create_clock on likely data port "${port[1]}" — define clocks only on dedicated clock ports.` });
  });

  clocks.forEach(c=>{
    const per=c.match(/-period\s+([\d.]+)/); if (!per) return;
    const period=parseFloat(per[1]);
    inputDelay.forEach(id=>{ const v=id.match(/set_input_delay\s+([\d.]+)/); if(v&&parseFloat(v[1])>=period) issues.push({ sev:"error", code:"SDC-008", msg:`set_input_delay ${v[1]}ns >= clock period ${period}ns — zero margin for internal paths.` }); });
    outputDelay.forEach(od=>{ const v=od.match(/set_output_delay\s+([\d.]+)/); if(v&&parseFloat(v[1])>=period) issues.push({ sev:"error", code:"SDC-009", msg:`set_output_delay ${v[1]}ns >= clock period ${period}ns — no margin for output register logic.` }); });
  });

  virtualClocks.forEach(vc=>{
    const name=vc.match(/-name\s+(\S+)/)?.[1];
    if (name&&propagated.some(p=>p.includes(name)))
      issues.push({ sev:"error", code:"SDC-010", msg:`set_propagated_clock applied to virtual clock "${name}" — virtual clocks have no physical source. Remove this.` });
  });

  caseAnalysis.forEach(ca=>{
    const val=ca.match(/set_case_analysis\s+(\S+)/)?.[1];
    if (val&&!["0","1","rising","falling","rise","fall"].includes(val.toLowerCase()))
      issues.push({ sev:"error", code:"SDC-011", msg:`set_case_analysis invalid value "${val}" — allowed values: 0, 1, rising, falling.` });
  });

  // ── WARNINGS ────────────────────────────────────────────────────────────────
  falsePaths.forEach(fp=>{
    if (!/-from.*async|-to.*async|-through.*scan|-from.*test/i.test(fp)) {
      const f=fp.match(/-from\s+(\S+)/), t=fp.match(/-to\s+(\S+)/);
      if (f&&t) issues.push({ sev:"warning", code:"SDC-020", msg:`set_false_path from ${f[1]} to ${t[1]} — confirm this is a genuine false path, not a real timing path being masked.` });
    }
  });

  mcPaths.forEach(mc=>{
    const s=mc.match(/-setup\s+(\d+)/)||mc.match(/set_multicycle_path\s+(\d+)/);
    if (s&&parseInt(s[1])>1&&!/-hold/.test(mc))
      issues.push({ sev:"warning", code:"SDC-021", msg:`Multicycle path -setup ${s[1]} has no -hold fix. Hold violations likely without -hold ${parseInt(s[1])-1}.` });
  });

  clkUncertainty.forEach(u=>{
    const v=u.match(/set_clock_uncertainty\s+([\d.]+)/);
    if (v&&parseFloat(v[1])<0.05) issues.push({ sev:"warning", code:"SDC-022", msg:`Clock uncertainty ${v[1]}ns is unrealistically tight.` });
    if (v&&parseFloat(v[1])>0.5)  issues.push({ sev:"warning", code:"SDC-023", msg:`Clock uncertainty ${v[1]}ns is very high (>0.5ns).` });
  });

  if (clocks.length>1&&clkGroups.length===0)
    issues.push({ sev:"warning", code:"SDC-024", msg:`${clocks.length} clocks but no set_clock_groups. CDC paths may be analyzed as synchronous.` });

  dontTouch.forEach(dt=>{
    if (/\[all_cells\]|\*/.test(dt))
      issues.push({ sev:"warning", code:"SDC-025", msg:"set_dont_touch with wildcard — blocks all optimization and degrades QoR." });
  });

  maxTrans.forEach(mt=>{ const v=mt.match(/set_max_transition\s+([\d.]+)/); if(v&&parseFloat(v[1])<0.05) issues.push({ sev:"warning", code:"SDC-026", msg:`set_max_transition ${v[1]}ns extremely tight.` }); });
  maxDelay.forEach(md=>{ if(!/-datapath_only/.test(md)) issues.push({ sev:"warning", code:"SDC-027", msg:`set_max_delay without -datapath_only — hold constraints on same path may be violated.` }); });

  if (inputDelay.length>0&&!inputDelay.some(id=>/-min/.test(id)))
    issues.push({ sev:"warning", code:"SDC-028", msg:"No set_input_delay -min — hold timing at input ports cannot be checked." });
  if (outputDelay.length>0&&!outputDelay.some(od=>/-min/.test(od)))
    issues.push({ sev:"warning", code:"SDC-029", msg:"No set_output_delay -min — hold timing at output ports is unconstrained." });

  if (clocks.length>0&&propagated.length===0)
    issues.push({ sev:"warning", code:"SDC-030", msg:"No set_propagated_clock — ideal clock model is over-optimistic." });

  clkGroups.forEach(cg=>{
    if (!/-asynchronous|-logically_exclusive|-physically_exclusive/.test(cg))
      issues.push({ sev:"warning", code:"SDC-031", msg:`set_clock_groups without -asynchronous/-logically_exclusive/-physically_exclusive.` });
  });

  if (timingDerate.length>0) {
    const hasEarly=timingDerate.some(t=>/-early/.test(t));
    const hasLate=timingDerate.some(t=>/-late/.test(t));
    if (hasEarly&&!hasLate) issues.push({ sev:"warning", code:"SDC-032", msg:"set_timing_derate has -early but no -late." });
    if (hasLate&&!hasEarly)  issues.push({ sev:"warning", code:"SDC-033", msg:"set_timing_derate has -late but no -early." });
  }

  dataCheck.forEach(dc=>{ if(!/-clock/.test(dc)) issues.push({ sev:"warning", code:"SDC-034", msg:`set_data_check without -clock reference.` }); });

  if (disableTiming.length>5)
    issues.push({ sev:"warning", code:"SDC-035", msg:`${disableTiming.length} set_disable_timing commands — large count can hide real violations.` });
  disableTiming.forEach(dt=>{
    if (!/-from/.test(dt)&&!/-to/.test(dt))
      issues.push({ sev:"warning", code:"SDC-036", msg:`set_disable_timing without -from/-to disables ALL arcs on the cell — almost always wrong.` });
  });

  const halfSetup=mcPaths.filter(mc=>/-setup/.test(mc)&&(/-rise_to/.test(mc)||/-fall_to/.test(mc)));
  const halfHold=mcPaths.filter(mc=>/-hold/.test(mc)&&(/-rise_to/.test(mc)||/-fall_to/.test(mc)));
  if (halfSetup.length>0&&halfHold.length===0)
    issues.push({ sev:"warning", code:"SDC-037", msg:"Half-cycle setup paths found but no matching -hold 0 counterpart. Hold analysis will be incorrect." });

  // ── INFO ────────────────────────────────────────────────────────────────────
  if (!sdcVersion.length)     info.push({ code:"SDC-100", msg:"No sdc_version declaration. Add 'set sdc_version 2.2' at the top." });
  if (!setUnits.length)       info.push({ code:"SDC-101", msg:"No set_units. Add 'set_units -time ns -capacitance pF' to avoid unit mismatches between tools." });
  if (!maxFanout.length)      info.push({ code:"SDC-102", msg:"No set_max_fanout — add set_max_fanout 20 [all_inputs]." });
  if (!maxTrans.length)       info.push({ code:"SDC-103", msg:"No set_max_transition — add set_max_transition 0.2 [all_nets]." });
  if (!maxCap.length)         info.push({ code:"SDC-104", msg:"No set_max_capacitance." });
  if (!load.length)           info.push({ code:"SDC-105", msg:"No set_load on outputs." });
  if (!drivingCell.length&&!inputTransition.length&&!drive.length)
                              info.push({ code:"SDC-106", msg:"No set_driving_cell / set_input_transition / set_drive — input slew is ideal." });
  if (!clkLatency.length)     info.push({ code:"SDC-107", msg:"No set_clock_latency — model insertion delay with set_clock_latency -source before CTS." });
  if (!clkTransition.length)  info.push({ code:"SDC-108", msg:"No set_clock_transition — constrain clock slew with set_clock_transition 0.1 [all_clocks]." });
  if (!caseAnalysis.length)   info.push({ code:"SDC-109", msg:"No set_case_analysis — use for scan_en, test_mode to prevent DFT paths from dominating timing." });
  if (!idealNetwork.length&&clocks.length>0) info.push({ code:"SDC-110", msg:"No set_ideal_network — mark reset/scan_en as ideal." });
  if (falsePaths.length>10)   info.push({ code:"SDC-111", msg:`${falsePaths.length} set_false_path commands — audit each.` });
  if (mcPaths.length>8)       info.push({ code:"SDC-112", msg:`${mcPaths.length} set_multicycle_path commands — document each.` });
  if (!dontUse.length)        info.push({ code:"SDC-113", msg:"No set_dont_use — consider excluding weak/problematic cells." });
  if (!operCond.length)       info.push({ code:"SDC-114", msg:"No set_operating_conditions — specify PVT corner explicitly." });
  if (!timingDerate.length)   info.push({ code:"SDC-115", msg:"No set_timing_derate — needed for AOCV/POCVM advanced signoff." });
  if (!clkJitter.length)      info.push({ code:"SDC-116", msg:"No set_clock_jitter — model random jitter separately from uncertainty." });
  if (!groupPath.length)      info.push({ code:"SDC-117", msg:"No group_path — improves synthesis optimization focus on critical interfaces." });
  if (!clkGatingChk.length)   info.push({ code:"SDC-118", msg:"No set_clock_gating_check — needed if design uses clock gating cells." });
  if (disableTiming.length>0) info.push({ code:"SDC-119", msg:`${disableTiming.length} set_disable_timing found — verify each is intentional.` });
  if (minDelay.length>0)      info.push({ code:"SDC-120", msg:`${minDelay.length} set_min_delay — verify no conflicts with hold constraints.` });
  if (!wireLoadMode.length&&!wireLoadModel.length) info.push({ code:"SDC-121", msg:"No wire load constraints — needed for flows without extracted RC." });
  if (!maxArea.length)        info.push({ code:"SDC-122", msg:"No set_max_area — add area target for synthesis." });
  if (!maxDynPower.length&&!maxLeakPower.length) info.push({ code:"SDC-123", msg:"No power constraints." });
  if (!minPulseWidth.length&&clkGatingChk.length>0) info.push({ code:"SDC-124", msg:"set_clock_gating_check present but no set_min_pulse_width." });
  if (voltage.length>0&&voltageArea.length===0)    info.push({ code:"SDC-125", msg:"set_voltage found but no create_voltage_area." });
  if (virtualClocks.length>0) info.push({ code:"SDC-126", msg:`${virtualClocks.length} virtual clock(s) detected — ensure set_input_delay/set_output_delay references them correctly.` });

  const stats={
    clocks:clocks.length, genClocks:genClocks.length, virtualClocks:virtualClocks.length,
    inputDelay:inputDelay.length, outputDelay:outputDelay.length,
    falsePaths:falsePaths.length, mcPaths:mcPaths.length,
    clkGroups:clkGroups.length, clkUncertainty:clkUncertainty.length,
    clkTransition:clkTransition.length, clkJitter:clkJitter.length,
    maxTrans:maxTrans.length, maxCap:maxCap.length,
    caseAnalysis:caseAnalysis.length, disableTiming:disableTiming.length,
    timingDerate:timingDerate.length, operCond:operCond.length,
    groupPath:groupPath.length, propagated:propagated.length,
  };
  return { issues, info, stats };
}

// ── CHECKER PAGE ───────────────────────────────────────────────────────────────
function SDCCheckerPage() {
  const [sdcText,  setSdcText]  = useState("");
  const [filename, setFilename] = useState("");
  const [result,   setResult]   = useState(null);
  const [expanded, setExpanded] = useState({});
  const [drag,     setDrag]     = useState(false);
  const fileRef=useRef();

  const analyze=useCallback((text,name)=>{ setSdcText(text); setFilename(name); setResult(parseSDC(text)); setExpanded({}); },[]);
  const handleFile=useCallback(file=>{ const r=new FileReader(); r.onload=e=>analyze(e.target.result,file.name); r.readAsText(file); },[analyze]);
  const toggle=id=>setExpanded(e=>({...e,[id]:!e[id]}));
  const errors   =result?.issues.filter(i=>i.sev==="error")  ||[];
  const warnings =result?.issues.filter(i=>i.sev==="warning")||[];

  return (
    <div>
      <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
        onClick={()=>fileRef.current.click()}
        style={{ border:`2px dashed ${drag?"#378ADD":"#cbd5e1"}`, borderRadius:12, padding:"22px 20px",
          textAlign:"center", cursor:"pointer", background:drag?"#E6F1FB":"#f9fafb", transition:"all 0.2s", marginBottom:16 }}>
        <Upload size={22} color={drag?"#378ADD":"#9ca3af"} style={{ margin:"0 auto 8px", display:"block" }}/>
        <div style={{ fontSize:13, fontWeight:600, color:drag?"#378ADD":"#374151" }}>{filename||"Drop your .sdc file here or click to browse"}</div>
        <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>.sdc .tcl .txt</div>
        <input ref={fileRef} type="file" accept=".sdc,.tcl,.txt" style={{ display:"none" }}
          onChange={e=>{const f=e.target.files[0];if(f)handleFile(f);e.target.value="";}}/>
      </div>

      {!result&&(
        <Card style={{ marginBottom:16, padding:"12px 16px" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"#6b7280", marginBottom:8 }}>Or paste SDC text directly</div>
          <textarea value={sdcText} onChange={e=>setSdcText(e.target.value)}
            placeholder={"set sdc_version 2.2\nset_units -time ns -capacitance pF\ncreate_clock -name clk_core -period 5.0 [get_ports clk]\n..."}
            style={{ width:"100%", height:130, padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8,
              fontSize:11, fontFamily:"monospace", color:"#374151", resize:"vertical", outline:"none", background:"#fafafa", boxSizing:"border-box" }}/>
          <button onClick={()=>{if(sdcText.trim()) analyze(sdcText,"pasted.sdc");}} disabled={!sdcText.trim()}
            style={{ marginTop:8, padding:"7px 16px", background:sdcText.trim()?"#0f172a":"#e5e7eb", border:"none", borderRadius:8,
              color:sdcText.trim()?"#f1f5f9":"#9ca3af", fontSize:12, fontWeight:600, cursor:sdcText.trim()?"pointer":"default" }}>
            Analyze SDC
          </button>
        </Card>
      )}

      {result&&(
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
            {[
              { label:"Errors",   val:errors.length,    color:errors.length>0?C.error.mid:"#9ca3af",     bg:errors.length>0?C.error.bg:"#f9fafb" },
              { label:"Warnings", val:warnings.length,  color:warnings.length>0?C.warning.mid:"#9ca3af", bg:warnings.length>0?C.warning.bg:"#f9fafb" },
              { label:"Info",     val:result.info.length, color:C.info.mid, bg:C.info.bg },
              { label:"Clocks",   val:result.stats.clocks, color:"#7F77DD", bg:"#F5F3FF" },
            ].map(s=>(
              <Card key={s.label} style={{ textAlign:"center", padding:"11px", background:s.bg, borderColor:s.color+"44" }}>
                <div style={{ fontSize:22, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:10, color:"#6b7280", marginTop:4, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderRadius:10, marginBottom:14,
            background:errors.length===0&&warnings.length===0?C.note.bg:errors.length>0?C.error.bg:C.warning.bg,
            border:`1px solid ${errors.length===0&&warnings.length===0?C.note.border:errors.length>0?C.error.border:C.warning.border}` }}>
            {errors.length===0&&warnings.length===0
              ? <><CheckCircle size={15} color={C.note.mid}/><span style={{ fontSize:13, fontWeight:600, color:C.note.fg }}>SDC looks clean — no errors or warnings.</span></>
              : errors.length>0
              ? <><AlertCircle size={15} color={C.error.mid}/><span style={{ fontSize:13, fontWeight:600, color:C.error.fg }}>{errors.length} error{errors.length!==1?"s":""} found.</span></>
              : <><AlertTriangle size={15} color={C.warning.mid}/><span style={{ fontSize:13, fontWeight:600, color:C.warning.fg }}>{warnings.length} warning{warnings.length!==1?"s":""} to review.</span></>
            }
          </div>

          {result.issues.length>0&&(
            <Card style={{ padding:0, overflow:"hidden", marginBottom:12 }}>
              <div style={{ padding:"10px 16px", borderBottom:"1px solid #f3f4f6", fontSize:12, fontWeight:600, color:"#374151" }}>
                Issues — {result.issues.length} in <span style={{ fontFamily:"monospace", color:"#6b7280" }}>{filename}</span>
              </div>
              {result.issues.map((issue,i)=>(
                <div key={i} style={{ borderBottom:"1px solid #f9fafb", background:expanded[i]?"#f8fafc":"#fff" }}>
                  <div onClick={()=>toggle(i)} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 16px", cursor:"pointer" }}>
                    <SDCSev sev={issue.sev} label={issue.sev==="error"?"Error":"Warning"}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, background:"#f3f4f6", color:"#374151", padding:"1px 6px", borderRadius:4, marginRight:6 }}>{issue.code}</span>
                      <span style={{ fontSize:12, color:"#374151", lineHeight:1.5 }}>{issue.msg}</span>
                    </div>
                    {expanded[i]?<ChevronUp size={13} color="#9ca3af"/>:<ChevronDown size={13} color="#9ca3af"/>}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {result.info.length>0&&(
            <Card style={{ padding:0, overflow:"hidden", marginBottom:12 }}>
              <div style={{ padding:"10px 16px", borderBottom:"1px solid #f3f4f6", fontSize:12, fontWeight:600, color:"#374151" }}>
                Best practices — {result.info.length}
              </div>
              {result.info.map((item,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 16px", borderBottom:"1px solid #f9fafb" }}>
                  <Info size={13} color={C.info.mid} style={{ marginTop:2, flexShrink:0 }}/>
                  <div>
                    <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, background:C.info.bg, color:C.info.fg, padding:"1px 6px", borderRadius:4, marginRight:6 }}>{item.code}</span>
                    <span style={{ fontSize:12, color:"#374151" }}>{item.msg}</span>
                  </div>
                </div>
              ))}
            </Card>
          )}

          <Card style={{ padding:"12px 18px", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.8 }}>Contents</div>
              {[
                ["Clocks",result.stats.clocks],["Gen clocks",result.stats.genClocks],["Virtual clks",result.stats.virtualClocks],
                ["Input delays",result.stats.inputDelay],["Output delays",result.stats.outputDelay],
                ["False paths",result.stats.falsePaths],["Multicycle",result.stats.mcPaths],
                ["Clk groups",result.stats.clkGroups],["Uncertainty",result.stats.clkUncertainty],
                ["Clk transition",result.stats.clkTransition],["Max trans",result.stats.maxTrans],
                ["Case analysis",result.stats.caseAnalysis],["Disable arcs",result.stats.disableTiming],
                ["Derate",result.stats.timingDerate],["Group path",result.stats.groupPath],["Propagated",result.stats.propagated],
              ].map(([k,v])=>(
                <div key={k} style={{ fontSize:11 }}>
                  <span style={{ color:"#9ca3af", marginRight:4 }}>{k}</span>
                  <span style={{ fontFamily:"monospace", fontWeight:700, color:v>0?"#374151":"#d1d5db" }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
          <button onClick={()=>{setResult(null);setSdcText("");setFilename("");}}
            style={{ padding:"7px 14px", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer" }}>
            Check another file
          </button>
        </>
      )}
    </div>
  );
}

// ── GENERATOR PAGE ─────────────────────────────────────────────────────────────
const BLANK_CLK=()=>({ id:Date.now(), name:"", port:"", period:"", uncertainty:"0.15", clkType:"primary", masterClock:"", divideBy:"2", multiplyBy:"", dutyCycle:"", edgeShift:"", invert:false, preinvert:false, addFlag:false, combinational:false });

function SDCGeneratorPage() {
  // Header
  const [design,       setDesign]       = useState("MY_DESIGN");
  const [sdcVer,       setSdcVer]       = useState("2.2");
  const [addUnits,     setAddUnits]     = useState(true);
  const [timeUnit,     setTimeUnit]     = useState("ns");
  const [capUnit,      setCapUnit]      = useState("pF");
  const [resUnit,      setResUnit]      = useState("kOhm");
  // Clocks
  const [clocks,       setClocks]       = useState([{ id:1, name:"clk_core", port:"clk", period:"5.0", uncertainty:"0.15", clkType:"primary", masterClock:"", divideBy:"2", multiplyBy:"", dutyCycle:"", edgeShift:"", invert:false, preinvert:false, addFlag:false, combinational:false }]);
  const [addClkJitter, setAddClkJitter] = useState(false);
  const [clkJitterVal, setClkJitterVal] = useState("0.05");
  const [addClkTrans,  setAddClkTrans]  = useState(false);
  const [clkTransVal,  setClkTransVal]  = useState("0.1");
  const [addClkGating, setAddClkGating] = useState(false);
  const [clkGateSetup, setClkGateSetup] = useState("0.5");
  const [clkGateHold,  setClkGateHold]  = useState("0.2");
  const [addLatency,   setAddLatency]   = useState(false);
  const [latencyVal,   setLatencyVal]   = useState("0.5");
  const [addPropagated,setAddPropagated]= useState(false);
  // IO
  const [inDelayMax,   setInDelayMax]   = useState("1.2");
  const [inDelayMin,   setInDelayMin]   = useState("0.4");
  const [outDelayMax,  setOutDelayMax]  = useState("1.5");
  const [outDelayMin,  setOutDelayMin]  = useState("0.5");
  const [addDriveCell, setAddDriveCell] = useState(true);
  const [driveCellName,setDriveCellName]= useState("BUF_X4");
  const [addInpTrans,  setAddInpTrans]  = useState(false);
  const [inpTransVal,  setInpTransVal]  = useState("0.1");
  const [addLoad,      setAddLoad]      = useState(true);
  const [loadVal,      setLoadVal]      = useState("0.05");
  // Design rules
  const [maxFanout,    setMaxFanout]    = useState("20");
  const [maxTrans,     setMaxTrans]     = useState("0.2");
  const [maxCap,       setMaxCap]       = useState("0.1");
  const [minCap,       setMinCap]       = useState("");
  const [maxArea,      setMaxArea]      = useState("");
  // Oper / derate
  const [addOperCond,  setAddOperCond]  = useState(false);
  const [operCondName, setOperCondName] = useState("WORST");
  const [addDerate,    setAddDerate]    = useState(false);
  const [derateCellL,  setDerateCellL]  = useState("0.92");
  const [derateNetL,   setDerateNetL]   = useState("1.0");
  const [derateCellE,  setDerateCellE]  = useState("1.08");
  const [derateNetE,   setDerateNetE]   = useState("1.0");
  // Ideal / DFT
  const [addIdealRst,  setAddIdealRst]  = useState(true);
  const [rstPort,      setRstPort]      = useState("rst_n");
  const [addScan,      setAddScan]      = useState(false);
  const [scanPort,     setScanPort]     = useState("scan_en");
  const [addMinPulse,  setAddMinPulse]  = useState(false);
  const [minPulseVal,  setMinPulseVal]  = useState("0.5");
  const [caseEntries,  setCaseEntries]  = useState([{ target:"scan_en", value:"0", objType:"port" }]);
  // Disable arcs
  const [disableArcs,  setDisableArcs]  = useState([{ cell:"", fromPin:"", toPin:"" }]);
  // Path groups
  const [addGroupPath, setAddGroupPath] = useState(false);
  const [pathGroups,   setPathGroups]   = useState([{ name:"reg2reg", from:"", to:"", weight:"1" }]);
  // Wire load
  const [addWireLoad,  setAddWireLoad]  = useState(false);
  const [wireLoadMode, setWireLoadMode] = useState("top");
  const [wireLoadModel,setWireLoadModel]= useState("");
  // Timing exceptions
  const [falsePaths,   setFalsePaths]   = useState([{ from:"", to:"" }]);
  const [mcPaths,      setMcPaths]      = useState([{ from:"", to:"", cycles:"2" }]);
  const [halfPaths,    setHalfPaths]    = useState([{ clock:"", direction:"rise_to_fall" }]);
  const [showHalf,     setShowHalf]     = useState(false);
  // Power
  const [addPower,     setAddPower]     = useState(false);
  const [maxDynPow,    setMaxDynPow]    = useState("100");
  const [maxLeakPow,   setMaxLeakPow]   = useState("10");
  // Dont-use
  const [dontUse,      setDontUse]      = useState([{ cell:"" }]);
  // Section toggles
  const [showClk,      setShowClk]      = useState(true);
  const [showIO,       setShowIO]       = useState(true);
  const [showRules,    setShowRules]    = useState(true);
  const [showOper,     setShowOper]     = useState(false);
  const [showDerate,   setShowDerate]   = useState(false);
  const [showIdeal,    setShowIdeal]    = useState(false);
  const [showDisable,  setShowDisable]  = useState(false);
  const [showGrpPath,  setShowGrpPath]  = useState(false);
  const [showWire,     setShowWire]     = useState(false);
  const [showExcept,   setShowExcept]   = useState(false);
  const [showPower,    setShowPower]    = useState(false);
  const [showDontUse,  setShowDontUse]  = useState(false);

  const setClock=(id,k,v)=>setClocks(c=>c.map(cl=>cl.id===id?{...cl,[k]:v}:cl));

  const generateSDC=()=>{
    const L=[];
    const ts=new Date().toISOString().slice(0,10);
    const primaryClkNames=clocks.filter(c=>c.clkType==="primary"&&c.name);
    const pClk=primaryClkNames[0]?.name||"clk_core";
    const clkPortList=clocks.filter(c=>c.port&&c.clkType!=="virtual").map(c=>c.port).join(" ");
    const excludePorts=[clkPortList,rstPort||"rst_n"].filter(Boolean).join(" ");

    L.push(`set sdc_version ${sdcVer}`);
    if (addUnits) L.push(`set_units -time ${timeUnit} -capacitance ${capUnit} -resistance ${resUnit}`);
    L.push(`# ${design}.sdc  —  generated by VLSI Hub SDC Tools  ${ts}`);
    L.push(`# NOTE: Review all values before using in synthesis.`);
    L.push(``);

    // Clock definitions
    L.push(`# ── Clock definitions ───────────────────────────────────────────`);
    clocks.filter(c=>c.name).forEach(c=>{
      if (c.clkType==="virtual") {
        L.push(`# Virtual clock — no physical port source`);
        L.push(`create_clock -name ${c.name} -period ${c.period||"10.0"}`);
      } else if (c.clkType==="primary") {
        if (!c.port||!c.period) return;
        const wave=c.dutyCycle ? ` -waveform {0 ${(parseFloat(c.period)*parseFloat(c.dutyCycle)/100).toFixed(3)}}` : "";
        L.push(`create_clock -name ${c.name} -period ${c.period}${wave} [get_ports ${c.port}]`);
      } else {
        // Generated clock — full switch set
        if (!c.port||!c.masterClock) return;
        L.push(`create_generated_clock -name ${c.name} \\`);
        L.push(`  -source [get_ports ${c.masterClock}] \\`);
        if (c.multiplyBy)      L.push(`  -multiply_by ${c.multiplyBy} \\`);
        else                   L.push(`  -divide_by ${c.divideBy||"2"} \\`);
        if (c.dutyCycle)       L.push(`  -duty_cycle ${c.dutyCycle} \\`);
        if (c.edgeShift)       L.push(`  -edge_shift {${c.edgeShift}} \\`);
        if (c.invert)          L.push(`  -invert \\`);
        if (c.preinvert)       L.push(`  -preinvert \\`);
        if (c.combinational)   L.push(`  -combinational \\`);
        if (c.addFlag)         L.push(`  -add \\`);
        if (primaryClkNames.length>1) L.push(`  -master_clock ${c.masterClock} \\`);
        L.push(`  [get_ports ${c.port}]`);
      }
    });
    L.push(``);

    // Clock attributes
    L.push(`# ── Clock attributes ────────────────────────────────────────────`);
    clocks.filter(c=>c.name&&c.uncertainty).forEach(c=>{
      const hold=(parseFloat(c.uncertainty)*0.5).toFixed(3);
      L.push(`set_clock_uncertainty -setup ${c.uncertainty} [get_clocks ${c.name}]`);
      L.push(`set_clock_uncertainty -hold  ${hold} [get_clocks ${c.name}]`);
    });
    if (addLatency&&latencyVal) {
      const allNames=clocks.filter(c=>c.name).map(c=>c.name).join(" ");
      L.push(`set_clock_latency -source ${latencyVal} [get_clocks {${allNames}}]`);
    }
    const propClks=clocks.filter(c=>c.clkType!=="virtual"&&c.name);
    if (addPropagated&&propClks.length>0)
      L.push(`set_propagated_clock [get_clocks {${propClks.map(c=>c.name).join(" ")}}]`);
    if (addClkTrans&&clkTransVal)
      L.push(`set_clock_transition ${clkTransVal} [all_clocks]`);
    if (addClkJitter&&clkJitterVal) {
      const allNames=clocks.filter(c=>c.name).map(c=>c.name).join(" ");
      L.push(`set_clock_jitter -clock [get_clocks {${allNames}}] -cycle ${clkJitterVal}`);
    }
    if (addClkGating)
      L.push(`set_clock_gating_check -setup ${clkGateSetup} -hold ${clkGateHold}`);

    const pClks=clocks.filter(c=>c.clkType==="primary"&&c.name);
    if (pClks.length>1) {
      L.push(``);
      L.push(`# ── CDC — asynchronous clock groups ────────────────────────────`);
      L.push(`set_clock_groups -asynchronous \\`);
      pClks.forEach((c,i)=>L.push(`  -group [get_clocks ${c.name}]${i<pClks.length-1?" \\":""}`));
    }
    L.push(``);

    // I/O
    L.push(`# ── I/O constraints ─────────────────────────────────────────────`);
    if (inDelayMax) { L.push(`set_input_delay -max ${inDelayMax} -clock ${pClk} \\`); L.push(`  [remove_from_collection [all_inputs] [get_ports {${excludePorts}}]]`); }
    if (inDelayMin) { L.push(`set_input_delay -min ${inDelayMin} -clock ${pClk} \\`); L.push(`  [remove_from_collection [all_inputs] [get_ports {${excludePorts}}]]`); }
    if (outDelayMax) L.push(`set_output_delay -max ${outDelayMax} -clock ${pClk} [all_outputs]`);
    if (outDelayMin) L.push(`set_output_delay -min ${outDelayMin} -clock ${pClk} [all_outputs]`);
    if (addDriveCell&&driveCellName&&!addInpTrans) {
      L.push(`set_driving_cell -lib_cell ${driveCellName} -pin Z \\`);
      L.push(`  [remove_from_collection [all_inputs] [get_ports {${clkPortList}}]]`);
    }
    if (addInpTrans&&inpTransVal&&!addDriveCell) {
      L.push(`set_input_transition ${inpTransVal} \\`);
      L.push(`  [remove_from_collection [all_inputs] [get_ports {${clkPortList}}]]`);
    }
    if (addLoad&&loadVal) L.push(`set_load ${loadVal} [all_outputs]`);
    L.push(``);

    // Design rules
    L.push(`# ── Design rule constraints ─────────────────────────────────────`);
    if (maxFanout) L.push(`set_max_fanout     ${maxFanout} [all_inputs]`);
    if (maxTrans)  L.push(`set_max_transition ${maxTrans} [all_nets]`);
    if (maxCap)    L.push(`set_max_capacitance ${maxCap} [all_nets]`);
    if (minCap)    L.push(`set_min_capacitance ${minCap} [all_nets]`);
    if (maxArea)   L.push(`set_max_area ${maxArea}`);
    L.push(``);

    if (addOperCond&&operCondName) {
      L.push(`# ── Operating conditions ────────────────────────────────────────`);
      L.push(`set_operating_conditions -max ${operCondName}`);
      L.push(``);
    }
    if (addDerate) {
      L.push(`# ── Timing derate (AOCV) ────────────────────────────────────────`);
      L.push(`set_timing_derate -late  -cell_delay ${derateCellL} [all_nets]`);
      L.push(`set_timing_derate -early -cell_delay ${derateCellE} [all_nets]`);
      L.push(`set_timing_derate -late  -net_delay  ${derateNetL}  [all_nets]`);
      L.push(`set_timing_derate -early -net_delay  ${derateNetE}  [all_nets]`);
      L.push(``);
    }
    if (addIdealRst&&rstPort) {
      L.push(`# ── Ideal networks ──────────────────────────────────────────────`);
      L.push(`set_ideal_network [get_ports ${rstPort}]`);
      L.push(`set_false_path -from [get_ports ${rstPort}]`);
      L.push(``);
    }
    if (addScan&&scanPort) {
      L.push(`# ── Scan / DFT ──────────────────────────────────────────────────`);
      L.push(`set_case_analysis 0 [get_ports ${scanPort}]`);
      L.push(`set_ideal_network [get_ports ${scanPort}]`);
      L.push(``);
    }
    if (addMinPulse&&minPulseVal) {
      L.push(`set_min_pulse_width -low ${minPulseVal} [all_clocks]`);
      L.push(`set_min_pulse_width -high ${minPulseVal} [all_clocks]`);
      L.push(``);
    }
    const validCA=caseEntries.filter(e=>e.target&&e.value);
    if (validCA.length>0) {
      L.push(`# ── Case analysis entries ───────────────────────────────────────`);
      validCA.forEach(e=>{
        const obj=e.objType==="pin"?`[get_pins ${e.target}]`:`[get_ports ${e.target}]`;
        L.push(`set_case_analysis ${e.value} ${obj}`);
      });
      L.push(``);
    }
    const validDA=disableArcs.filter(d=>d.cell&&d.fromPin&&d.toPin);
    if (showDisable&&validDA.length>0) {
      L.push(`# ── Disable timing arcs ─────────────────────────────────────────`);
      validDA.forEach(d=>L.push(`set_disable_timing -from ${d.fromPin} -to ${d.toPin} [get_cells ${d.cell}]`));
      L.push(``);
    }
    if (addGroupPath&&showGrpPath) {
      const validGP=pathGroups.filter(g=>g.name);
      if (validGP.length>0) {
        L.push(`# ── Path groups ─────────────────────────────────────────────────`);
        validGP.forEach(g=>{
          let cmd=`group_path -name ${g.name}`;
          if (g.from) cmd+=` -from [get_ports ${g.from}]`;
          if (g.to)   cmd+=` -to [get_ports ${g.to}]`;
          if (g.weight&&g.weight!=="1") cmd+=` -weight ${g.weight}`;
          L.push(cmd);
        });
        L.push(``);
      }
    }
    if (addWireLoad) {
      L.push(`# ── Wire load ───────────────────────────────────────────────────`);
      L.push(`set_wire_load_mode ${wireLoadMode}`);
      if (wireLoadModel) L.push(`set_wire_load_model -name ${wireLoadModel} [current_design]`);
      L.push(``);
    }
    const validFP=falsePaths.filter(f=>f.from&&f.to);
    const validMC=mcPaths.filter(m=>m.from&&m.to&&m.cycles);
    if (showExcept&&(validFP.length>0||validMC.length>0)) {
      if (validFP.length>0) {
        L.push(`# ── False paths ─────────────────────────────────────────────────`);
        validFP.forEach(fp=>L.push(`set_false_path -from [get_ports ${fp.from}] -to [get_ports ${fp.to}]`));
        L.push(``);
      }
      if (validMC.length>0) {
        L.push(`# ── Multicycle paths ────────────────────────────────────────────`);
        validMC.forEach(mc=>{
          L.push(`set_multicycle_path -setup ${mc.cycles} -from [get_cells ${mc.from}] -to [get_cells ${mc.to}]`);
          L.push(`set_multicycle_path -hold  ${parseInt(mc.cycles)-1} -from [get_cells ${mc.from}] -to [get_cells ${mc.to}]`);
        });
        L.push(``);
      }
    }
    const validHP=halfPaths.filter(h=>h.clock);
    if (showHalf&&validHP.length>0) {
      L.push(`# ── Half-cycle paths ────────────────────────────────────────────`);
      L.push(`# Half-cycle: launches on one edge, captures on opposite (budget = period/2)`);
      validHP.forEach(h=>{
        const ref=`[get_clocks ${h.clock}]`;
        if (h.direction==="rise_to_fall"||h.direction==="both") {
          L.push(`set_multicycle_path -setup 1 -end -rise_to ${ref}`);
          L.push(`set_multicycle_path -hold  0 -end -rise_to ${ref}`);
        }
        if (h.direction==="fall_to_rise"||h.direction==="both") {
          L.push(`set_multicycle_path -setup 1 -end -fall_to ${ref}`);
          L.push(`set_multicycle_path -hold  0 -end -fall_to ${ref}`);
        }
      });
      L.push(``);
    }
    if (addPower&&showPower) {
      L.push(`# ── Power constraints ───────────────────────────────────────────`);
      if (maxDynPow)  L.push(`set_max_dynamic_power ${maxDynPow} mW`);
      if (maxLeakPow) L.push(`set_max_leakage_power ${maxLeakPow} uW`);
      L.push(``);
    }
    const validDU=dontUse.filter(d=>d.cell);
    if (showDontUse&&validDU.length>0) {
      L.push(`# ── Dont-use cells ──────────────────────────────────────────────`);
      validDU.forEach(d=>L.push(`set_dont_use [get_lib_cells */${d.cell}]`));
    }
    return L.join("\n");
  };

  const sdc=generateSDC();

  const ClkTypeBadge=({type,onClick})=>{
    const styles={
      primary:{ bg:C.note.bg, col:C.note.fg, border:"#97C459", label:"Primary" },
      generated:{ bg:C.info.bg, col:C.info.fg, border:"#85B7EB", label:"Generated" },
      virtual:{ bg:"#F5F3FF", col:"#4c1d95", border:"#ddd6fe", label:"Virtual" },
    };
    const s=styles[type]||styles.primary;
    return <button onClick={onClick} style={{ padding:"2px 10px", borderRadius:20, fontSize:10, fontWeight:600, cursor:"pointer", border:`1px solid ${s.border}`, background:s.bg, color:s.col }}>{s.label}</button>;
  };

  const cycleClkType=(c)=>{
    const order=["primary","generated","virtual"];
    const next=order[(order.indexOf(c.clkType)+1)%3];
    setClock(c.id,"clkType",next);
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, alignItems:"start" }}>
      <div>
        {/* Header */}
        <Card style={{ marginBottom:10 }}>
          <ST>File header</ST>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
            <FField label="Design name"><Inp value={design} onChange={setDesign} placeholder="MY_DESIGN"/></FField>
            <FField label="SDC version">
              <Sel value={sdcVer} onChange={setSdcVer}>
                <option value="2.2">2.2 (recommended)</option>
                <option value="2.1">2.1</option>
                <option value="2.0">2.0</option>
                <option value="1.9">1.9</option>
              </Sel>
            </FField>
          </div>
          <Chk checked={addUnits} onChange={setAddUnits} label="Add set_units"/>
          {addUnits&&(
            <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:11, color:"#6b7280" }}>Time</span><Sel value={timeUnit} onChange={setTimeUnit} style={{ width:70 }}><option>ns</option><option>ps</option></Sel></div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:11, color:"#6b7280" }}>Cap</span><Sel value={capUnit} onChange={setCapUnit} style={{ width:70 }}><option>pF</option><option>fF</option></Sel></div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:11, color:"#6b7280" }}>Res</span><Sel value={resUnit} onChange={setResUnit} style={{ width:80 }}><option>kOhm</option><option>Ohm</option></Sel></div>
            </div>
          )}
        </Card>

        {/* Clock definitions */}
        <ColSec label="Clock definitions" badge={clocks.length} open={showClk} onToggle={()=>setShowClk(s=>!s)}>
          {clocks.map((c)=>(
            <div key={c.id} style={{ background:"#f9fafb", borderRadius:10, padding:"12px 14px", marginBottom:10, border:"1px solid #e5e7eb" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"#374151" }}>Clock</span>
                  <ClkTypeBadge type={c.clkType} onClick={()=>cycleClkType(c)}/>
                  <span style={{ fontSize:10, color:"#9ca3af" }}>click to cycle type</span>
                </div>
                {clocks.length>1&&<button onClick={()=>setClocks(cl=>cl.filter(x=>x.id!==c.id))} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af", padding:0 }}><Trash2 size={13}/></button>}
              </div>

              {c.clkType==="primary"&&(
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                  <FField label="Name"><Inp value={c.name} onChange={v=>setClock(c.id,"name",v)} placeholder="clk_core"/></FField>
                  <FField label="Port"><Inp value={c.port} onChange={v=>setClock(c.id,"port",v)} placeholder="clk"/></FField>
                  <FField label="Period (ns)"><Inp value={c.period} onChange={v=>setClock(c.id,"period",v)} placeholder="5.0" type="number"/></FField>
                  <FField label="Duty cycle %" hint="Optional"><Inp value={c.dutyCycle} onChange={v=>setClock(c.id,"dutyCycle",v)} placeholder="50" type="number"/></FField>
                  <FField label="Uncertainty (ns)" hint="Hold = half"><Inp value={c.uncertainty} onChange={v=>setClock(c.id,"uncertainty",v)} placeholder="0.15" type="number"/></FField>
                </div>
              )}

              {c.clkType==="virtual"&&(
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  <FField label="Name"><Inp value={c.name} onChange={v=>setClock(c.id,"name",v)} placeholder="vclk_io"/></FField>
                  <FField label="Period (ns)"><Inp value={c.period} onChange={v=>setClock(c.id,"period",v)} placeholder="10.0" type="number"/></FField>
                  <FField label="Uncertainty (ns)"><Inp value={c.uncertainty} onChange={v=>setClock(c.id,"uncertainty",v)} placeholder="0.15" type="number"/></FField>
                </div>
              )}

              {c.clkType==="generated"&&(
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                    <FField label="Name"><Inp value={c.name} onChange={v=>setClock(c.id,"name",v)} placeholder="clk_div2"/></FField>
                    <FField label="Output port"><Inp value={c.port} onChange={v=>setClock(c.id,"port",v)} placeholder="clk_div2_out"/></FField>
                    <FField label="-source (master port)"><Inp value={c.masterClock} onChange={v=>setClock(c.id,"masterClock",v)} placeholder="clk"/></FField>
                    <FField label="Uncertainty (ns)"><Inp value={c.uncertainty} onChange={v=>setClock(c.id,"uncertainty",v)} placeholder="0.15" type="number"/></FField>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                    <FField label="-divide_by"><Inp value={c.divideBy} onChange={v=>setClock(c.id,"divideBy",v)} placeholder="2" type="number"/></FField>
                    <FField label="-multiply_by" hint="Overrides divide"><Inp value={c.multiplyBy} onChange={v=>setClock(c.id,"multiplyBy",v)} placeholder="" type="number"/></FField>
                    <FField label="-duty_cycle %" hint="Optional"><Inp value={c.dutyCycle} onChange={v=>setClock(c.id,"dutyCycle",v)} placeholder="" type="number"/></FField>
                    <FField label="-edge_shift list" hint="Optional"><Inp value={c.edgeShift} onChange={v=>setClock(c.id,"edgeShift",v)} placeholder="0 0 0"/></FField>
                  </div>
                  <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                    <Chk checked={c.invert} onChange={v=>setClock(c.id,"invert",v)} label="-invert"/>
                    <Chk checked={c.preinvert} onChange={v=>setClock(c.id,"preinvert",v)} label="-preinvert"/>
                    <Chk checked={c.combinational} onChange={v=>setClock(c.id,"combinational",v)} label="-combinational"/>
                    <Chk checked={c.addFlag} onChange={v=>setClock(c.id,"addFlag",v)} label="-add (multiple clocks on same pin)"/>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button onClick={()=>setClocks(c=>[...c,BLANK_CLK()])}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 12px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f1f5f9", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer", marginBottom:12 }}>
            <Plus size={11}/> Add clock
          </button>

          <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:10 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#374151", marginBottom:8 }}>Clock attributes</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:6 }}>
              <Chk checked={addLatency} onChange={setAddLatency} label="Latency (ns)"/>
              {addLatency&&<Inp value={latencyVal} onChange={setLatencyVal} placeholder="0.5" type="number" style={{ width:80 }}/>}
              <Chk checked={addPropagated} onChange={setAddPropagated} label="set_propagated_clock"/>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:6 }}>
              <Chk checked={addClkTrans} onChange={setAddClkTrans} label="Clock transition (ns)"/>
              {addClkTrans&&<Inp value={clkTransVal} onChange={setClkTransVal} placeholder="0.1" type="number" style={{ width:80 }}/>}
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:6 }}>
              <Chk checked={addClkJitter} onChange={setAddClkJitter} label="Clock jitter -cycle (ns)"/>
              {addClkJitter&&<Inp value={clkJitterVal} onChange={setClkJitterVal} placeholder="0.05" type="number" style={{ width:80 }}/>}
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <Chk checked={addClkGating} onChange={setAddClkGating} label="Clock gating check"/>
              {addClkGating&&(
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#6b7280" }}>Setup</span>
                  <Inp value={clkGateSetup} onChange={setClkGateSetup} placeholder="0.5" type="number" style={{ width:70 }}/>
                  <span style={{ fontSize:11, color:"#6b7280" }}>Hold</span>
                  <Inp value={clkGateHold} onChange={setClkGateHold} placeholder="0.2" type="number" style={{ width:70 }}/>
                </div>
              )}
            </div>
          </div>
        </ColSec>

        {/* I/O */}
        <ColSec label="I/O constraints" badge={0} open={showIO} onToggle={()=>setShowIO(s=>!s)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <FField label="Input delay -max (ns)"><Inp value={inDelayMax} onChange={setInDelayMax} placeholder="1.2" type="number"/></FField>
            <FField label="Input delay -min (ns)" hint="Hold"><Inp value={inDelayMin} onChange={setInDelayMin} placeholder="0.4" type="number"/></FField>
            <FField label="Output delay -max (ns)"><Inp value={outDelayMax} onChange={setOutDelayMax} placeholder="1.5" type="number"/></FField>
            <FField label="Output delay -min (ns)" hint="Hold"><Inp value={outDelayMin} onChange={setOutDelayMin} placeholder="0.5" type="number"/></FField>
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:4 }}>
            <div>
              <Chk checked={addDriveCell&&!addInpTrans} onChange={v=>{setAddDriveCell(v);if(v)setAddInpTrans(false);}} label="set_driving_cell"/>
              {addDriveCell&&!addInpTrans&&<Inp value={driveCellName} onChange={setDriveCellName} placeholder="BUF_X4" style={{ marginTop:4 }}/>}
            </div>
            <div>
              <Chk checked={addInpTrans&&!addDriveCell} onChange={v=>{setAddInpTrans(v);if(v)setAddDriveCell(false);}} label="set_input_transition (ns)"/>
              {addInpTrans&&!addDriveCell&&<Inp value={inpTransVal} onChange={setInpTransVal} placeholder="0.1" type="number" style={{ width:80, marginTop:4 }}/>}
            </div>
            <div>
              <Chk checked={addLoad} onChange={setAddLoad} label="set_load (pF)"/>
              {addLoad&&<Inp value={loadVal} onChange={setLoadVal} placeholder="0.05" type="number" style={{ width:80, marginTop:4 }}/>}
            </div>
          </div>
        </ColSec>

        {/* Design rules */}
        <ColSec label="Design rule constraints" badge={0} open={showRules} onToggle={()=>setShowRules(s=>!s)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            <FField label="Max fanout"><Inp value={maxFanout} onChange={setMaxFanout} placeholder="20" type="number"/></FField>
            <FField label="Max transition (ns)"><Inp value={maxTrans} onChange={setMaxTrans} placeholder="0.2" type="number"/></FField>
            <FField label="Max cap (pF)"><Inp value={maxCap} onChange={setMaxCap} placeholder="0.1" type="number"/></FField>
            <FField label="Min cap (pF)" hint="Optional"><Inp value={minCap} onChange={setMinCap} placeholder="" type="number"/></FField>
            <FField label="Max area" hint="0 = minimize"><Inp value={maxArea} onChange={setMaxArea} placeholder="" type="number"/></FField>
          </div>
        </ColSec>

        {/* Operating conditions */}
        <ColSec label="Operating conditions" badge={0} open={showOper} onToggle={()=>setShowOper(s=>!s)}>
          <Chk checked={addOperCond} onChange={setAddOperCond} label="Add set_operating_conditions"/>
          {addOperCond&&<div style={{ marginTop:8 }}><FField label="Corner name"><Inp value={operCondName} onChange={setOperCondName} placeholder="WORST"/></FField></div>}
        </ColSec>

        {/* Timing derate */}
        <ColSec label="Timing derate — AOCV" badge={0} open={showDerate} onToggle={()=>setShowDerate(s=>!s)}>
          <InfoBox sev="info">-late raises setup timing barrier, -early lowers hold timing barrier.</InfoBox>
          <Chk checked={addDerate} onChange={setAddDerate} label="Add set_timing_derate"/>
          {addDerate&&(
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginTop:8 }}>
              <FField label="-late cell"><Inp value={derateCellL} onChange={setDerateCellL} placeholder="0.92" type="number"/></FField>
              <FField label="-early cell"><Inp value={derateCellE} onChange={setDerateCellE} placeholder="1.08" type="number"/></FField>
              <FField label="-late net"><Inp value={derateNetL} onChange={setDerateNetL} placeholder="1.0" type="number"/></FField>
              <FField label="-early net"><Inp value={derateNetE} onChange={setDerateNetE} placeholder="1.0" type="number"/></FField>
            </div>
          )}
        </ColSec>

        {/* Ideal networks & DFT */}
        <ColSec label="Ideal networks & DFT" badge={0} open={showIdeal} onToggle={()=>setShowIdeal(s=>!s)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:10 }}>
            <div>
              <Chk checked={addIdealRst} onChange={setAddIdealRst} label="Reset — ideal + false path"/>
              {addIdealRst&&<Inp value={rstPort} onChange={setRstPort} placeholder="rst_n" style={{ marginTop:6 }}/>}
            </div>
            <div>
              <Chk checked={addScan} onChange={setAddScan} label="Scan enable — case analysis + ideal"/>
              {addScan&&<Inp value={scanPort} onChange={setScanPort} placeholder="scan_en" style={{ marginTop:6 }}/>}
            </div>
          </div>
          <Chk checked={addMinPulse} onChange={setAddMinPulse} label="Min pulse width (ns)"/>
          {addMinPulse&&<Inp value={minPulseVal} onChange={setMinPulseVal} placeholder="0.5" type="number" style={{ width:90, marginTop:6, marginBottom:12 }}/>}

          <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:10, marginTop:4 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#374151", marginBottom:6 }}>
              set_case_analysis entries
              <span style={{ fontSize:10, fontWeight:400, color:"#9ca3af", marginLeft:6 }}>0 / 1 / rising / falling</span>
            </div>
            {caseEntries.map((e,i)=>(
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 80px 90px auto", gap:6, alignItems:"end", marginBottom:6 }}>
                <FField label={i===0?"Port or pin":""}><Inp value={e.target} onChange={v=>setCaseEntries(a=>a.map((x,j)=>j===i?{...x,target:v}:x))} placeholder="scan_en"/></FField>
                <FField label={i===0?"Value":""}>
                  <Sel value={e.value} onChange={v=>setCaseEntries(a=>a.map((x,j)=>j===i?{...x,value:v}:x))}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="rising">rising</option>
                    <option value="falling">falling</option>
                  </Sel>
                </FField>
                <FField label={i===0?"Object type":""}>
                  <Sel value={e.objType} onChange={v=>setCaseEntries(a=>a.map((x,j)=>j===i?{...x,objType:v}:x))}>
                    <option value="port">port</option>
                    <option value="pin">pin</option>
                  </Sel>
                </FField>
                <button onClick={()=>setCaseEntries(a=>a.filter((_,j)=>j!==i))} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af", padding:"6px 0", marginBottom:10 }}><Trash2 size={13}/></button>
              </div>
            ))}
            <button onClick={()=>setCaseEntries(a=>[...a,{target:"",value:"0",objType:"port"}])}
              style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f1f5f9", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer" }}>
              <Plus size={11}/> Add entry
            </button>
          </div>
        </ColSec>

        {/* Disable timing arcs */}
        <ColSec label="Disable timing arcs" badge={disableArcs.filter(d=>d.cell&&d.fromPin&&d.toPin).length} open={showDisable} onToggle={()=>setShowDisable(s=>!s)}>
          <InfoBox sev="warning">Only disable arcs that are physically non-functional. Always specify -from and -to pins.</InfoBox>
          {disableArcs.map((d,i)=>(
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:6, alignItems:"end", marginBottom:6 }}>
              <FField label={i===0?"Cell":""}><Inp value={d.cell} onChange={v=>setDisableArcs(a=>a.map((x,j)=>j===i?{...x,cell:v}:x))} placeholder="U_MUX"/></FField>
              <FField label={i===0?"-from pin":""}><Inp value={d.fromPin} onChange={v=>setDisableArcs(a=>a.map((x,j)=>j===i?{...x,fromPin:v}:x))} placeholder="S0"/></FField>
              <FField label={i===0?"-to pin":""}><Inp value={d.toPin} onChange={v=>setDisableArcs(a=>a.map((x,j)=>j===i?{...x,toPin:v}:x))} placeholder="Z"/></FField>
              <button onClick={()=>setDisableArcs(a=>a.filter((_,j)=>j!==i))} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af", padding:"6px 0", marginBottom:10 }}><Trash2 size={13}/></button>
            </div>
          ))}
          <button onClick={()=>setDisableArcs(a=>[...a,{cell:"",fromPin:"",toPin:""}])}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f1f5f9", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer" }}>
            <Plus size={11}/> Add arc
          </button>
        </ColSec>

        {/* Path groups */}
        <ColSec label="Path groups" badge={pathGroups.filter(g=>g.name).length} open={showGrpPath} onToggle={()=>setShowGrpPath(s=>!s)}>
          <Chk checked={addGroupPath} onChange={setAddGroupPath} label="Generate group_path commands"/>
          {addGroupPath&&(
            <div style={{ marginTop:8 }}>
              {pathGroups.map((g,i)=>(
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 60px auto", gap:6, alignItems:"end", marginBottom:6 }}>
                  <FField label={i===0?"Name":""}><Inp value={g.name} onChange={v=>setPathGroups(a=>a.map((x,j)=>j===i?{...x,name:v}:x))} placeholder="reg2reg"/></FField>
                  <FField label={i===0?"From":""}><Inp value={g.from} onChange={v=>setPathGroups(a=>a.map((x,j)=>j===i?{...x,from:v}:x))} placeholder="optional"/></FField>
                  <FField label={i===0?"To":""}><Inp value={g.to} onChange={v=>setPathGroups(a=>a.map((x,j)=>j===i?{...x,to:v}:x))} placeholder="optional"/></FField>
                  <FField label={i===0?"Weight":""}><Inp value={g.weight} onChange={v=>setPathGroups(a=>a.map((x,j)=>j===i?{...x,weight:v}:x))} placeholder="1" type="number"/></FField>
                  <button onClick={()=>setPathGroups(a=>a.filter((_,j)=>j!==i))} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af", padding:"6px 0", marginBottom:10 }}><Trash2 size={13}/></button>
                </div>
              ))}
              <button onClick={()=>setPathGroups(a=>[...a,{name:"",from:"",to:"",weight:"1"}])}
                style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f1f5f9", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                <Plus size={11}/> Add group
              </button>
            </div>
          )}
        </ColSec>

        {/* Wire load */}
        <ColSec label="Wire load (legacy)" badge={0} open={showWire} onToggle={()=>setShowWire(s=>!s)}>
          <Chk checked={addWireLoad} onChange={setAddWireLoad} label="Add wire load constraints"/>
          {addWireLoad&&(
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
              <FField label="Mode">
                <Sel value={wireLoadMode} onChange={setWireLoadMode}>
                  <option value="top">top</option>
                  <option value="enclosed">enclosed</option>
                  <option value="segmented">segmented</option>
                </Sel>
              </FField>
              <FField label="Model name" hint="Optional"><Inp value={wireLoadModel} onChange={setWireLoadModel} placeholder="5K_hvratio_1_1"/></FField>
            </div>
          )}
        </ColSec>

        {/* Timing exceptions */}
        <ColSec label="Timing exceptions" badge={falsePaths.filter(f=>f.from&&f.to).length+mcPaths.filter(m=>m.from&&m.to).length} open={showExcept} onToggle={()=>setShowExcept(s=>!s)}>
          <div style={{ fontSize:11, fontWeight:600, color:"#374151", marginBottom:6 }}>False paths</div>
          <InfoBox sev="warning">Only add for genuinely async crossings or test logic.</InfoBox>
          {falsePaths.map((fp,i)=>(
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:6, alignItems:"end", marginBottom:6 }}>
              <FField label={i===0?"From":""}><Inp value={fp.from} onChange={v=>setFalsePaths(a=>a.map((x,j)=>j===i?{...x,from:v}:x))} placeholder="rst_n"/></FField>
              <FField label={i===0?"To":""}><Inp value={fp.to} onChange={v=>setFalsePaths(a=>a.map((x,j)=>j===i?{...x,to:v}:x))} placeholder="FF_OUT/D"/></FField>
              <button onClick={()=>setFalsePaths(a=>a.filter((_,j)=>j!==i))} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af", padding:"6px 0", marginBottom:10 }}><Trash2 size={13}/></button>
            </div>
          ))}
          <button onClick={()=>setFalsePaths(a=>[...a,{from:"",to:""}])} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f1f5f9", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer", marginBottom:14 }}>
            <Plus size={11}/> Add
          </button>

          <div style={{ fontSize:11, fontWeight:600, color:"#374151", marginBottom:6 }}>Multicycle paths</div>
          <InfoBox sev="info"><Zap size={11} style={{ marginRight:4, verticalAlign:-1 }}/>-hold fix (cycles-1) auto-added.</InfoBox>
          {mcPaths.map((mc,i)=>(
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 70px auto", gap:6, alignItems:"end", marginBottom:6 }}>
              <FField label={i===0?"From cell":""}><Inp value={mc.from} onChange={v=>setMcPaths(a=>a.map((x,j)=>j===i?{...x,from:v}:x))} placeholder="U_REG_A"/></FField>
              <FField label={i===0?"To cell":""}><Inp value={mc.to} onChange={v=>setMcPaths(a=>a.map((x,j)=>j===i?{...x,to:v}:x))} placeholder="U_REG_B"/></FField>
              <FField label={i===0?"Cycles":""}><Inp value={mc.cycles} onChange={v=>setMcPaths(a=>a.map((x,j)=>j===i?{...x,cycles:v}:x))} placeholder="2" type="number"/></FField>
              <button onClick={()=>setMcPaths(a=>a.filter((_,j)=>j!==i))} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af", padding:"6px 0", marginBottom:10 }}><Trash2 size={13}/></button>
            </div>
          ))}
          <button onClick={()=>setMcPaths(a=>[...a,{from:"",to:"",cycles:"2"}])} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f1f5f9", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer", marginBottom:14 }}>
            <Plus size={11}/> Add
          </button>

          <div style={{ fontSize:11, fontWeight:600, color:"#374151", marginBottom:4 }}>Half-cycle paths</div>
          <InfoBox sev="info">Paths where launch and capture edges are on opposite clock phases. Budget = period/2. -hold 0 is mandatory.</InfoBox>
          <Chk checked={showHalf} onChange={setShowHalf} label="Generate half-cycle path constraints"/>
          {showHalf&&(
            <div style={{ marginTop:8 }}>
              {halfPaths.map((h,i)=>(
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:6, alignItems:"end", marginBottom:6 }}>
                  <FField label={i===0?"Clock name":""}><Inp value={h.clock} onChange={v=>setHalfPaths(a=>a.map((x,j)=>j===i?{...x,clock:v}:x))} placeholder="clk_core"/></FField>
                  <FField label={i===0?"Direction":""}>
                    <Sel value={h.direction} onChange={v=>setHalfPaths(a=>a.map((x,j)=>j===i?{...x,direction:v}:x))}>
                      <option value="rise_to_fall">Rise to Fall (-rise_to)</option>
                      <option value="fall_to_rise">Fall to Rise (-fall_to)</option>
                      <option value="both">Both directions</option>
                    </Sel>
                  </FField>
                  <button onClick={()=>setHalfPaths(a=>a.filter((_,j)=>j!==i))} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af", padding:"6px 0", marginBottom:10 }}><Trash2 size={13}/></button>
                </div>
              ))}
              <button onClick={()=>setHalfPaths(a=>[...a,{clock:"",direction:"rise_to_fall"}])}
                style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f1f5f9", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                <Plus size={11}/> Add
              </button>
            </div>
          )}
        </ColSec>

        {/* Power */}
        <ColSec label="Power constraints" badge={0} open={showPower} onToggle={()=>setShowPower(s=>!s)}>
          <Chk checked={addPower} onChange={setAddPower} label="Add power constraints"/>
          {addPower&&(
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
              <FField label="Max dynamic power (mW)"><Inp value={maxDynPow} onChange={setMaxDynPow} placeholder="100" type="number"/></FField>
              <FField label="Max leakage power (uW)"><Inp value={maxLeakPow} onChange={setMaxLeakPow} placeholder="10" type="number"/></FField>
            </div>
          )}
        </ColSec>

        {/* Dont-use */}
        <ColSec label="Dont-use cells" badge={dontUse.filter(d=>d.cell).length} open={showDontUse} onToggle={()=>setShowDontUse(s=>!s)}>
          {dontUse.map((d,i)=>(
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:6, alignItems:"end", marginBottom:6 }}>
              <FField label={i===0?"Cell pattern":""}><Inp value={d.cell} onChange={v=>setDontUse(a=>a.map((x,j)=>j===i?{...x,cell:v}:x))} placeholder="CLKBUF_X1"/></FField>
              <button onClick={()=>setDontUse(a=>a.filter((_,j)=>j!==i))} style={{ border:"none", background:"none", cursor:"pointer", color:"#9ca3af", padding:"6px 0", marginBottom:10 }}><Trash2 size={13}/></button>
            </div>
          ))}
          <button onClick={()=>setDontUse(a=>[...a,{cell:""}])}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#f1f5f9", fontSize:11, fontWeight:600, color:"#374151", cursor:"pointer" }}>
            <Plus size={11}/> Add cell
          </button>
        </ColSec>
      </div>

      {/* Live SDC preview */}
      <div style={{ position:"sticky", top:0 }}>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderBottom:"1px solid #f3f4f6", background:"#f9fafb" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <FileCode size={14} color="#639922"/>
              <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{design||"design"}.sdc</span>
              <span style={{ fontSize:10, color:"#9ca3af" }}>{sdc.split("\n").length} lines</span>
              <span style={{ fontSize:10, background:C.note.bg, color:C.note.fg, padding:"1px 6px", borderRadius:10, fontWeight:600 }}>v{sdcVer}</span>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <CopyBtn text={sdc}/>
              <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(sdc)}`}
                download={`${design||"design"}.sdc`}
                style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 10px", background:"#0f172a",
                  borderRadius:6, color:"#f1f5f9", fontSize:11, fontWeight:600, cursor:"pointer", textDecoration:"none" }}>
                <Download size={11}/> Download .sdc
              </a>
            </div>
          </div>
          <pre style={{ margin:0, padding:"14px 16px", fontSize:11, fontFamily:"monospace", lineHeight:1.75,
            color:"#374151", background:"#fff", overflowX:"auto", maxHeight:720, overflowY:"auto", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
            {sdc.split("\n").map((line,i)=>(
              <span key={i} style={{ color:line.trim().startsWith("#")?"#94a3b8":/^(create_|set_|group_)/.test(line.trim())?"#1e40af":"#374151" }}>{line}{"\n"}</span>
            ))}
          </pre>
        </Card>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
function SDCToolsPage() {
  const [tab,setTab]=useState("checker");
  return (
    <div>
      <PageHeader title="SDC Tools" subtitle="Validate existing constraints · Generate a complete SDC for your design"/>
      <div style={{ display:"flex", marginBottom:20, borderBottom:"2px solid #f3f4f6" }}>
        {[{id:"checker",label:"Checker / Validator",icon:<ShieldCheck size={13}/>},{id:"generator",label:"SDC Generator",icon:<FileCode size={13}/>}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 20px", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:"transparent", color:tab===t.id?"#0C447C":"#6b7280", borderBottom:tab===t.id?"2px solid #378ADD":"2px solid transparent", marginBottom:-2 }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      {tab==="checker"&&<SDCCheckerPage/>}
      {tab==="generator"&&<SDCGeneratorPage/>}
    </div>
  );
}


export default function App() {
  const [active,     setActive]     = useState("overview");
  const [logData,    setLogData]    = useState(null);
  const [timingData, setTimingData] = useState(null);

  const pages = {
    overview: <OverviewPage logData={logData} timingData={timingData} setActive={setActive}/>,
    logs:     <LogAnalyzerPage logData={logData} setLogData={setLogData}/>,
    timing:   <TimingViewerPage timingData={timingData} setTimingData={setTimingData}/>,
    compare:  <RunComparisonPage/>,
    qor:      <QoRTrendPage/>,
    sdc:      <SDCToolsPage/>,
    advisor:  <FixesAdvisorPage logData={logData}/>,
  };

  return (
    <div style={{ display:"flex", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background:"#f8fafc", minHeight:"100vh" }}>
      <Sidebar active={active} setActive={setActive}/>
      <main style={{ flex:1, padding:"26px 30px", overflowY:"auto", maxHeight:"100vh" }}>
        {pages[active]}
      </main>
    </div>
  );
}
