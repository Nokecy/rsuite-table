import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LAYER_WIDTH } from './constants';
import { isNullOrUndefined, defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import TableContext from './TableContext';
import Column from './Column';
import ArrowRight from '@rsuite/icons/ArrowRight';
import ArrowDown from '@rsuite/icons/ArrowDown';
import { StandardProps, RowDataType } from './@types/common';

export interface CellProps extends StandardProps {
  /** Data binding key, but also a sort of key */
  dataKey?: string;
  /** Row Number */
  rowIndex?: number;
  /** Row Data */
  rowData?: RowDataType;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  isHeaderCell?: boolean;
  width?: number;
  height?: number | ((rowData: RowDataType) => number);
  left?: number;
  headerHeight?: number;
  style?: React.CSSProperties;
  firstColumn?: boolean;
  lastColumn?: boolean;
  hasChildren?: boolean;
  children?: React.ReactNode | ((rowData: RowDataType, rowIndex: number) => React.ReactNode);
  rowKey?: string | number;
  depth?: number;
  wordWrap?: boolean;
  removed?: boolean;
  treeCol?: boolean;
  expanded?: boolean;
  onTreeToggle?: (
    rowKey?: string | number,
    rowIndex?: number,
    rowData?: RowDataType,
    event?: React.MouseEvent
  ) => void;

  renderTreeToggle?: (
    expandButton: React.ReactNode,
    rowData?: RowDataType,
    expanded?: boolean
  ) => React.ReactNode;
  renderCell?: (contentChildren: any) => React.ReactNode;
}

export const propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  dataKey: PropTypes.string,
  isHeaderCell: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  left: PropTypes.number,
  headerHeight: PropTypes.number,
  style: PropTypes.object,
  firstColumn: PropTypes.bool,
  lastColumn: PropTypes.bool,
  hasChildren: PropTypes.bool,
  children: PropTypes.any,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowIndex: PropTypes.number,
  rowData: PropTypes.object,
  depth: PropTypes.number,
  onTreeToggle: PropTypes.func,
  renderTreeToggle: PropTypes.func,
  renderCell: PropTypes.func,
  wordWrap: PropTypes.bool,
  removed: PropTypes.bool,
  treeCol: PropTypes.bool,
  expanded: PropTypes.bool,
  groupHeader: PropTypes.node,
  groupCount: PropTypes.number
};

class Cell extends React.PureComponent<CellProps> {
  static contextType = TableContext;
  static propTypes = propTypes;
  static defaultProps = {
    headerHeight: 36,
    depth: 0,
    height: 36,
    width: 0,
    left: 0
  };

  getClassPrefix = () =>
    this.props.classPrefix || defaultClassPrefix('table-cell', this.context.classPrefix);

  addPrefix = (name: string) => prefix(this.getClassPrefix())(name);

  isTreeCol() {
    const { treeCol, firstColumn } = this.props;
    const { hasCustomTreeCol, isTree } = this.context;

    if (treeCol) {
      return true;
    }

    if (!hasCustomTreeCol && firstColumn && isTree) {
      return true;
    }

    return false;
  }
  getHeight() {
    const { height, rowData } = this.props;
    return typeof height === 'function' ? height(rowData) : height;
  }

  handleExpandClick = (event: React.MouseEvent) => {
    const { rowKey, rowIndex, rowData } = this.props;
    this.props.onTreeToggle?.(rowKey, rowIndex, rowData, event);
  };
  renderTreeNodeExpandIcon() {
    const { rowData, renderTreeToggle, hasChildren, expanded } = this.props;
    const ExpandIconComponent = expanded ? ArrowDown : ArrowRight;
    const expandButton = <ExpandIconComponent className={this.addPrefix('expand-icon')} />;

    if (this.isTreeCol() && hasChildren) {
      return (
        <span
          role="button"
          tabIndex={-1}
          className={this.addPrefix('expand-wrapper')}
          onClick={this.handleExpandClick}
        >
          {renderTreeToggle ? renderTreeToggle(expandButton, rowData, expanded) : expandButton}
        </span>
      );
    }

    return null;
  }

  render() {
    const {
      width,
      left,
      style,
      className,
      firstColumn,
      lastColumn,
      isHeaderCell,
      headerHeight,
      align,
      children,
      rowData,
      dataKey,
      rowIndex,
      renderCell,
      removed,
      wordWrap,
      depth,
      verticalAlign,
      expanded,
      onClick,
      ...rest
    } = this.props;

    if (removed) {
      return null;
    }

    const classes = classNames(this.getClassPrefix(), className, {
      [this.addPrefix('expanded')]: expanded && this.isTreeCol(),
      [this.addPrefix('first')]: firstColumn,
      [this.addPrefix('last')]: lastColumn
    });
    const { rtl } = this.context;

    const nextHeight = isHeaderCell ? headerHeight : this.getHeight();
    const styles = {
      ...style,
      width,
      height: nextHeight,
      zIndex: depth,
      [rtl ? 'right' : 'left']: left
    };

    const contentStyles: React.CSSProperties = {
      width,
      height: nextHeight,
      textAlign: align,
      [rtl ? 'paddingRight' : 'paddingLeft']: this.isTreeCol() ? depth * LAYER_WIDTH + 10 : null
    };

    if (verticalAlign) {
      contentStyles.display = 'table-cell';
      contentStyles.verticalAlign = verticalAlign;
    }

    let cellContent = isNullOrUndefined(children) && rowData ? rowData[dataKey] : children;

    if (typeof children === 'function') {
      cellContent = children(rowData, rowIndex);
    }

    const unhandledProps = getUnhandledProps(propTypes, getUnhandledProps(Column.propTypes, rest));
    const cell = renderCell ? renderCell(cellContent) : cellContent;
    const content = wordWrap ? (
      <div className={this.addPrefix('wrap')}>
        {this.renderTreeNodeExpandIcon()}
        {cell}
      </div>
    ) : (
      <React.Fragment>
        {this.renderTreeNodeExpandIcon()}
        {cell}
      </React.Fragment>
    );

    return (
      <div
        role={isHeaderCell ? 'columnheader' : 'gridcell'}
        {...unhandledProps}
        onClick={onClick}
        className={classes}
        style={styles}
      >
        <div className={this.addPrefix('content')} style={contentStyles}>
          {content}
        </div>
      </div>
    );
  }
}

export default Cell;
