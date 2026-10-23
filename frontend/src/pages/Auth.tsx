import {FormEvent,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {Leaf,Mail,Lock,LogIn,UserPlus} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';

export default function Auth(){
  const {user,signIn,signUp}=useAuth();
  const {t}=useLanguage();
  const navigate=useNavigate();
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState(''); const [error,setError]=useState('');
  if(user) return <div className="page narrow"><div className="auth-card"><span className="eyebrow">{t('auth.account')}</span><h1>{t('auth.alreadySignedIn')}</h1><p>{user.email}</p><Link className="btn primary" to="/history">{t('nav.history')}</Link></div></div>;
  const submit=async(e:FormEvent)=>{e.preventDefault();setError('');setMessage('');setBusy(true);if(password.length<6){setError(t('auth.passwordShort'));setBusy(false);return;}try{if(mode==='login'){const r=await signIn(email,password);if(r.error)setError(r.error.message);else navigate('/history');}else{const r=await signUp(email,password);if(r.error)setError(r.error.message);else if(r.needsConfirmation)setMessage(t('auth.confirmation'));else navigate('/history');}}finally{setBusy(false)}};
  return <div className="page narrow"><div className="auth-card"><div className="auth-brand"><span className="brand-icon"><Leaf size={20}/></span><strong>Soil<span>Sense</span></strong></div><span className="eyebrow">{mode==='login'?t('auth.loginEyebrow'):t('auth.signupEyebrow')}</span><h1>{mode==='login'?t('auth.loginTitle'):t('auth.signupTitle')}</h1><p>{mode==='login'?t('auth.loginDesc'):t('auth.signupDesc')}</p><form onSubmit={submit} className="auth-form"><label><span><Mail size={15}/> {t('auth.email')}</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="farmer@example.com"/></label><label><span><Lock size={15}/> {t('auth.password')}</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="••••••••"/></label>{error&&<div className="form-error">{error}</div>}{message&&<div className="form-success">{message}</div>}<button className="btn primary full" disabled={busy}>{mode==='login'?<LogIn size={16}/>:<UserPlus size={16}/>} {busy?t('common.loading'):(mode==='login'?t('auth.login'):t('auth.signup'))}</button></form><p className="auth-switch">{mode==='login'?t('auth.noAccount'):t('auth.haveAccount')} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('')}}>{mode==='login'?t('auth.createAccount'):t('auth.login')}</button></p></div></div>
}
