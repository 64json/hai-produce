import React from 'react';
import { classes } from './common';
import './Row.scss';

function Row({ className, children, label }) {
  return (
    <div className={classes('Row', className)}>
      <div className="label">
        {label}
      </div>
      <div className="value">
        {children}
      </div>
    </div>
  );
}

export default Row;
