import React from 'react';
import Link from 'next/link';
// 
export default function FNextLink(props) {
  const { href, children, ...rest } = props;
  return (
    <Link href={href} {...rest}>
      <a {...rest}>
        {children}
      </a>
    </Link>
  );
}

export const FNavbarLink = React.forwardRef(({ onClick, href, children, ...rest }, ref) => {
  return (
    <a href={href} onClick={onClick} ref={ref} {...rest}>
      {children}
    </a>
  )
})