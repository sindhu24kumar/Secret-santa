"use client";

import { useMemo, useState } from "react";
import {
  Gift, Sparkles, Users, Heart, CalendarDays, ArrowUpRight, Plus,
  ChevronRight, LockKeyhole, Snowflake, Copy, Check, Settings2,
  MessageCircle, CircleHelp, WandSparkles, LogIn, ShieldCheck, X
} from "lucide-react";

type Participant = { name: string; email: string; status: "Joined" | "Invited" };
const initialPeople: Participant[] = [
  { name: "Sindhu", email: "you@example.com", status: "Joined" },
  { name: "Akash", email: "akash@example.com", status: "Joined" },
  { name: "Priya", email: "priya@example.com", status: "Joined" },
  { name: "Karthik", email: "karthik@example.com", status: "Joined" },
  { name: "Meera", email: "meera@example.com", status: "Invited" },
];

export default function Home() {
  const [people, setPeople] = useState(initialPeople);
  const [activeTab, setActiveTab] = useState("Overview");
  const [modal, setModal] = useState<"create" | "invite" | "wishlist" | "draw" | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [toast, setToast] = useState("");
  const [drawn, setDrawn] = useState(false);
  const [budget, setBudget] = useState("₹1,000");
  const [eventDate, setEventDate] = useState("2026-12-20");
  const [wish, setWish] = useState("Books, coffee, cozy things");
  const joined = people.filter(p => p.status === "Joined").length;
  const progress = Math.round((joined / Math.max(people.length, 1)) * 100);
  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2800); };
  const addPerson = () => {
    if (!newName.trim() || !newEmail.includes("@")) { showToast("Add a name and a valid email first."); return; }
    if (people.some(p => p.email.toLowerCase() === newEmail.trim().toLowerCase())) { showToast("That email is already on the list."); return; }
    setPeople(p => [...p, { name: newName.trim(), email: newEmail.trim(), status: "Invited" }]);
    setNewName(""); setNewEmail(""); setModal(null); showToast("Participant added to this preview.");
  };
  const nav = [
    { name: "Overview", icon: Sparkles }, { name: "Participants", icon: Users },
    { name: "Wishlists", icon: Heart }, { name: "Settings", icon: Settings2 },
  ];
  const decorations = useMemo(() => Array.from({length: 15}, (_,i) => ({ left: `${(i*37+9)%100}%`, delay: `${(i%7)*.7}s`, duration: `${8+(i%5)*2}s`, size: `${5+(i%4)*2}px` })), []);

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="snow-layer" aria-hidden="true">{decorations.map((d,i)=><span key={i} style={{left:d.left,animationDelay:d.delay,animationDuration:d.duration,width:d.size,height:d.size}} />)}</div>
      <aside className="sidebar">
        <a className="brand" href="#" onClick={e=>{e.preventDefault();setActiveTab("Overview")}}>
          <span className="brand-mark"><Gift size={22}/><span className="brand-spark">✦</span></span>
          <span><strong>holly<span>&</span>hush</strong><small>THE SECRET SANTA CLUB</small></span>
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <div className="workspace-card"><div className="workspace-icon">🎄</div><div><strong>The Cozy Crew</strong><small>Holiday exchange · 2026</small></div><ChevronRight size={16}/></div>
        <nav className="side-nav" aria-label="Main navigation">
          {nav.map(item => { const Icon = item.icon; return <button key={item.name} className={`nav-item ${activeTab===item.name?"active":""}`} onClick={()=>setActiveTab(item.name)}><Icon size={18}/><span>{item.name}</span>{item.name==="Wishlists"&&<span className="nav-count">5</span>}</button> })}
        </nav>
        <div className="sidebar-spacer"/>
        <div className="privacy-note"><LockKeyhole size={16}/><div><strong>Your secrets stay secret.</strong><p>Santa assignments are private to each participant.</p></div></div>
        <button className="profile-row" onClick={()=>showToast("Google sign-in is not connected in preview mode.")}><div className="avatar avatar-gold">S</div><div><strong>Sindhu</strong><small>Organizer · Preview mode</small></div><ChevronRight size={16}/></button>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>My exchanges</span><ChevronRight size={14}/><strong>The Cozy Crew</strong></div>
          <div className="top-actions"><span className="secure-pill"><span/> Private group</span><button className="icon-button" aria-label="Help" onClick={()=>showToast("Help center: coming soon.")}><CircleHelp size={19}/></button><button className="user-chip" onClick={()=>showToast("Google sign-in is not connected in preview mode.")}><span className="avatar avatar-gold">S</span><span>Sindhu</span><ChevronRight size={14}/></button></div>
        </header>

        <div className="content">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><Sparkles size={13}/> THE MOST WONDERFUL LITTLE MYSTERY</div>
              <h1>A little mystery.<br/><em>A lot of magic.</em></h1>
              <p>Your holiday exchange is taking shape. Gather your people, set the rules, and let the gift-giving magic happen.</p>
              <div className="hero-buttons"><button className="button button-gold" onClick={()=>setModal("draw")}><WandSparkles size={17}/> {drawn?"View draw status":"Prepare the draw"}<ArrowUpRight size={16}/></button><button className="button button-ghost" onClick={()=>setModal("invite")}><Plus size={17}/> Invite a friend</button></div>
              <div className="hero-footnote"><LockKeyhole size={13}/> Your assignments are hidden from everyone but you.</div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
              <div className="star star-one">✦</div><div className="star star-two">✧</div><div className="star star-three">✦</div>
              <div className="gift gift-back"><div className="gift-ribbon"/><div className="gift-bow"/></div>
              <div className="gift gift-front"><div className="gift-ribbon"/><div className="gift-bow"/><span>with love</span></div>
              <div className="art-caption"><span>✧</span> THE GIFT OF SURPRISE <span>✧</span></div>
            </div>
            <div className="hero-grain"/>
          </section>

          {activeTab==="Overview" && <>
            <div className="section-heading"><div><span className="section-kicker">THE PLAN</span><h2>Your merry little overview</h2></div><button className="text-button" onClick={()=>setActiveTab("Settings")}>Manage exchange <ArrowUpRight size={15}/></button></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-top"><span className="stat-icon green"><Users size={18}/></span><span className="stat-trend">THE CREW</span></div><div className="stat-number">{people.length}<span> people</span></div><div className="stat-bottom">{joined} joined · {people.length-joined} invited</div><div className="mini-avatars">{people.slice(0,5).map((p,i)=><span key={p.email} className={`mini-avatar av-${i%5}`}>{initials(p.name)}</span>)}</div></div>
              <div className="stat-card"><div className="stat-top"><span className="stat-icon gold"><Gift size={18}/></span><span className="stat-trend">THE BUDGET</span></div><div className="stat-number">{budget}<span> / gift</span></div><div className="stat-bottom">A little thought goes a long way.</div><button className="inline-edit" onClick={()=>setActiveTab("Settings")}>Edit budget <ChevronRight size={13}/></button></div>
              <div className="stat-card"><div className="stat-top"><span className="stat-icon rose"><CalendarDays size={18}/></span><span className="stat-trend">THE BIG DAY</span></div><div className="stat-number">{new Date(eventDate+"T12:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}<span> 2026</span></div><div className="stat-bottom">Gift exchange day. Cue the happy chaos.</div><button className="inline-edit" onClick={()=>setActiveTab("Settings")}>Edit date <ChevronRight size={13}/></button></div>
            </div>
            <div className="lower-grid">
              <div className="panel participants-panel"><div className="panel-heading"><div><h3>The people behind the presents</h3><p>Your exchange crew, all in one place.</p></div><button className="small-outline" onClick={()=>setActiveTab("Participants")}>View all <ArrowUpRight size={14}/></button></div>
                <div className="people-list">{people.slice(0,4).map((p,i)=><div className="person-row" key={p.email}><div className={`avatar av-${i%5}`}>{initials(p.name)}</div><div className="person-info"><strong>{p.name}{i===0&&<span className="you-tag">YOU</span>}</strong><small>{p.email}</small></div><span className={`status ${p.status==="Joined"?"joined":"invited"}`}><span/>{p.status}</span><button className="row-more" aria-label={`Options for ${p.name}`} onClick={()=>showToast(`${p.name}: participant actions are preview-only.`)}>···</button></div>)}</div>
                <button className="add-person" onClick={()=>setModal("invite")}><Plus size={16}/> Invite someone lovely</button>
              </div>
              <div className="right-column">
                <div className="panel progress-panel"><div className="panel-heading"><div><h3>Gathering the gang</h3><p>Every Santa starts somewhere.</p></div><span className="progress-number">{progress}%</span></div><div className="progress-track"><span style={{width:`${progress}%`}}/></div><div className="progress-labels"><span>{joined} of {people.length} joined</span><span>{people.length-joined} to go</span></div><div className="progress-note"><Sparkles size={16}/><span>{joined===people.length?"The whole crew is here. Let the magic begin!":"A gentle nudge to the remaining invitees might do the trick."}</span></div></div>
                <div className="quote-card"><div className="quote-spark">✦</div><p>“The best gifts aren't things. They're little reminders that someone knows you.”</p><span>A LITTLE HOLIDAY WISDOM</span><div className="quote-decoration">❄</div></div>
              </div>
            </div>
          </>}

          {activeTab==="Participants" && <section className="panel full-panel"><div className="panel-heading"><div><h3>Your exchange crew</h3><p>Manage the people taking part in this exchange.</p></div><button className="button button-green" onClick={()=>setModal("invite")}><Plus size={16}/> Invite a friend</button></div><div className="people-list">{people.map((p,i)=><div className="person-row" key={p.email}><div className={`avatar av-${i%5}`}>{initials(p.name)}</div><div className="person-info"><strong>{p.name}{i===0&&<span className="you-tag">YOU</span>}</strong><small>{p.email}</small></div><span className={`status ${p.status==="Joined"?"joined":"invited"}`}><span/>{p.status}</span><button className="row-more" onClick={()=>showToast("Participant management requires a connected backend.")}>···</button></div>)}</div></section>}

          {activeTab==="Wishlists" && <section className="panel full-panel"><div className="panel-heading"><div><h3>Little things they'd love</h3><p>Wishlist previews for your exchange. Keep the surprises intact.</p></div><button className="button button-green" onClick={()=>setModal("wishlist")}><Heart size={16}/> Edit my wishlist</button></div><div className="wishlist-grid"><div className="wishlist-card"><span className="wish-emoji">📚</span><strong>Books & stories</strong><p>Something I can get lost in.</p></div><div className="wishlist-card"><span className="wish-emoji">☕</span><strong>Cozy comforts</strong><p>Coffee, candles, warm things.</p></div><div className="wishlist-card"><span className="wish-emoji">🎨</span><strong>Creative little things</strong><p>Stationery and thoughtful finds.</p></div></div><div className="demo-notice"><LockKeyhole size={15}/> This is sample wishlist content for the UI preview, not data from other participants.</div></section>}

          {activeTab==="Settings" && <section className="panel full-panel settings-panel"><div className="panel-heading"><div><h3>Make it your kind of Christmas</h3><p>Exchange settings for The Cozy Crew.</p></div><span className="preview-label">PREVIEW SETTINGS</span></div><label className="field-label">Exchange name<input value="The Cozy Crew" readOnly/></label><div className="form-two"><label className="field-label">Gift budget<input value={budget} onChange={e=>setBudget(e.target.value)} /></label><label className="field-label">Gift exchange date<input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} /></label></div><div className="setting-row"><div className="setting-icon"><Heart size={18}/></div><div><strong>Wishlist prompts</strong><p>Ask participants what they'd love to receive.</p></div><span className="toggle on"><i/></span></div><div className="setting-row"><div className="setting-icon"><ShieldCheck size={18}/></div><div><strong>Pairing exclusions</strong><p>Prevent selected pairs from drawing each other.</p></div><button className="small-outline" onClick={()=>showToast("Exclusion editor is planned for the connected backend.")}>Configure</button></div><div className="setting-row"><div className="setting-icon"><MessageCircle size={18}/></div><div><strong>Anonymous messages</strong><p>Let Santas ask their recipient for hints.</p></div><span className="toggle on"><i/></span></div><button className="button button-green" onClick={()=>showToast("Settings saved in this preview session only.")}>Save preview settings</button></section>}

          <footer className="footer"><span>MADE WITH <span className="footer-heart">♥</span> AND A LITTLE HOLIDAY MISCHIEF</span><span>HOLLY & HUSH · 2026</span></footer>
        </div>
      </section>

      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
      {modal && <div className="modal-backdrop" onClick={()=>setModal(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setModal(null)} aria-label="Close"><X size={19}/></button>
        {modal==="invite" && <><div className="modal-icon"><Users size={22}/></div><span className="section-kicker">THE MORE, THE MERRIER</span><h2>Invite someone lovely</h2><p>Add a friend to your exchange. In the real app, they'll receive a secure invitation link.</p><label className="field-label">Their name<input autoFocus placeholder="e.g. Jamie Parker" value={newName} onChange={e=>setNewName(e.target.value)}/></label><label className="field-label">Email address<input type="email" placeholder="jamie@example.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)}/></label><button className="button button-green modal-submit" onClick={addPerson}>Add participant <ArrowUpRight size={16}/></button><small className="modal-footnote">Preview only · no emails are sent.</small></>}
        {modal==="draw" && <><div className="modal-icon"><Gift size={22}/></div><span className="section-kicker">THE MOMENT OF MYSTERY</span><h2>{drawn?"Your draw is still a preview":"Ready to make some magic?"}</h2><p>{drawn?"The preview records that you clicked the draw button, but it has not generated or stored real assignments.":"A real draw privately assigns each participant one recipient, with no self-draws and all exclusions respected."}</p><div className="draw-checks"><div><Check size={16}/> Each person gives and receives once</div><div><Check size={16}/> No one draws themselves</div><div><Check size={16}/> Pairing exclusions are respected</div><div><LockKeyhole size={16}/> Assignments stay private</div></div><div className="demo-notice"><ShieldCheck size={16}/> This preview will not generate real assignments or notify anyone.</div><button className="button button-green modal-submit" onClick={()=>{setDrawn(true);setModal(null);showToast("Preview only: no assignments were generated.")}}>{drawn?"Close":"Preview draw setup"} <Sparkles size={16}/></button></>}
        {modal==="wishlist" && <><div className="modal-icon"><Heart size={22}/></div><span className="section-kicker">A FEW HINTS FOR YOUR SANTA</span><h2>Your wishlist</h2><p>Give your Santa a few clues. Specific is helpful; demanding a pony is a bold strategy.</p><label className="field-label">Things I'd love<textarea rows={4} value={wish} onChange={e=>setWish(e.target.value)}/></label><button className="button button-green modal-submit" onClick={()=>{setModal(null);showToast("Wishlist saved in this preview session only.")}}>Save wishlist <Heart size={16}/></button></>}
        {modal==="create" && <><div className="modal-icon"><Gift size={22}/></div><h2>Create an exchange</h2><p>Exchange creation is part of the planned backend integration.</p><button className="button button-green modal-submit" onClick={()=>setModal(null)}>Got it</button></>}
      </div></div>}
    </main>
  );
}
