import React from 'react';
import './CrystalLogo.css';
import { links } from './data'
import { SFX} from './scene_config';


export const LinkFooters: React.FC = () => {
  return (
<footer className="footer-overlay-links">
        
        {links.map((item, index) => {
          return (
            <a key={index} href={item.url} rel="noopener noreferrer" className="footer-nav-link" target="_blank" onMouseEnter={() => SFX.hover_pop.play()}>
              {item.name} 
            </a>
          
        )
          })}
</footer>
)
};