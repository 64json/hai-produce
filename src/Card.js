import React, { useEffect, useRef, useState } from 'react';
import './Card.scss';
import { classes } from './common';

function Card({ className, title, ratio, children, visualization, onResize, defaultTab = 0 }) {
  const [tab, setTab] = useState(defaultTab);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (onResize) {
      const handleResize = () => {
        const bodyEl = bodyRef.current;
        if (!bodyEl) return;
        const { clientWidth: width, clientHeight: height } = bodyEl;
        onResize({ width, height });
      };
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [onResize]);

  return (
    <div className={classes('Card', className)} style={{ flexGrow: ratio }}>
      {
        title &&
        <div className="cardHeader">
          <div className="title">
            {title}
          </div>
          {
            visualization &&
            <div className="toggle" onClick={() => setTab(1 - tab)}/>
          }
        </div>
      }
      {
        !title && visualization &&
        <div className="toggle overlay" onClick={() => setTab(1 - tab)}/>
      }
      <div className="cardBody" ref={bodyRef}>
        {[visualization, children].filter(v => v)[tab]}
      </div>
    </div>
  );
}

export default Card;