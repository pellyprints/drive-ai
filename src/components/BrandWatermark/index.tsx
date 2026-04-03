'use client';

import { type FlexboxProps } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

const BrandWatermark = memo<Omit<FlexboxProps, 'children'>>(({ style, ...rest }) => {
  return (
    <Flexbox
      horizontal
      align={'center'}
      dir={'ltr'}
      flex={'none'}
      gap={4}
      style={{ color: cssVar.colorTextDescription, fontSize: 12, ...style }}
      {...rest}
    >
      <span>© {new Date().getFullYear()} Pelly Enterprises</span>
    </Flexbox>
  );
});

export default BrandWatermark;
