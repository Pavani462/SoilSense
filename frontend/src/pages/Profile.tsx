import {Link,useNavigate} from 'react-router-dom';
import {UserCircle,LogOut,History as HistoryIcon,ShieldCheck,Mail,CalendarDays} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';

export default function Profile(){
  const {user,signOut}=useAuth();
  const {t}=useLanguage();
  const navigate=useNavigate();
  if(!user) return <div className="page narrow"><div className="empty-state"><h2>{t('auth.loginToHistory')}</h2><Link className="btn primary" to="/login">{t('auth.login')}</Link></div></div>;
  const created=user.created_at ? new Date(user.created_at).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}) : '—';
  const verified=Boolean(user.email_confirmed_at);
  const initials=(user.email?.[0]||'S').toUpperCase();
  return <div className="page profile-page">
    <div className="profile-shell">
      <div className="profile-heading">
        <div><span className="eyebrow">{t('auth.account')}</span><h1>{t('auth.profile')}</h1><p>{t('auth.profileDesc')}</p></div>
        <Link className="btn ghost" to="/history"><HistoryIcon size={16}/>{t('nav.history')}</Link>
      </div>
      <section className="profile-overview">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-identity"><h2>{user.email}</h2><p>{t('auth.member')}</p></div>
        <span className={verified?'profile-status verified':'profile-status'}><ShieldCheck size={15}/>{verified?t('auth.verified'):t('auth.unverified')}</span>
      </section>
      <section className="account-details">
        <div className="account-detail"><span className="detail-icon"><Mail size={17}/></span><div><small>{t('auth.email')}</small><strong>{user.email}</strong></div></div>
        <div className="account-detail"><span className="detail-icon"><CalendarDays size={17}/></span><div><small>{t('auth.memberSince')}</small><strong>{created}</strong></div></div>
      </section>
      <section className="profile-security"><div className="security-icon"><ShieldCheck size={19}/></div><div><h3>{t('auth.securityTitle')}</h3><p>{t('auth.securityDesc')}</p></div></section>
      <div className="profile-actions professional-actions"><Link className="btn ghost" to="/history"><HistoryIcon size={16}/>{t('auth.viewHistory')}</Link><button className="btn primary" onClick={async()=>{await signOut();navigate('/')}}><LogOut size={16}/>{t('auth.logout')}</button></div>
    </div>
  </div>;
}
