import './navOrb.css';
export default function NavOrb({kind,still}:{kind:'earth'|'person';still:boolean}){return <span className={`nav-art-orb ${still?'nav-art-still':''}`} aria-hidden="true"><span className={`nav-art-image nav-art-${kind}`}/><span className="nav-art-shine"/></span>;}
