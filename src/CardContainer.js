import React from 'react';
import './CardContainer.scss';
import { classes } from './common';

function CardContainer({ row, column, ratio, children }) {
  return (
    <div className={classes('CardContainer', row && 'row', column && 'column')} style={{ flexGrow: ratio }}>
      {children}
    </div>
  );
}

export default CardContainer;