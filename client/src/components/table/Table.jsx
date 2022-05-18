import React, { useRef, useState } from 'react';

import './table.css';

const Table = props => {
  const { bodyData, headData, pageRange, changePage } = props;

  const curPage = useRef(1);

  const selectPage = pageNumber => {
    changePage(pageNumber);
    curPage.current = pageNumber;
  };

  return (
    <div>
      <div className="table-wrapper">
        <table>
          {props.headData && props.renderHead ? (
            <thead>
              <tr>{props.headData.map((item, index) => props.renderHead(item, index))}</tr>
            </thead>
          ) : null}
          {props.bodyData && props.renderBody ? (
            <tbody>{bodyData.map((item, index) => props.renderBody(item, index))}</tbody>
          ) : null}
        </table>
      </div>
      {pageRange > 1 ? (
        <div className="table__pagination">
          {Array(pageRange)
            .fill(0)
            .map((item, index) => (
              <div
                key={index}
                className={`table__pagination-item ${
                  curPage.current === index + 1 ? 'active' : ''
                }`}
                onClick={() => selectPage(index + 1)}>
                {index + 1}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
};

export default Table;
