import React, { useContext, useMemo } from 'react';
import { Pagination as AntPagination } from 'antd';
import { ConfigContext } from 'antd/es/config-provider/context';
import type { PaginationProps } from 'antd';
import { VcIcon } from './icons/VcIcon';

/**
 * Ant Design Pagination，默认使用 VcIcon 的 chevron 系列（左 / 右 / 下）替代内置图标。
 * 仍可通过 props 传入 prevIcon / nextIcon 等覆盖。
 */
function Pagination(props: PaginationProps) {
  const { getPrefixCls, direction = 'ltr' } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('pagination', props.prefixCls);

  const {
    prevIcon,
    nextIcon,
    jumpPrevIcon,
    jumpNextIcon,
    showSizeChanger,
    total = 0,
    totalBoundaryShowSizeChanger = 50,
    ...rest
  } = props;

  const defaultIcons = useMemo(() => {
    const ellipsis = <span className={`${prefixCls}-item-ellipsis`}>•••</span>;

    const prevIconNode = (
      <button type="button" tabIndex={-1} className={`${prefixCls}-item-link`}>
        {direction === 'rtl' ? (
          <VcIcon type="chevron-right" fontSize={16} />
        ) : (
          <VcIcon type="chevron-left" fontSize={16} />
        )}
      </button>
    );
    const nextIconNode = (
      <button type="button" tabIndex={-1} className={`${prefixCls}-item-link`}>
        {direction === 'rtl' ? (
          <VcIcon type="chevron-left" fontSize={16} />
        ) : (
          <VcIcon type="chevron-right" fontSize={16} />
        )}
      </button>
    );

    const jumpPrevIconNode = (
      <a className={`${prefixCls}-item-link`}>
        <div className={`${prefixCls}-item-container`}>
          {direction === 'rtl' ? (
            <VcIcon type="a-chevron-rightdouble" className={`${prefixCls}-item-link-icon`} fontSize={16} />
          ) : (
            <VcIcon type="a-chevron-leftdouble" className={`${prefixCls}-item-link-icon`} fontSize={16} />
          )}
          {ellipsis}
        </div>
      </a>
    );
    const jumpNextIconNode = (
      <a className={`${prefixCls}-item-link`}>
        <div className={`${prefixCls}-item-container`}>
          {direction === 'rtl' ? (
            <VcIcon type="a-chevron-leftdouble" className={`${prefixCls}-item-link-icon`} fontSize={16} />
          ) : (
            <VcIcon type="a-chevron-rightdouble" className={`${prefixCls}-item-link-icon`} fontSize={16} />
          )}
          {ellipsis}
        </div>
      </a>
    );

    return {
      prevIcon: prevIconNode,
      nextIcon: nextIconNode,
      jumpPrevIcon: jumpPrevIconNode,
      jumpNextIcon: jumpNextIconNode,
    };
  }, [direction, prefixCls]);

  const mergedShowSizeChanger = useMemo(() => {
    const downIcon = <VcIcon type="chevron-down" fontSize={16} />;
    if (showSizeChanger === false) {
      return false;
    }
    if (showSizeChanger === true) {
      return { suffixIcon: downIcon };
    }
    if (showSizeChanger && typeof showSizeChanger === 'object') {
      return {
        ...showSizeChanger,
        suffixIcon: showSizeChanger.suffixIcon ?? downIcon,
      };
    }
    // 未传 showSizeChanger 时，与 rc-pagination 一致：total > boundary 时自动出现每页条数 Select，
    // 此时需注入 suffixIcon，否则仍为 antd 默认下拉箭头。
    if (total > totalBoundaryShowSizeChanger) {
      return { suffixIcon: downIcon };
    }
    return undefined;
  }, [showSizeChanger, total, totalBoundaryShowSizeChanger]);

  return (
    <AntPagination
      {...rest}
      total={total}
      totalBoundaryShowSizeChanger={totalBoundaryShowSizeChanger}
      showSizeChanger={mergedShowSizeChanger}
      prevIcon={prevIcon ?? defaultIcons.prevIcon}
      nextIcon={nextIcon ?? defaultIcons.nextIcon}
      jumpPrevIcon={jumpPrevIcon ?? defaultIcons.jumpPrevIcon}
      jumpNextIcon={jumpNextIcon ?? defaultIcons.jumpNextIcon}
    />
  );
}

Pagination.displayName = 'Pagination';

export default Pagination;
